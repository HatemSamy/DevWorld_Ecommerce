import mongoose from 'mongoose';

// Sub-schema for defining dynamic attributes for products in this category
const attributeDefinitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'array'],
        default: 'string'
    },
    required: {
        type: Boolean,
        default: false
    },
    options: [String] // For dropdown/select fields
}, { _id: false });

const categorySchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, 'Category name in English is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Category name in Arabic is required'],
                trim: true
            }
        },
        image: {
            type: String,
            required: [true, 'Category image is required']
        },
        // Defines what additional attributes products in this category should have
        attributesSchema: [attributeDefinitionSchema],
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
categorySchema.index({ 'name.en': 1 });
categorySchema.index({ 'name.ar': 1 });

export default mongoose.model('Category', categorySchema);
