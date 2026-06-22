import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  validateCreateResource,
  validateUpdateResource,
  handleValidationErrors,
} from '../validators/resourceValidator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public for authenticated users (Employee can view resources)
// GET all resources with filters
router.get(
  '/',
  resourceController.getResources
);

// GET resource by ID
router.get(
  '/:id',
  resourceController.getResourceById
);

// GET resources by branch for displaying diagram
router.get(
  '/branch/:branchId',
  resourceController.getResourcesByBranch
);

// Admin and Manager only routes
// POST create resource
router.post(
  '/',
  authorize('admin', 'manager'),
  validateCreateResource,
  handleValidationErrors,
  resourceController.createResource
);

// PUT update resource
router.put(
  '/:id',
  authorize('admin', 'manager'),
  validateUpdateResource,
  handleValidationErrors,
  resourceController.updateResource
);

// DELETE resource
router.delete(
  '/:id',
  authorize('admin', 'manager'),
  resourceController.deleteResource
);

export default router;
