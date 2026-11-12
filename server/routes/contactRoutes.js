import express from 'express';
import { createContact, getAllContacts } from '../controllers/contactController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Mở công khai cho khách vãng lai gửi liên hệ
router.post('/', createContact);

// Chủ trọ xem danh sách liên hệ
router.get('/', verifyToken, authorize('landlord'), getAllContacts);

export default router;