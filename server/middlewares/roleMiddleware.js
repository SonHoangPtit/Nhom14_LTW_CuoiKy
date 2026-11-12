// Hàm nhận vào danh sách các vai trò được phép truy cập (VD: authorize('landlord'))
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra xem req.user có tồn tại và role có nằm trong danh sách cho phép không
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện chức năng này'
      });
    }

    next(); // Đúng quyền thì cho đi tiếp
  };
};