import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, 'Payment method name in English is required'],
                trim: true
            },
            ar: {
                type: String,
                required: [true, 'Payment method name in Arabic is required'],
                trim: true
            }
        },
        description: {
            en: String,
            ar: String
        },
        type: {
            type: String,
            enum: ['cash_on_delivery', 'bank_transfer', 'e_wallet', 'other'],
            required: [true, 'Payment method type is required']
        },
        // Instructions for the user (e.g., account number for bank transfer)
        instructions: {
            en: String,
            ar: String
        },
        icon: String,
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('PaymentMethod', paymentMethodSchema);
