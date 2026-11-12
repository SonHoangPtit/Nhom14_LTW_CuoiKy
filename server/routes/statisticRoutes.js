import express from 'express';
import { getDashboardStats } from '../controllers/statisticController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Chỉ Chủ trọ mới xem được thống kê doanh thu và công nợ
router.get('/dashboard', verifyToken, authorize('landlord'), getDashboardStats);

export default router;