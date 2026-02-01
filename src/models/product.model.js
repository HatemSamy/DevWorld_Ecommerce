import mongoose from 'mongoose';
import { generateSlug, ensureUniqueSlug } from '../utils/slug.util.js';

const productSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, 'Product name in English is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Product name in Arabic is required'],
                trim: true
            }
        },
        slug: {
            type: String,
            unique: true,
            sparse: true, // Allows nulls during migration
            lowercase: true,
            trim: true
        },
        description: {
            en: {
                type: String,
                required: [true, 'Product description in English is required']
            },
            ar: {
                type: String,
                required: [true, 'Product description in Arabic is required']
            }
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0
        },
        images: {
            type: [String],
            required: [true, 'At least one image is required'],
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: 'At least one image is required'
            }
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: [true, 'Brand is required']
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required']
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: 0,
            default: 0
        },
        condition: {
            type: String,
            enum: ['new', 'used'],
            default: 'new'
        },
        attributes: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        isTrending: {
            type: Boolean,
            default: false
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        ratingsCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

productSchema.pre('save', async function (next) {
    if (!this.slug || this.isModified('name.en') || this.isModified('description.en') || this.isModified('name.ar') || this.isModified('description.ar')) {
        let baseSlug = '';

        if (this.name.en && this.name.en.trim()) {
            const descriptionWords = this.description.en
                ? this.description.en.split(' ').slice(0, 5).join(' ')
                : '';

            const combinedText = `${this.name.en} ${descriptionWords}`.trim();
            baseSlug = generateSlug(combinedText);
        }

        if (!baseSlug || baseSlug.length < 3) {
            const arabicName = this.name.ar || '';
            const latinChars = arabicName.match(/[a-zA-Z0-9]+/g);

            if (latinChars && latinChars.length > 0) {
                baseSlug = generateSlug(latinChars.join(' '));
            } else {
                baseSlug = 'product';
            }
        }

        if (!baseSlug || baseSlug.length < 2) {
            baseSlug = 'product';
        }

        this.slug = await ensureUniqueSlug(
            this.constructor,
            baseSlug,
            this._id
        );
    }

    next();
});

productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'name.en': 'text', 'name.ar': 'text' });
productSchema.index({ 'name.en': 1, 'name.ar': 1 });
productSchema.index({ isTrending: 1 });

export default mongoose.model('Product', productSchema);
