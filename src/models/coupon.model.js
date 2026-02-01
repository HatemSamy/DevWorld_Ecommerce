import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, 'Coupon code must be at least 3 characters'],
            maxlength: [20, 'Coupon code must not exceed 20 characters']
        },
        value: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value must be at least 0'],
            max: [100, 'Discount value must not exceed 100']
        },
        minOrderAmount: {
            type: Number,
            min: [0, 'Minimum order amount must be at least 0'],
            default: null
        },
        maxDiscountAmount: {
            type: Number,
            min: [0, 'Maximum discount amount must be at least 0'],
            default: null
        },
        usageLimit: {
            type: Number,
            min: [1, 'Usage limit must be at least 1'],
            default: null
        },
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Used count cannot be negative']
        },
        expiresAt: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient querying
// Note: code field already has unique index from 'unique: true' in schema definition
couponSchema.index({ isActive: 1, expiresAt: 1 });

// Pre-save hook to ensure code is uppercase
couponSchema.pre('save', function (next) {
    if (this.code) {
        this.code = this.code.toUpperCase().trim();
    }
    next();
});

export default mongoose.model('Coupon', couponSchema);
