import Joi from 'joi';

/**
 * Bilingual field schema
 */
const bilingualSchema = Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
});

/**
 * Create product validation
 * Note: images are not required in body validation because they come through multer as req.files
 */
export const createProductSchema = Joi.object({
    name: bilingualSchema.required(),
    description: bilingualSchema.required(),
    price: Joi.number().min(0).required(),
    brand: Joi.string().required(),
    category: Joi.string().required(),
    stock: Joi.number().min(0).default(0),
    condition: Joi.string().valid('new', 'used').default('new'),
    attributes: Joi.object().pattern(Joi.string(), Joi.any()),
    isFeatured: Joi.boolean().default(false)
});

/**
 * Update product validation
 */
export const updateProductSchema = Joi.object({
    name: bilingualSchema,
    description: bilingualSchema,
    price: Joi.number().min(0),
    brand: Joi.string(),
    category: Joi.string(),
    stock: Joi.number().min(0),
    condition: Joi.string().valid('new', 'used'),
    attributes: Joi.object().pattern(Joi.string(), Joi.any()),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean()
}).min(1);

/**
 * Autocomplete suggestion validation
 */
export const productSuggestSchema = Joi.object({
    q: Joi.string()
        .min(1)
        .max(100)
        .required()
        .trim()
        .messages({
            'string.empty': 'Search query cannot be empty',
            'string.min': 'Search query must be at least 1 character',
            'string.max': 'Search query cannot exceed 100 characters',
            'any.required': 'Search query is required'
        })
});
