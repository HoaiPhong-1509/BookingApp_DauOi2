import { body, param, query } from "express-validator";

// Validate list users query
export const listUsersValidation = [
  query("status").optional().isIn(["pending", "active", "blocked", "deleted"]).withMessage("Invalid status."),
  query("role").optional().isIn(["admin", "manager", "employee"]).withMessage("Invalid role."),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
];

// Validate user ID
export const userIdValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
];

// Validate approve/reject user
export const approveUserValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
];

export const rejectUserValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
  body("reason").optional().isString().trim(),
];

// Validate lock/unlock user
export const lockUserValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
];

export const unlockUserValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
];

// Validate change role
export const changeRoleValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
  body("role").isIn(["admin", "manager", "employee"]).withMessage("Invalid role. Must be admin, manager, or employee."),
];

// Validate assign branch
export const assignBranchValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
  body("branchId").isMongoId().withMessage("Invalid branch ID."),
];

// Validate delete user (soft delete)
export const deleteUserValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID."),
];
