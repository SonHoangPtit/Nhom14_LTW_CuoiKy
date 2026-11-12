import express from 'express';
import {
  getContracts,
  createContract,
  terminateContract
} from '../controllers/contractController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Chủ trọ và Người thuê đều gọi được (bên trong controller đã tự lọc theo role)
router.get('/', verifyToken, getContracts);

// Chỉ Chủ trọ (landlord) mới được tạo và kết thúc hợp đồng
router.post('/', verifyToken, authorize('landlord'), createContract);
router.patch('/:id/terminate', verifyToken, authorize('landlord'), terminateContract);

export default router;