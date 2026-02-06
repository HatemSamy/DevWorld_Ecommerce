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
        orderCode: {
            type: String,
            unique: true,
            trim: true
        },
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
        subtotal: {
            type: Number,
            min: 0
        },
        couponCode: {
            type: String,
            uppercase: true,
            trim: true
        },
        discountValue: {
            type: Number,
            min: 0,
            max: 100
        },
        discountAmount: {
            type: Number,
            min: 0
        },
        orderTotalPrice: {
            type: Number,
            required: [true, 'Order total price is required'],
            min: 0
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
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

// Pre-save hook to generate unique order code
orderSchema.pre('save', async function (next) {
    if (!this.orderCode) {
        try {
            // Find the last order to get the highest order code
            const lastOrder = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });

            let nextNumber = 1;
            if (lastOrder && lastOrder.orderCode) {
                // Extract the number from the last order code (e.g., DW0001 -> 0001)
                const lastNumber = parseInt(lastOrder.orderCode.substring(2));
                nextNumber = lastNumber + 1;
            }

            // Format as DW + 4 digits (e.g., DW0001, DW0002, etc.)
            this.orderCode = `DW${String(nextNumber).padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Index for faster user queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
