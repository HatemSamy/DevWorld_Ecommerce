import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import {
    createAdminSchema,
    updateAdminSchema,
    adminListQuerySchema
} from '../validations/admin.validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/admin/dashboard/statistics
 * @desc    Get dashboard statistics (orders, products, users counts)
 * @access  Private/Admin/SuperAdmin
 */
router.get(
    '/dashboard/statistics',
    authorize('admin', 'superAdmin'),
    dashboardController.getStatistics
);

/**
 * @route   POST /api/v1/admin
 * @desc    Create a new admin account (SuperAdmin only)
 * @access  Private/SuperAdmin
 */
router.post(
    '/',
    authorize('superAdmin'),
    validation({ body: createAdminSchema }),
    adminController.createAdmin
);

/**
 * @route   GET /api/v1/admin
 * @desc    Get all admin accounts (Admin or SuperAdmin)
 * @access  Private/Admin/SuperAdmin
 */
router.get(
    '/',
    authorize('superAdmin'),
    validation({ query: adminListQuerySchema }),
    adminController.getAllAdmins
);

/**
 * @route   GET /api/v1/admin/:id
 * @desc    Get admin account by ID (Admin or SuperAdmin)
 * @access  Private/Admin/SuperAdmin
 */
router.get(
    '/:id',
    authorize('superAdmin'),
    adminController.getAdminById
);

/**
 * @route   PUT /api/v1/admin/:id
 * @desc    Update admin account details (Admin or SuperAdmin)
 * @access  Private/Admin/SuperAdmin
 */
router.put(
    '/:id',
    authorize('superAdmin'),
    validation({ body: updateAdminSchema }),
    adminController.updateAdmin
);

/**
 * @route   DELETE /api/v1/admin/:id
 * @desc    Deactivate admin account (Admin or SuperAdmin)
 * @access  Private/Admin/SuperAdmin
 */
router.delete(
    '/:id',
    authorize('superAdmin'),
    adminController.deactivateAdmin
);

export default router;
