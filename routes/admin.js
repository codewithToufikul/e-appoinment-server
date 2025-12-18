import express from 'express';
import { loginAdmin, getAdminStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/stats', protect, admin, getAdminStats);

export default router;
