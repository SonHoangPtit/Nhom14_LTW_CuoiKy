import express from 'express';
import {
  getRepairs,
  createRepair,
  updateRepairStatus
} from '../controllers/repairController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { handleUploadImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Chủ trọ và Người thuê đều xem được danh sách sửa chữa của mình
router.get('/', verifyToken, getRepairs);

// Người thuê gửi yêu cầu sửa chữa kèm upload 1 file ảnh (field name: "image")
router.post('/', verifyToken, authorize('tenant'), handleUploadImage, createRepair);

// Chủ trọ cập nhật trạng thái xử lý
router.patch('/:id/status', verifyToken, authorize('landlord'), updateRepairStatus);

export default router;