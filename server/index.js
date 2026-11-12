import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import boardingHouseRoutes from './routes/boardingHouseRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Các middleware cơ bản
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Route kiểm tra server
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server Quan ly nha tro dang hoat dong!' });
});

// Các API chính (Danh từ số nhiều)
app.use('/api/auth', authRoutes);
app.use('/api/boarding-houses', boardingHouseRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);

// Middleware xử lý lỗi tập trung (Luôn đặt ở cuối cùng)
app.use(errorHandler);

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