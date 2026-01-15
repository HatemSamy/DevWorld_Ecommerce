import Joi from 'joi';

// Valid banner types
export const VALID_BANNER_TYPES = ['main', 'secondary'];

/**
 * Create banner validation
 */
export const createBannerSchema = Joi.object({
    title: Joi.string().required().trim(),
    linkUrl: Joi.string().uri().allow('').optional(),
    bannerType: Joi.string().valid(...VALID_BANNER_TYPES).default('main'),
    isActive: Joi.string().valid('true', 'false').optional()
});

/**
 * Update banner validation
 */
export const updateBannerSchema = Joi.object({
    title: Joi.string().trim().optional(),
    linkUrl: Joi.string().uri().allow('').optional(),
    bannerType: Joi.string().valid(...VALID_BANNER_TYPES).optional(),
    isActive: Joi.string().valid('true', 'false').optional()
});
