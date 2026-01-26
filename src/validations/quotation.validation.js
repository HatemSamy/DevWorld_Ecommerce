import Joi from 'joi';

/**
 * Quotation item schema
 */
const quotationItemSchema = Joi.object({
    product: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.base': 'Product ID must be a string',
            'string.hex': 'Product ID must be a valid ObjectId',
            'string.length': 'Product ID must be a valid ObjectId',
            'any.required': 'Product ID is required'
        }),
    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
        })
});

/**
 * User snapshot schema for guest users
 */
const userSnapshotSchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Full name is required',
            'any.required': 'Full name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    phone: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Phone is required',
            'any.required': 'Phone is required'
        })
});

/**
 * Create quotation validation
 * For authenticated users: userSnapshot is optional (auto-populated from JWT)
 * For guest users: userSnapshot is required
 */
export const createQuotationSchema = Joi.object({
    items: Joi.array()
        .items(quotationItemSchema)
        .min(1)
        .required()
        .messages({
            'array.base': 'Items must be an array',
            'array.min': 'At least one item is required',
            'any.required': 'Items are required'
        }),
    userSnapshot: userSnapshotSchema.optional(),
    notes: Joi.string()
        .allow('')
        .default('')
        .messages({
            'string.base': 'Notes must be a string'
        })
});

/**
 * Update quotation validation (Admin only)
 */
export const updateQuotationSchema = Joi.object({
    items: Joi.array()
        .items(quotationItemSchema)
        .min(1)
        .optional()
        .messages({
            'array.base': 'Items must be an array',
            'array.min': 'At least one item is required'
        }),
    notes: Joi.string()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Notes must be a string'
        })
}).min(1).messages({
    'object.min': 'At least one field (items or notes) must be provided for update'
});
