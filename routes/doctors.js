import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getDoctors).post(protect, admin, createDoctor);
router
  .route('/:id')
  .get(getDoctorById)
  .put(protect, admin, updateDoctor)
  .delete(protect, admin, deleteDoctor);

export default router;
