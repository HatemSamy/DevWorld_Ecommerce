import Joi from 'joi';

/**
 * Order item schema
 */
const orderItemSchema = Joi.object({
    product: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    attributesSelected: Joi.object().pattern(Joi.string(), Joi.any())
});

/**
 * Shipping address schema
 */
const shippingAddressSchema = Joi.object({
    city: Joi.string().required(),
    street: Joi.string().required(),
    building: Joi.string().allow(''),
    floor: Joi.string().allow(''),
    apartment: Joi.string().allow(''),
    additionalInfo: Joi.string().allow('')
});

/**
 * Create order validation
 */
export const createOrderSchema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
    paymentMethod: Joi.string().required(),
    shippingAddress: shippingAddressSchema.required(),
    notes: Joi.string().allow(''),
    couponCode: Joi.string().min(3).max(20).uppercase().trim().allow(null, '')
});

/**
 * Update order status validation (Admin)
 */
export const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});
