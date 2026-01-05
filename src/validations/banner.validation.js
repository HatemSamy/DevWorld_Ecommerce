import Joi from 'joi';

/**
 * Bilingual field schema (optional)
 */
const bilingualSchema = Joi.object({
    en: Joi.string().allow(''),
    ar: Joi.string().allow('')
});

/**
 * Slide validation schema
 */
const slideSchema = Joi.object({
    _id: Joi.string().optional(), // Allow existing slide IDs for updates
    imageUrl: Joi.string().uri().required(),
    title: bilingualSchema,
    subtitle: bilingualSchema,
    linkUrl: Joi.string().uri().allow(''),
    displayOrder: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true)
});

/**
 * Update banner validation
 */
export const updateBannerSchema = Joi.object({
    images: Joi.array().items(slideSchema),
    isActive: Joi.boolean()
}).min(1);
