import { body, param, query } from "express-validator";

export const listBranchesValidation = [
  query("status").optional().isIn(["active", "inactive", "deleted"]).withMessage("Invalid status."),
  query("name").optional().isString().trim(),
  query("code").optional().isString().trim(),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
];

export const branchIdValidation = [
  param("branchId").isMongoId().withMessage("Invalid branch ID."),
];

export const createBranchValidation = [
  body("name").notEmpty().withMessage("Branch name is required."),
  body("code").notEmpty().withMessage("Branch code is required."),
  body("address").optional().isString().trim(),
  body("phone").optional().isString().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status."),
];

export const updateBranchValidation = [
  param("branchId").isMongoId().withMessage("Invalid branch ID."),
  body("name").optional().notEmpty().withMessage("Branch name cannot be empty."),
  body("code").optional().notEmpty().withMessage("Branch code cannot be empty."),
  body("address").optional().isString().trim(),
  body("phone").optional().isString().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status."),
];

export const deleteBranchValidation = [
  param("branchId").isMongoId().withMessage("Invalid branch ID."),
];
