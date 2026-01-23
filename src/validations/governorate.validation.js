import Joi from 'joi';

const governorateItemSchema = Joi.object({
    name: Joi.object({
        en: Joi.string().required().trim().messages({
            'string.empty': 'English name is required',
            'any.required': 'English name is required'
        }),
        ar: Joi.string().required().trim().messages({
            'string.empty': 'Arabic name is required',
            'any.required': 'Arabic name is required'
        })
    }).required().messages({
        'any.required': 'Name object with en and ar is required'
    })
});

export const createGovernorateSchema = Joi.alternatives().try(
    governorateItemSchema,
    Joi.array().items(governorateItemSchema).min(1).messages({
        'array.min': 'At least one governorate is required'
    })
);

export const updateGovernorateSchema = Joi.object({
    name: Joi.object({
        en: Joi.string().trim(),
        ar: Joi.string().trim()
    }).min(1).messages({
        'object.min': 'At least one name field (en or ar) is required'
    })
});
