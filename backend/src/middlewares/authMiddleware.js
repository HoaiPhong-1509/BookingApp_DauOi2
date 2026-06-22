import User from "../models/User.js";
import { verifyAccessToken } from "../utils/tokenService.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found.",
        errors: [],
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user || user.isDeleted || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user access denied.",
        errors: [],
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      errors: [],
    });
  }
};
