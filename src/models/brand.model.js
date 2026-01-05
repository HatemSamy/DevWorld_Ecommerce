import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, 'Brand name in English is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Brand name in Arabic is required'],
                trim: true
            }
        },
        image: {
            type: String,
            required: [true, 'Brand image is required']
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

// Index for faster queries
brandSchema.index({ 'name.en': 1 });
brandSchema.index({ 'name.ar': 1 });

export default mongoose.model('Brand', brandSchema);
