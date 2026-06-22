import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  validateCreateBooking,
  validateUpdateBooking,
  validateCancelBooking,
  handleValidationErrors,
} from '../validators/bookingValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', authorize('admin', 'manager', 'employee'), validateCreateBooking, handleValidationErrors, bookingController.createBooking);
router.patch('/:id', authorize('admin', 'manager', 'employee'), validateUpdateBooking, handleValidationErrors, bookingController.updateBooking);
router.patch('/:id/check-in', authorize('admin', 'manager', 'employee'), bookingController.checkInBooking);
router.patch('/:id/cancel', authorize('admin', 'manager', 'employee'), validateCancelBooking, handleValidationErrors, bookingController.cancelBooking);
router.patch('/:id/no-show', authorize('admin', 'manager', 'employee'), bookingController.noShowBooking);

export default router;
