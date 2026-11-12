import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  markInvoiceAsPaid,
  sendRemindEmail
} from '../controllers/invoiceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getInvoices);
router.get('/:id', verifyToken, getInvoiceById);

router.post('/', verifyToken, authorize('landlord'), createInvoice);
router.patch('/:id/pay', verifyToken, authorize('landlord'), markInvoiceAsPaid);
router.post('/:id/remind', verifyToken, authorize('landlord'), sendRemindEmail);

export default router;