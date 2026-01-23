import mongoose from 'mongoose';

const governorateSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, 'English name is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Arabic name is required'],
                trim: true
            }
        }
    },
    {
        timestamps: true
    }
);

// Index for faster lookups
governorateSchema.index({ 'name.en': 1 });
governorateSchema.index({ 'name.ar': 1 });

export default mongoose.model('Governorate', governorateSchema);
