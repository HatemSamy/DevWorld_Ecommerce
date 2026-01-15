import mongoose from 'mongoose';

// Banner type constants for easy reference
export const BANNER_TYPES = {
    MAIN: 'main',
    SECONDARY: 'secondary'
};

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Banner title is required'],
            trim: true
        },
        // Multiple images for slider functionality
        images: {
            type: [{
                imageUrl: {
                    type: String,
                    required: true
                },
                publicId: {
                    type: String,
                    required: true
                }
            }],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'At least one image is required'
            }
        },
        linkUrl: {
            type: String,
            trim: true
        },
        bannerType: {
            type: String,
            enum: {
                values: Object.values(BANNER_TYPES),
                message: 'Banner type must be one of: main, secondary'
            },
            default: BANNER_TYPES.MAIN
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient querying by type and status
bannerSchema.index({ bannerType: 1, isActive: 1 });

export default mongoose.model('Banner', bannerSchema);
