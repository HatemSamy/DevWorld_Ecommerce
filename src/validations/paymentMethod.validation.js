import Joi from 'joi';

/**
 * Bilingual field schema
 */
const bilingualSchema = Joi.object({
    en: Joi.string().required(),
    ar: Joi.string().required()
});

/**
 * Create payment method validation
 */
export const createPaymentMethodSchema = Joi.object({
    name: bilingualSchema.required(),
    instructions: bilingualSchema
});

/**
 * Update payment method validation (toggle active status)
 */
export const updatePaymentMethodSchema = Joi.object({
    isActive: Joi.boolean().required()
});
