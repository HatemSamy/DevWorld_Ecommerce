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

productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'name.en': 'text', 'name.ar': 'text' });
productSchema.index({ 'name.en': 1, 'name.ar': 1 });
productSchema.index({ isTrending: 1 });

productSchema.virtual('effectivePrice').get(function () {
    return this.salePrice || this.price;
});

export default mongoose.model('Product', productSchema);
