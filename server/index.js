import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorMiddleware.js';

// Đọc các biến trong file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Các middleware cơ bản
app.use(cors());
app.use(express.json());

// Mở thư mục uploads để frontend xem được ảnh báo hỏng
app.use('/uploads', express.static('uploads'));

// Route kiểm tra server hoạt động
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server Quan ly nha tro dang hoat dong!' });
});

// Middleware xử lý lỗi tập trung (Luôn đặt ở cuối cùng sau các routes)
app.use(errorHandler);

// Kết nối MongoDB và khởi động server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Ket noi MongoDB thanh cong!');

    app.listen(PORT, () => {
      console.log(`Server dang chay tai: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('Loi ket noi MongoDB:', error.message);
  }
};

startServer();