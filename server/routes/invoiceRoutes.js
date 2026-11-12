import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  markInvoiceAsPaid
} from '../controllers/invoiceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Chủ trọ và Người thuê đều xem được (bên trong đã phân quyền và chặn 403)
router.get('/', verifyToken, getInvoices);
router.get('/:id', verifyToken, getInvoiceById);

// Chỉ Chủ trọ (landlord) mới được tạo hóa đơn và xác nhận thanh toán
router.post('/', verifyToken, authorize('landlord'), createInvoice);
router.patch('/:id/pay', verifyToken, authorize('landlord'), markInvoiceAsPaid);

export default router;