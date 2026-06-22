import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  listUsers,
  getUser,
  approveUser,
  rejectUser,
  lockUser,
  unlockUser,
  changeRole,
  assignBranch,
  deleteUser,
} from "../controllers/userController.js";
import {
  listUsersValidation,
  userIdValidation,
  approveUserValidation,
  rejectUserValidation,
  lockUserValidation,
  unlockUserValidation,
  changeRoleValidation,
  assignBranchValidation,
  deleteUserValidation,
} from "../validators/userValidator.js";

const router = express.Router();

// Tất cả routes chỉ cho phép admin
router.use(protect, authorize("admin"));

/**
 * Lấy danh sách users
 * GET /api/admin/users?status=pending&role=employee&page=1&limit=20
 */
router.get("/", listUsersValidation, listUsers);

/**
 * Lấy chi tiết user
 * GET /api/admin/users/:userId
 */
router.get("/:userId", userIdValidation, getUser);

/**
 * Duyệt tài khoản (pending → active)
 * PATCH /api/admin/users/:userId/approve
 */
router.patch("/:userId/approve", approveUserValidation, approveUser);

/**
 * Từ chối tài khoản (pending → deleted)
 * PATCH /api/admin/users/:userId/reject
 */
router.patch("/:userId/reject", rejectUserValidation, rejectUser);

/**
 * Khóa tài khoản (active → blocked)
 * PATCH /api/admin/users/:userId/lock
 */
router.patch("/:userId/lock", lockUserValidation, lockUser);

/**
 * Mở khóa tài khoản (blocked → active)
 * PATCH /api/admin/users/:userId/unlock
 */
router.patch("/:userId/unlock", unlockUserValidation, unlockUser);

/**
 * Đổi role
 * PATCH /api/admin/users/:userId/role
 * Body: { role: "admin" | "manager" | "employee" }
 */
router.patch("/:userId/role", changeRoleValidation, changeRole);

/**
 * Gán chi nhánh
 * PATCH /api/admin/users/:userId/branch
 * Body: { branchId: "..." }
 */
router.patch("/:userId/branch", assignBranchValidation, assignBranch);

/**
 * Xóa user (soft delete)
 * DELETE /api/admin/users/:userId
 */
router.delete("/:userId", deleteUserValidation, deleteUser);

export default router;
