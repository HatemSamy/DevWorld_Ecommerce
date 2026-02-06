import Joi from 'joi';

/**
 * Register validation
 */
export const registerSchema = Joi.object({
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
        }),
    guestId: Joi.string().optional()
        .messages({
            'string.base': 'Guest ID must be a string'
        })
});

/**
 * Login validation
 */
export const loginSchema = Joi.object({
    phone: Joi.string().required()
        .messages({
            'string.empty': 'phone is required',
        }),
    password: Joi.string().required()
        .messages({
            'string.empty': 'Password is required'
        }),
    guestId: Joi.string().optional()
        .messages({
            'string.base': 'Guest ID must be a string'
        })
});

/**
 * Forgot password validation
 */
export const forgotPasswordSchema = Joi.object({
    email: Joi.string().required().email()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email'
        })
});



/**
 * Reset password validation
 */
export const resetPasswordSchema = Joi.object({
    code: Joi.string().required().length(6)
        .messages({
            'string.empty': 'Verification code is required',
            'string.length': 'Verification code must be 6 digits'
        }),
    newPassword: Joi.string().required().min(6)
        .messages({
            'string.empty': 'New password is required',
            'string.min': 'Password must be at least 6 characters'
        })
});

/**
 * Add address validation
 */
export const addAddressSchema = Joi.object({
    city: Joi.string().required()
        .messages({
            'string.empty': 'City is required'
        }),
    street: Joi.string().required()
        .messages({
            'string.empty': 'Street is required'
        }),
    building: Joi.string().allow(''),
    floor: Joi.string().allow(''),
    apartment: Joi.string().allow(''),
    additionalInfo: Joi.string().allow(''),
    isDefault: Joi.boolean().default(false)
});




export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 8 characters'
    })
});