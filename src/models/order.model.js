import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true,
        min: 0
    },
    // Store selected attributes for this product (e.g., color, size)
    attributesSelected: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { _id: true });

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        items: {
            type: [orderItemSchema],
            required: [true, 'Order must have at least one item'],
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: 'Order must have at least one item'
            }
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: 0
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        paymentMethod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentMethod',
            required: [true, 'Payment method is required']
        },
        shippingAddress: {
            city: { type: String, required: true },
            street: { type: String, required: true },
            building: String,
            floor: String,
            apartment: String,
            additionalInfo: String
        },
        notes: String
    },
    {
        timestamps: true
    }
);

// Index for faster user queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
