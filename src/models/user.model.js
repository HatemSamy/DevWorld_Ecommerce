import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
    city: { type: String, required: true },
    street: { type: String, required: true },
    building: String,
    floor: String,
    apartment: String,
    additionalInfo: String,
    isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
    
    
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false // Don't return password by default
        },
        addresses: [addressSchema],
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },

        
        resetPasswordCode: String,
        resetPasswordExpires: Date,
        isActive: {
            type: Boolean,
            default: true
        },

        
        preferredProducts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: []
  }
]
    },


    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
