import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
} from "../controllers/authController.js";
import validate from "../middlewares/validateMiddleware.js";
import { registerValidation, loginValidation } from "../validators/authValidator.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only failed login attempts need a strict IP-based limit. Successful logins
// do not consume the quota, so staff sharing one café network are unaffected.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Math.max(5, Number(process.env.LOGIN_RATE_LIMIT_MAX || 15)),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.",
    code: "LOGIN_RATE_LIMITED",
    errors: [],
  },
});

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginLimiter, loginValidation, validate, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
