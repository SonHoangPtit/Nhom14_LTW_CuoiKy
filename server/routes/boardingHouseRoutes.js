import express from 'express';
import {
  getAllBoardingHouses,
  createBoardingHouse,
  updateBoardingHouse,
  deleteBoardingHouse
} from '../controllers/boardingHouseController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Ai cũng có thể xem danh sách dãy trọ
router.get('/', getAllBoardingHouses);

// Chỉ Chủ trọ (landlord) mới được thêm, sửa, xóa
router.post('/', verifyToken, authorize('landlord'), createBoardingHouse);
router.put('/:id', verifyToken, authorize('landlord'), updateBoardingHouse);
router.delete('/:id', verifyToken, authorize('landlord'), deleteBoardingHouse);

export default router;