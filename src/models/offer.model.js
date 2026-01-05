import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
    {
        title: {
            en: {
                type: String,
                required: [true, 'Offer title in English is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Offer title in Arabic is required'],
                trim: true
            }
        },
        description: {
            en: String,
            ar: String
        },
        bannerImage: {
            type: String,
            required: [true, 'Banner image is required']
        },
        discountPercentage: {
            type: Number,
            required: [true, 'Discount percentage is required'],
            min: 0,
            max: 100
        },
        // Optional: Apply to specific products only
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        // Optional: Apply to specific categories
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
        validFrom: {
            type: Date,
            required: [true, 'Start date is required']
        },
        validUntil: {
            type: Date,
            required: [true, 'End date is required']
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

// Check if offer is currently valid
offerSchema.methods.isCurrentlyValid = function () {
    const now = new Date();
    return this.isActive && now >= this.validFrom && now <= this.validUntil;
};

// Index for date range queries
offerSchema.index({ validFrom: 1, validUntil: 1 });

export default mongoose.model('Offer', offerSchema);
