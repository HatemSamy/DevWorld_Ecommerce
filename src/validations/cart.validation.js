import Joi from 'joi';

/**
 * Add to cart validation
 */
export const addToCartSchema = Joi.object({
    product: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required'
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        'number.min': 'Quantity must be at least 1',
        'number.integer': 'Quantity must be a whole number'
    }),
    attributes: Joi.object().pattern(
        Joi.string(),
        Joi.string()
    ).default({})
});

/**
 * Update cart item validation
 */
export const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
        'number.min': 'Quantity must be at least 1',
        'number.integer': 'Quantity must be a whole number',
        'any.required': 'Quantity is required'
    })
});
