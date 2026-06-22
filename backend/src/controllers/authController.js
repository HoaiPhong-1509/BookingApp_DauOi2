import User from "../models/User.js";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  rotateRefreshToken,
  revokeToken,
  revokeTokenFamily,
} from "../utils/tokenService.js";

const buildUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  branchId: user.branchId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name || rest.length === 0) return cookies;
    cookies[name] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
};

const getRefreshTokenFromRequest = (req) => {
  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.refreshToken || null;
};

const sendRefreshTokenCookie = (res, token) => {
  const maxAge = Number(process.env.REFRESH_TOKEN_IDLE_DAYS || 7) * 24 * 60 * 60 * 1000;
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/auth",
    maxAge,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    path: "/api/auth",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use.",
        errors: [],
      });
    }

    const user = new User({
      fullName,
      email,
      passwordHash: password,
      phone,
      role: "employee",
      status: "pending",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful. Please wait for activation.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
        errors: [],
      });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
        errors: [],
      });
    }

    if (user.isDeleted || user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active.",
        errors: [],
      });
    }

    const accessToken = createAccessToken(user._id);
    const { token: refreshToken } = await createRefreshToken({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "unknown",
    });

    user.lastLoginAt = new Date();
    await user.save();

    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        user: buildUserResponse(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found.",
        errors: [],
      });
    }

    const { reuseDetected, tokenDoc, newToken } = await rotateRefreshToken({
      currentToken: refreshTokenValue,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "unknown",
    });

    if (reuseDetected) {
      // Phát hiện reuse: token đã bị revoke và vẫn tiếp tục dùng lại.
      await revokeTokenFamily(tokenDoc.familyId, req.ip);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token reuse detected. Please login again.",
        errors: [],
      });
    }

    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
        errors: [],
      });
    }

    if (Date.now() >= tokenDoc.expiresAt.getTime() || Date.now() >= tokenDoc.absoluteExpiresAt.getTime()) {
      await revokeToken(hashToken(refreshTokenValue), req.ip);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
        errors: [],
      });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || user.isDeleted || user.status !== "active") {
      await revokeTokenFamily(tokenDoc.familyId, req.ip);
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "User is no longer active.",
        errors: [],
      });
    }

    const accessToken = createAccessToken(user._id);
    sendRefreshTokenCookie(res, newToken);

    res.json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshTokenValue = getRefreshTokenFromRequest(req);
    if (refreshTokenValue) {
      await revokeToken(hashToken(refreshTokenValue), req.ip);
    }

    clearRefreshTokenCookie(res);
    res.json({
      success: true,
      message: "Logout successful.",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
        errors: [],
      });
    }

    res.json({
      success: true,
      message: "User profile fetched successfully.",
      data: buildUserResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};
