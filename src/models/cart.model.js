import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    attributes: {
        type: Map,
        of: String,
        default: {}
    }
}, { _id: true });

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
            sparse: true
        },
        guestId: {
            type: String,
            required: false
        },
        cartType: {
            type: String,
            enum: ['user', 'guest'],
            required: true
        },
        items: {
            type: [cartItemSchema],
            default: []
        },
        totalAmount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

cartSchema.pre('validate', function (next) {
    if (!this.user && !this.guestId) {
        return next(new Error('Either user or guestId must be provided'));
    }
    if (this.user && this.guestId) {
        return next(new Error('Cannot have both user and guestId'));
    }
    this.cartType = this.user ? 'user' : 'guest';
    next();
});

cartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestId: 1 });
cartSchema.index({ cartType: 1 });
cartSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 2592000,
        partialFilterExpression: { cartType: 'guest' }
    }
);

export default mongoose.model('Cart', cartSchema);
