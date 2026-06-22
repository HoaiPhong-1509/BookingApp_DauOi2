/**
 * Middleware kiểm tra quyền truy cập dựa trên role của user
 * 
 * Sử dụng:
 * - Single role: authorize('admin')
 * - Multiple roles: authorize('admin', 'manager')
 * 
 * Ví dụ: router.get('/admin-only', protect, authorize('admin'), controller);
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra user đã được xác thực (authMiddleware đã chạy)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
        errors: [],
      });
    }

    // Kiểm tra role của user có nằm trong danh sách quyền được phép không
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        errors: [{ field: "role", message: `Only ${allowedRoles.join(", ")} can access this resource.` }],
      });
    }

    next();
  };
};
