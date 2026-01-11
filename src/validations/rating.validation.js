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

    ratingvalue: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.integer': 'Rating must be an integer',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating must be at most 5',
            'any.required': 'Rating is required'
        })
}).prefs({ convert: true });


export const updateRatingSchema = createRatingSchema;

