import express from 'express';
import {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAllAppointments
} from '../controllers/appointmentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/book', protect, bookAppointment);
router.get('/available-slots', getAvailableSlots);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/all', protect, admin, getAllAppointments);
router.route('/:id').get(protect, getAppointmentById);
router.put('/:id/status', protect, updateAppointmentStatus);

export default router;
