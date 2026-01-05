import Joi from 'joi';

/**
 * Bilingual field schema
 */
const bilingualSchema = Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
});

/**
 * Attribute definition schema
 */
const attributeDefSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('string', 'number', 'boolean', 'array').default('string'),
    required: Joi.boolean().default(false),
    options: Joi.array().items(Joi.string())
});

/**
 * Create category validation
 * Note: image is not required in body validation because it comes through multer as req.file
 */
export const createCategorySchema = Joi.object({
    name: bilingualSchema.required(),
    attributesSchema: Joi.array().items(attributeDefSchema).default([])
});

/**
 * Update category validation
 */
export const updateCategorySchema = Joi.object({
    name: bilingualSchema,
    attributesSchema: Joi.array().items(attributeDefSchema),
    isActive: Joi.boolean()
}).min(1);
