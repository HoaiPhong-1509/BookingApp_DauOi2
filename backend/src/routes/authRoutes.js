import express from "express";
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

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
