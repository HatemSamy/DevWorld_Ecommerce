import Banner from '../models/banner.model.js';
import { localizeDocument } from '../utils/helpers.util.js';

/**
 * @desc    Get the singleton banner
 * @route   GET /api/v1/banner
 * @access  Public
 */
export const getBanner = async (req, res, next) => {
    try {
        const banner = await Banner.getSingleton();

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        // Filter active images and sort by displayOrder
        const activeBanner = {
            ...banner.toObject(),
            images: banner.images
                .filter(img => img.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
        };

        const localizedBanner = localizeDocument(activeBanner, req.language);

        res.status(200).json({
            success: true,
            data: localizedBanner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update the banner (Admin)
 * @route   PUT /api/v1/banner
 * @access  Private/Admin
 */
export const updateBanner = async (req, res, next) => {
    try {
        let banner = await Banner.getSingleton();

        // Update banner fields
        if (req.body.images !== undefined) {
            banner.images = req.body.images;
        }
        if (req.body.isActive !== undefined) {
            banner.isActive = req.body.isActive;
        }

        await banner.save();

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Initialize banner (Admin) - Only needed if banner doesn't exist
 * @route   POST /api/v1/banner/initialize
 * @access  Private/Admin
 */
export const initializeBanner = async (req, res, next) => {
    try {
        const banner = await Banner.getSingleton();

        res.status(200).json({
            success: true,
            message: 'Banner initialized',
            data: banner
        });
    } catch (error) {
        next(error);
    }
};
