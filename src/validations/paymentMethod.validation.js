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
    description: bilingualSchema,
    type: Joi.string().valid('cash_on_delivery', 'bank_transfer', 'e_wallet', 'other').required(),
    instructions: bilingualSchema,
    icon: Joi.string().uri()
});

/**
 * Update payment method validation
 */
export const updatePaymentMethodSchema = Joi.object({
    name: bilingualSchema,
    description: bilingualSchema,
    type: Joi.string().valid('cash_on_delivery', 'bank_transfer', 'e_wallet', 'other'),
    instructions: bilingualSchema,
    icon: Joi.string().uri(),
    isActive: Joi.boolean()
}).min(1);
