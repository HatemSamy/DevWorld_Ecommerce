import mongoose from 'mongoose';

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
        salePrice: {
            type: Number,
            min: 0,
            validate: {
                validator: function (value) {
                    return !value || value < this.price;
                },
                message: 'Sale price must be less than regular price'
            }
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
        // Dynamic attributes based on category
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
        // Calculated rating fields (updated from Rating model)
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

// Indexes for filtering
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'name.en': 'text', 'name.ar': 'text' });

// Virtual for effective price (sale price if available, otherwise regular price)
productSchema.virtual('effectivePrice').get(function () {
    return this.salePrice || this.price;
});

export default mongoose.model('Product', productSchema);
