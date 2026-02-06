import Joi from 'joi';

/**
 * Create contact validation
 */
export const createContactSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    phone: Joi.string()
        .trim()
        .required()
        .messages({
            'string.base': 'Phone must be a string',
            'string.empty': 'Phone number is required',
            'any.required': 'Phone number is required'
        }),
    purpose: Joi.string()
        .trim()
        .min(5)
        .required()
        .messages({
            'string.base': 'Purpose must be a string',
            'string.empty': 'Purpose is required',
            'string.min': 'Purpose must be at least 5 characters',
            'any.required': 'Purpose is required'
        })
});

/**
 * Update contact status validation (Admin)
 */
export const updateContactStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'responded', 'resolved')
        .optional()
        .messages({
            'any.only': 'Status must be one of: pending, responded, resolved'
        }),
    adminNotes: Joi.string()
        .trim()
        .allow('')
        .optional()
        .messages({
            'string.base': 'Admin notes must be a string'
        })
}).min(1).messages({
    'object.min': 'At least one field (status or adminNotes) must be provided'
});
