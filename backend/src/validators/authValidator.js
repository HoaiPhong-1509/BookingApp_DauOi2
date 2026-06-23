import { body } from "express-validator";

export const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("email").trim().toLowerCase().isEmail().withMessage("Email is invalid."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("phone").optional().isString().trim(),
];

export const loginValidation = [
  body("email").trim().toLowerCase().isEmail().withMessage("Email is invalid."),
  body("password").notEmpty().withMessage("Password is required."),
];
