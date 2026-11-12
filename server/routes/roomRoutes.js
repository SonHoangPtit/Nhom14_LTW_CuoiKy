import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Khách và Chủ trọ đều xem được danh sách & chi tiết phòng
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Chỉ Chủ trọ mới được thêm, sửa, xóa phòng
router.post('/', verifyToken, authorize('landlord'), createRoom);
router.put('/:id', verifyToken, authorize('landlord'), updateRoom);
router.delete('/:id', verifyToken, authorize('landlord'), deleteRoom);

export default router;