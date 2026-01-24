import Joi from 'joi';

/**
 * Schema for creating/updating a rating
 */

export const createRatingSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.base': 'ID must be a string',
            'string.hex': 'ID must be a valid ObjectId',
            'string.length': 'ID must be a valid ObjectId',
            'any.required': 'ID is required'
        }),

    
}).prefs({ convert: true });


export const updateRatingSchema = createRatingSchema;

