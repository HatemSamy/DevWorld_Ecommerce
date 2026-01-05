import Joi from 'joi';

/**
 * Bilingual field schema
 */
const bilingualSchema = Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
});

/**
 * Create offer validation
 */
export const createOfferSchema = Joi.object({
    title: bilingualSchema.required(),
    description: bilingualSchema,
    bannerImage: Joi.string().uri().required(),
    discountPercentage: Joi.number().min(0).max(100).required(),
    products: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    validFrom: Joi.date().required(),
    validUntil: Joi.date().greater(Joi.ref('validFrom')).required()
});

/**
 * Update offer validation
 */
export const updateOfferSchema = Joi.object({
    title: bilingualSchema,
    description: bilingualSchema,
    bannerImage: Joi.string().uri(),
    discountPercentage: Joi.number().min(0).max(100),
    products: Joi.array().items(Joi.string()),
    categories: Joi.array().items(Joi.string()),
    validFrom: Joi.date(),
    validUntil: Joi.date(),
    isActive: Joi.boolean()
}).min(1);
