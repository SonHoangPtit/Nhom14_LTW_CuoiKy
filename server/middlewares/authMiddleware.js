import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    // Lấy chuỗi token từ header Authorization (dạng: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc thiếu token xác thực'
      });
    }

    // Tách lấy phần mã token phía sau chữ "Bearer "
    const token = authHeader.split(' ')[1];

    // Giải mã token bằng JWT_SECRET trong file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Chỉ gắn userId và role vào req.user để các bước sau sử dụng
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next(); // Cho phép đi tiếp vào controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};