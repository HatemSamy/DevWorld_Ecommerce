import Joi from 'joi';

/**
 * Create coupon validation
 */
export const createCouponSchema = Joi.object({
    code: Joi.string()
        .min(3)
        .max(20)
        .uppercase()
        .trim()
        .required()
        .messages({
            'string.min': 'Coupon code must be at least 3 characters',
            'string.max': 'Coupon code must not exceed 20 characters',
            'any.required': 'Coupon code is required'
        }),
    value: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
            'number.min': 'Discount value must be between 0 and 100',
            'number.max': 'Discount value must be between 0 and 100',
            'any.required': 'Discount value is required'
        }),
    minOrderAmount: Joi.number()
        .min(0)
        .allow(null)
        .messages({
            'number.min': 'Minimum order amount must be at least 0'
        }),
    maxDiscountAmount: Joi.number()
        .min(0)
        .allow(null)
        .messages({
            'number.min': 'Maximum discount amount must be at least 0'
        }),
    usageLimit: Joi.number()
        .integer()
        .min(1)
        .allow(null)
        .messages({
            'number.min': 'Usage limit must be at least 1',
            'number.integer': 'Usage limit must be an integer'
        }),
    expiresAt: Joi.date()
        .allow(null)
        .messages({
            'date.base': 'Expires at must be a valid date'
        }),
    isActive: Joi.boolean()
});

/**
 * Update coupon validation
 */
export const updateCouponSchema = Joi.object({
    value: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.min': 'Discount value must be between 0 and 100',
            'number.max': 'Discount value must be between 0 and 100'
        }),
    minOrderAmount: Joi.number()
        .min(0)
        .allow(null)
        .messages({
            'number.min': 'Minimum order amount must be at least 0'
        }),
    maxDiscountAmount: Joi.number()
        .min(0)
        .allow(null)
        .messages({
            'number.min': 'Maximum discount amount must be at least 0'
        }),
    usageLimit: Joi.number()
        .integer()
        .min(1)
        .allow(null)
        .messages({
            'number.min': 'Usage limit must be at least 1',
            'number.integer': 'Usage limit must be an integer'
        }),
    expiresAt: Joi.date()
        .allow(null)
        .messages({
            'date.base': 'Expires at must be a valid date'
        }),
    isActive: Joi.boolean()
}).min(1); // At least one field must be provided

/**
 * List coupons query validation
 */
export const listCouponsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    isActive: Joi.boolean(),
    search: Joi.string().trim()
});

/**
 * Apply coupon validation (for standalone apply endpoint)
 */
export const applyCouponSchema = Joi.object({
    couponCode: Joi.string()
        .min(3)
        .max(20)
        .uppercase()
        .trim()
        .required()
        .messages({
            'string.min': 'Coupon code must be at least 3 characters',
            'string.max': 'Coupon code must not exceed 20 characters',
            'any.required': 'Coupon code is required'
        }),
    subtotal: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.min': 'Subtotal must be a positive number',
            'any.required': 'Subtotal is required'
        })
});
