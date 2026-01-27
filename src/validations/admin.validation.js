import Joi from 'joi';

/**
 * Create admin validation
 */
export const createAdminSchema = Joi.object({
    firstName: Joi.string().required().trim().min(2).max(50)
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name must not exceed 50 characters'
        }),
    lastName: Joi.string().required().trim().min(2).max(50)
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name must not exceed 50 characters'
        }),
    email: Joi.string().required().email()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email'
        }),
    phone: Joi.string().required()
        .messages({
            'string.empty': 'Phone number is required'
        }),
    password: Joi.string().required().min(6)
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters'
        })
});

/**
 * Update admin validation
 */
export const updateAdminSchema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50)
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name must not exceed 50 characters'
        }),
    lastName: Joi.string().trim().min(2).max(50)
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name must not exceed 50 characters'
        }),
    email: Joi.string().email()
        .messages({
            'string.email': 'Please provide a valid email'
        }),
    phone: Joi.string()
        .messages({
            'string.empty': 'Phone number cannot be empty'
        })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

/**
 * Admin list query validation
 */
export const adminListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number().integer().min(1).max(100).default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),
    isActive: Joi.boolean()
        .messages({
            'boolean.base': 'isActive must be a boolean value'
        }),
    search: Joi.string().trim().allow('')
        .messages({
            'string.base': 'Search must be a string'
        })
});
