import { check, validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import Branch from '../models/Branch.js';

// Validate create resource
const validateCreateResource = [
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

  check('name')
    .notEmpty()
    .withMessage('name is required')
    .trim()
    .isLength({ min: 1 })
    .withMessage('name cannot be empty'),

  check('code')
    .notEmpty()
    .withMessage('code is required')
    .trim()
    .isLength({ min: 1 })
    .withMessage('code cannot be empty')
    .custom(async (value, { req }) => {
      // Check if code already exists in the same branch
      const existingResource = await Resource.findOne({
        branchId: req.body.branchId,
        code: value.toUpperCase(),
      });
      if (existingResource) {
        throw new Error('code already exists in this branch');
      }
    }),

  check('type')
    .notEmpty()
    .withMessage('type is required')
    .isIn(['table', 'room'])
    .withMessage('type must be either table or room'),

  check('capacity')
    .notEmpty()
    .withMessage('capacity is required')
    .isInt({ min: 1 })
    .withMessage('capacity must be a number greater than 0'),

  check('description')
    .optional()
    .trim(),

  check('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive'])
    .withMessage('status must be active, maintenance, or inactive'),

  check('locationLabel')
    .optional()
    .trim(),

  check('layout')
    .optional()
    .isObject()
    .withMessage('layout must be an object'),
];

// Validate update resource
const validateUpdateResource = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('name cannot be empty'),

  check('code')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('code cannot be empty')
    .custom(async (value, { req }) => {
      // Check if code already exists in the same branch (excluding current resource)
      const existingResource = await Resource.findOne({
        _id: { $ne: req.params.id },
        branchId: req.body.branchId || req.resource.branchId,
        code: value.toUpperCase(),
      });
      if (existingResource) {
        throw new Error('code already exists in this branch');
      }
    }),

  check('type')
    .optional()
    .isIn(['table', 'room'])
    .withMessage('type must be either table or room'),

  check('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('capacity must be a number greater than 0'),

  check('description')
    .optional()
    .trim(),

  check('status')
    .optional()
    .isIn(['active', 'maintenance', 'inactive'])
    .withMessage('status must be active, maintenance, or inactive'),

  check('locationLabel')
    .optional()
    .trim(),

  check('layout')
    .optional()
    .isObject()
    .withMessage('layout must be an object'),
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export {
  validateCreateResource,
  validateUpdateResource,
  handleValidationErrors,
};
