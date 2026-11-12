import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục uploads luôn tồn tại
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

// Bộ lọc kiểm tra định dạng ảnh (.jpg, .png, .webp)
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh có đuôi .jpg, .png hoặc .webp'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn tối đa 5MB
});

// Middleware bọc để bắt lỗi Multer trả về mã 400 rõ ràng
export const handleUploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Kích thước ảnh không được vượt quá 5MB'
          : err.message;

      return res.status(400).json({
        success: false,
        message
      });
    }
    next();
  });
};