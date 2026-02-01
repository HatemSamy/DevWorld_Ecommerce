import express from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { validation } from '../middlewares/validation.middleware.js';
import {
    createCouponSchema,
    updateCouponSchema,
    listCouponsQuerySchema
} from '../validations/coupon.validation.js';

const router = express.Router();

// All routes require authentication and admin/superAdmin role
router.use(protect);
router.use(authorize('admin', 'superAdmin'));

/**
 * @route   POST /api/v1/coupons
 * @desc    Create a new coupon
 * @access  Private/Admin
 */
router.post(
    '/',
    validation({ body: createCouponSchema }),
    couponController.createCoupon
);

/**
 * @route   GET /api/v1/coupons
 * @desc    Get all coupons with pagination and filters
 * @access  Private/Admin
 */
router.get(
    '/',
    validation({ query: listCouponsQuerySchema }),
    couponController.getAllCoupons
);

/**
 * @route   GET /api/v1/coupons/:id
 * @desc    Get coupon by ID
 * @access  Private/Admin
 */
router.get(
    '/:id',
    couponController.getCouponById
);

/**
 * @route   PUT /api/v1/coupons/:id
 * @desc    Update coupon
 * @access  Private/Admin
 */
router.put(
    '/:id',
    validation({ body: updateCouponSchema }),
    couponController.updateCoupon
);

/**
 * @route   DELETE /api/v1/coupons/:id
 * @desc    Delete coupon (soft delete)
 * @access  Private/Admin
 */
router.delete(
    '/:id',
    couponController.deleteCoupon
);

export default router;
