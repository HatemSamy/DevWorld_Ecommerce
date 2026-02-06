import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        purpose: {
            type: String,
            required: [true, 'Purpose is required'],
            trim: true,
            minlength: [5, 'Purpose must be at least 5 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'responded', 'resolved'],
            default: 'pending'
        },
        adminNotes: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

export default mongoose.model('Contact', contactSchema);
