import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    title: {
        en: {
            type: String,
            trim: true
        },
        ar: {
            type: String,
            trim: true
        }
    },
    subtitle: {
        en: {
            type: String,
            trim: true
        },
        ar: {
            type: String,
            trim: true
        }
    },
    linkUrl: {
        type: String,
        trim: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: true });

const bannerSchema = new mongoose.Schema(
    {
        images: {
            type: [slideSchema],
            default: []
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

/**
 * Static method to get or create the singleton banner
 */
bannerSchema.statics.getSingleton = async function () {
    let banner = await this.findOne();

    if (!banner) {
        banner = await this.create({ images: [], isActive: true });
    }

    return banner;
};

export default mongoose.model('Banner', bannerSchema);
