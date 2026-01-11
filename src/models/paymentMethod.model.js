import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
    {
        // Bilingual payment method name (e.g., "Cash on Delivery", "InstaPay")
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
        // Icon/logo image URL or file reference
        icon: {
            type: String,
            required: [true, 'Payment method icon is required']
        },
        // Instructions for the user (e.g., account number for bank transfer)
        instructions: {
            en: String,
            ar: String
        },
        // Whether this payment method is available for customers
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
