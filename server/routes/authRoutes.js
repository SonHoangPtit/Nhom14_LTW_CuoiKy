import express from 'express';
import { register, login, getTenants } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/tenants', verifyToken, authorize('landlord'), getTenants);

export default router;