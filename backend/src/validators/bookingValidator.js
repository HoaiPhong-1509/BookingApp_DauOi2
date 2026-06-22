import { check, validationResult } from 'express-validator';
import Branch from '../models/Branch.js';
import Resource from '../models/Resource.js';

const validateCreateBooking = [
  check('branchId')
    .notEmpty()
    .withMessage('branchId is required')
    .isMongoId()
    .withMessage('branchId must be a valid MongoDB ID')
    .custom(async (value) => {
      const branch = await Branch.findById(value);
      if (!branch) {
        throw new Error('branchId does not exist');
      }
    }),

  check('resourceId')
    .notEmpty()
    .withMessage('resourceId is required')
    .isMongoId()
    .withMessage('resourceId must be a valid MongoDB ID')
    .custom(async (value, { req }) => {
      const resource = await Resource.findById(value);
      if (!resource) {
        throw new Error('resourceId does not exist');
      }
      if (resource.branchId && resource.branchId.toString() !== req.body.branchId) {
        throw new Error('resourceId does not belong to branchId');
      }
    }),

  check('customerName')
    .notEmpty()
    .withMessage('customerName is required')
    .trim(),

  check('customerPhone')
    .optional()
    .trim(),

  check('guestCount')
    .notEmpty()
    .withMessage('guestCount is required')
    .isInt({ min: 1 })
    .withMessage('guestCount must be a number greater than 0'),

  check('bookingTime')
    .notEmpty()
    .withMessage('bookingTime is required')
    .isISO8601()
    .withMessage('bookingTime must be a valid date/time')
    .toDate()
    .custom((value) => {
      if (value < new Date()) {
        throw new Error('bookingTime cannot be in the past');
      }
      return true;
    }),

  check('holdUntil')
    .optional()
    .isISO8601()
    .withMessage('holdUntil must be a valid date/time')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.bookingTime) {
        const bookingTime = new Date(req.body.bookingTime);
        if (value < bookingTime) {
          throw new Error('holdUntil must be after bookingTime');
        }
      }
      return true;
    }),

  check('note')
    .optional()
    .trim(),
];

const validateUpdateBooking = [
  check('customerName').optional().trim(),
  check('customerPhone').optional().trim(),
  check('guestCount').optional().isInt({ min: 1 }).withMessage('guestCount must be a number greater than 0'),
  check('bookingTime').optional().isISO8601().withMessage('bookingTime must be a valid date/time').toDate(),
  check('holdUntil')
    .optional()
    .isISO8601()
    .withMessage('holdUntil must be a valid date/time')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.bookingTime) {
        const bookingTime = new Date(req.body.bookingTime);
        if (value < bookingTime) {
          throw new Error('holdUntil must be after bookingTime');
        }
      }
      return true;
    }),
  check('note').optional().trim(),
];

const validateCancelBooking = [
  check('cancelReason').optional().trim(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

export { validateCreateBooking, validateUpdateBooking, validateCancelBooking, handleValidationErrors };
