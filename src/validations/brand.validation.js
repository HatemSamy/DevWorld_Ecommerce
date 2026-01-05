import Joi from 'joi';

/**
 * Bilingual field schema
 */
const bilingualSchema = Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
});

/**
 * Create brand validation
 * Note: image is not required in body validation because it comes through multer as req.file
 */
export const createBrandSchema = Joi.object({
    name: bilingualSchema.required()
});

/**
 * Update brand validation
 */
export const updateBrandSchema = Joi.object({
    name: bilingualSchema,
    isActive: Joi.boolean()
}).min(1);

