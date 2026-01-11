import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required']
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating must be at most 5']
        }
    },
    {
        timestamps: true
    }
);

// Ensure one rating per user per product
ratingSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for faster product queries
ratingSchema.index({ product: 1, createdAt: -1 });
ratingSchema.index({ user: 1 });

export default mongoose.model('Rating', ratingSchema);

