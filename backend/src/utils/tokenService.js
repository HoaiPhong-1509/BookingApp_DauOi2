import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";

const defaultAccessExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "15m";
const refreshIdleDays = Number(process.env.REFRESH_TOKEN_IDLE_DAYS || 7);
const refreshAbsoluteDays = Number(process.env.REFRESH_TOKEN_ABSOLUTE_DAYS || 30);

// Tạo access token ngắn hạn dùng để xác thực API.
// Access token không lưu trạng thái trên server vì chỉ cần xác minh bằng secret.
export const createAccessToken = (userId) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined.");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: defaultAccessExpiry }
  );
};

// Xác minh access token khi request vào route cần bảo vệ.
export const verifyAccessToken = (token) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined.");
  }

  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// Refresh token được tạo bằng random bytes và không dùng JWT.
// Token raw chỉ gửi về client, không lưu dưới dạng plain text trong database.
export const generateRefreshTokenString = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Hash refresh token trước khi lưu để tránh lộ token nếu db bị dò.
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const createRefreshToken = async ({ userId, ipAddress, userAgent }) => {
  const token = generateRefreshTokenString();
  const tokenHash = hashToken(token);
  const familyId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + refreshIdleDays * 24 * 60 * 60 * 1000);
  const absoluteExpiresAt = new Date(now.getTime() + refreshAbsoluteDays * 24 * 60 * 60 * 1000);

  const refreshTokenDoc = await RefreshToken.create({
    userId,
    tokenHash,
    familyId,
    expiresAt,
    absoluteExpiresAt,
    createdByIp: ipAddress,
    userAgent,
  });

  return {
    token,
    tokenHash,
    refreshTokenDoc,
  };
};

export const rotateRefreshToken = async ({ currentToken, userId, ipAddress, userAgent }) => {
  const hashed = hashToken(currentToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash: hashed });

  if (!tokenDoc) {
    return { reuseDetected: false, tokenDoc: null };
  }

  if (tokenDoc.revokedAt) {
    // Nếu token đã bị revoke nhưng đã được thay thế bằng token mới,
    // có thể đây là request refresh trùng lặp từ tab khác.
    if (tokenDoc.replacedByTokenHash) {
      const replacement = await RefreshToken.findOne({
        tokenHash: tokenDoc.replacedByTokenHash,
        revokedAt: null,
      });
      if (replacement) {
        // Token cũ đã bị thay bằng token mới và token mới vẫn còn hoạt động.
        // Trả về null để client chỉ cần login lại nếu cần, không revoke toàn bộ gia đình ngay.
        return { reuseDetected: false, tokenDoc: null };
      }
    }

    return { reuseDetected: true, tokenDoc };
  }

  if (Date.now() >= tokenDoc.expiresAt.getTime() || Date.now() >= tokenDoc.absoluteExpiresAt.getTime()) {
    return { reuseDetected: false, tokenDoc };
  }

  const newToken = generateRefreshTokenString();
  const newTokenHash = hashToken(newToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + refreshIdleDays * 24 * 60 * 60 * 1000);

  const newRefreshTokenDoc = await RefreshToken.create({
    userId,
    tokenHash: newTokenHash,
    familyId: tokenDoc.familyId,
    expiresAt,
    absoluteExpiresAt: tokenDoc.absoluteExpiresAt,
    createdByIp: ipAddress,
    userAgent,
  });

  // Revoke refresh token cũ ngay khi sinh token mới (rotation).
  tokenDoc.revokedAt = now;
  tokenDoc.revokedByIp = ipAddress;
  tokenDoc.replacedByTokenHash = newTokenHash;
  await tokenDoc.save();

  return { reuseDetected: false, tokenDoc: newRefreshTokenDoc, newToken };
};

export const revokeToken = async (tokenHash, ipAddress) => {
  const tokenDoc = await RefreshToken.findOne({ tokenHash });
  if (!tokenDoc || tokenDoc.revokedAt) {
    return null;
  }

  tokenDoc.revokedAt = new Date();
  tokenDoc.revokedByIp = ipAddress;
  await tokenDoc.save();
  return tokenDoc;
};

export const revokeTokenFamily = async (familyId, ipAddress) => {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { revokedAt: new Date(), revokedByIp: ipAddress }
  );
};

export const revokeAllUserTokens = async (userId, ipAddress) => {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date(), revokedByIp: ipAddress }
  );
};
