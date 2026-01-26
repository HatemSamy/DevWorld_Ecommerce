import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productNameSnapshot: {
        en: {
            type: String,
            required: true
        },
        ar: {
            type: String,
            required: true
        }
    },
    unitPriceSnapshot: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalItemPrice: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: true });

const quotationSchema = new mongoose.Schema(
    {
        quotationCode: {
            type: String,
            trim: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        userSnapshot: {
            fullName: {
                type: String,
                required: [true, 'User full name is required']
            },
            email: {
                type: String,
                required: [true, 'User email is required']
            },
            phone: {
                type: String,
                required: [true, 'User phone is required']
            }
        },
        items: {
            type: [quotationItemSchema],
            required: [true, 'Quotation must have at least one item'],
            validate: {
                validator: function (arr) {
                    return arr.length > 0;
                },
                message: 'Quotation must have at least one item'
            }
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required'],
            min: 0
        },
        notes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to generate unique quotation code
quotationSchema.pre('save', async function (next) {
    if (!this.quotationCode) {
        try {
            // Find the last quotation to get the highest quotation code
            const lastQuotation = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });

            let nextNumber = 1;
            if (lastQuotation && lastQuotation.quotationCode) {
                // Extract the number from the last quotation code (e.g., DWQ0001 -> 0001)
                const lastNumber = parseInt(lastQuotation.quotationCode.substring(3));
                nextNumber = lastNumber + 1;
            }

            // Format as DWQ + 4 digits (e.g., DWQ0001, DWQ0002, etc.)
            this.quotationCode = `DWQ${String(nextNumber).padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Indexes for faster queries
quotationSchema.index({ user: 1, createdAt: -1 });
quotationSchema.index({ quotationCode: 1 });
quotationSchema.index({ createdAt: -1 });

export default mongoose.model('Quotation', quotationSchema);
