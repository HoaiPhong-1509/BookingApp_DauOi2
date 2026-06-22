import User from "../models/User.js";
import Branch from "../models/Branch.js";
import { validationResult } from "express-validator";

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

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  return null;
};

/**
 * GET /api/admin/users
 * Lấy danh sách users với filter và pagination
 * Query params: status, role, page, limit
 */
export const listUsers = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { status, role, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "Users retrieved successfully.",
      data: users.map(buildUserResponse),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:userId
 * Lấy chi tiết user
 */
export const getUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    res.json({
      success: true,
      message: "User retrieved successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/approve
 * Duyệt tài khoản (pending → active)
 */
export const approveUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending users can be approved. Current status: ${user.status}`,
        errors: [{ field: "status", message: "User is not in pending status." }],
      });
    }

    user.status = "active";
    await user.save();

    res.json({
      success: true,
      message: "User approved successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/reject
 * Từ chối tài khoản (pending → deleted hoặc blocked)
 */
export const rejectUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending users can be rejected. Current status: ${user.status}`,
        errors: [{ field: "status", message: "User is not in pending status." }],
      });
    }

    // Soft delete: đánh dấu isDeleted=true
    user.isDeleted = true;
    user.status = "deleted";
    await user.save();

    res.json({
      success: true,
      message: "User rejected successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/lock
 * Khóa tài khoản (active → blocked)
 */
export const lockUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;

    // Không được khóa tài khoản đang đăng nhập
    if (req.user._id.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot lock your own account.",
        errors: [{ field: "userId", message: "You cannot lock your own account." }],
      });
    }

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    if (user.status === "blocked") {
      return res.status(400).json({
        success: false,
        message: "User is already blocked.",
        errors: [{ field: "status", message: "User is already in blocked status." }],
      });
    }

    user.status = "blocked";
    await user.save();

    res.json({
      success: true,
      message: "User locked successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/unlock
 * Mở khóa tài khoản (blocked → active)
 */
export const unlockUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    if (user.status !== "blocked") {
      return res.status(400).json({
        success: false,
        message: `Only blocked users can be unlocked. Current status: ${user.status}`,
        errors: [{ field: "status", message: "User is not in blocked status." }],
      });
    }

    user.status = "active";
    await user.save();

    res.json({
      success: true,
      message: "User unlocked successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/role
 * Đổi role của user
 * Rule: Không cho đổi role admin (bảo vệ super admin)
 */
export const changeRole = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const { role } = req.body;

    // Không được tự giáng chức chính mình từ admin
    if (req.user._id.toString() === userId && req.user.role === "admin" && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot downgrade themselves.",
        errors: [{ field: "role", message: "You cannot change your own role from admin." }],
      });
    }

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    // Không được cấp hoặc gỡ role admin (tránh lạm dụng)
    if ((user.role !== "admin" && role === "admin") || (user.role === "admin" && role !== "admin")) {
      return res.status(403).json({
        success: false,
        message: "Cannot grant or revoke admin role. Contact system administrator.",
        errors: [{ field: "role", message: "Admin role changes are restricted." }],
      });
    }

    if (user.role === role) {
      return res.status(400).json({
        success: false,
        message: `User already has role: ${role}`,
        errors: [{ field: "role", message: "User already has this role." }],
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role changed successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:userId/branch
 * Gán chi nhánh cho user
 * Chỉ manager/employee được gán branch
 */
export const assignBranch = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;
    const { branchId } = req.body;

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    // Admin không cần gán branch
    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin users do not need branch assignment.",
        errors: [{ field: "branchId", message: "Cannot assign branch to admin user." }],
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Branch not found.",
        errors: [{ field: "branchId", message: "Branch not found." }],
      });
    }

    user.branchId = branchId;
    await user.save();

    res.json({
      success: true,
      message: "Branch assigned successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:userId
 * Xóa user (soft delete)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { userId } = req.params;

    // Không được xóa tài khoản đang đăng nhập
    if (req.user._id.toString() === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete your own account.",
        errors: [{ field: "userId", message: "You cannot delete your own account." }],
      });
    }

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        errors: [],
      });
    }

    // Không được xóa admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin user.",
        errors: [{ field: "role", message: "Admin users cannot be deleted." }],
      });
    }

    // Soft delete
    user.isDeleted = true;
    user.status = "deleted";
    await user.save();

    res.json({
      success: true,
      message: "User deleted successfully.",
      data: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
