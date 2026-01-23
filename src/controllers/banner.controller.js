import Banner from '../models/banner.model.js';
import cloudinary from '../config/cloudinary.config.js';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Helper function to upload multiple images to Cloudinary
 */
const uploadImages = async (files) => {
    const uploadPromises = files.map(file =>
        cloudinary.uploader.upload(file.path, {
            folder: 'electronics-store/banners',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' }
            ]
        })
    );

    const results = await Promise.all(uploadPromises);

    // Clean up local files
    files.forEach(file => {
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting local file:', err);
        }
    });

    return results.map(result => ({
        imageUrl: result.secure_url,
        publicId: result.public_id
    }));
};

/**
 * Helper function to delete images from Cloudinary
 */
const deleteImages = async (images) => {
    const deletePromises = images.map(img =>
        cloudinary.uploader.destroy(img.publicId).catch(err =>
            console.error('Error deleting image from Cloudinary:', err)
        )
    );
    await Promise.all(deletePromises);
};

/**
 * @desc    Get all banners (Public)
 * @route   GET /api/v1/banners
 * @access  Public
 */
export const getAllBanners = asyncHandler(async (req, res) => {
    const { isActive, bannerType } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (bannerType) query.bannerType = bannerType;

    const banners = await Banner.find(query)
        .select('_id title images linkUrl bannerType')
        .sort({ createdAt: -1 })
        .lean();

    // Transform images to exclude publicId (internal cloudinary field)
    const optimizedBanners = banners.map(banner => ({
        ...banner,
        images: banner.images.map(img => img.imageUrl)
    }));

    res.status(200).json({
        success: true,
        count: optimizedBanners.length,
        data: optimizedBanners
    });
});

/**
 * @desc    Get banner by ID (Public)
 * @route   GET /api/v1/banners/:id
 * @access  Public
 */
export const getBannerById = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw ApiError.notFound('Banner not found');
    }

    res.status(200).json({
        success: true,
        data: banner
    });
});

/**
 * @desc    Create banner (Admin)
 * @route   POST /api/v1/banners
 * @access  Private/Admin
 */
export const createBanner = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('At least one image file is required');
    }

    // Upload all images to Cloudinary
    const images = await uploadImages(req.files);

    const { title, linkUrl, bannerType, isActive } = req.body;

    const banner = await Banner.create({
        title,
        images,
        linkUrl: linkUrl || '',
        bannerType: bannerType || 'main',
        isActive: isActive !== undefined ? isActive === 'true' : true
    });

    res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        data: banner
    });
});

/**
 * @desc    Update banner (Admin)
 * @route   PUT /api/v1/banners/:id
 * @access  Private/Admin
 */
export const updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw ApiError.notFound('Banner not found');
    }

    // Handle image update if new files are provided
    if (req.files && req.files.length > 0) {
        // Delete old images from Cloudinary
        await deleteImages(banner.images);

        // Upload new images to Cloudinary
        banner.images = await uploadImages(req.files);
    }

    const { title, linkUrl, bannerType, isActive } = req.body;

    if (title !== undefined) banner.title = title;
    if (linkUrl !== undefined) banner.linkUrl = linkUrl;
    if (bannerType !== undefined) banner.bannerType = bannerType;
    if (isActive !== undefined) banner.isActive = isActive === 'true';

    await banner.save();

    res.status(200).json({
        success: true,
        message: 'Banner updated successfully',
        data: banner
    });
});

/**
 * @desc    Delete banner (Admin)
 * @route   DELETE /api/v1/banners/:id
 * @access  Private/Admin
 */
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw ApiError.notFound('Banner not found');
    }

    // Delete all images from Cloudinary
    await deleteImages(banner.images);

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Banner deleted successfully'
    });
});

/**
 * @desc    Add images to existing banner (Admin)
 * @route   POST /api/v1/banners/:id/images
 * @access  Private/Admin
 */
export const addImagesToBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw ApiError.notFound('Banner not found');
    }

    if (!req.files || req.files.length === 0) {
        throw ApiError.badRequest('At least one image file is required');
    }

    // Upload new images to Cloudinary
    const newImages = await uploadImages(req.files);

    // Add new images to existing images array
    banner.images.push(...newImages);

    await banner.save();

    res.status(200).json({
        success: true,
        message: `${newImages.length} image(s) added successfully`,
        data: banner
    });
});

/**
 * @desc    Remove image from banner (Admin)
 * @route   DELETE /api/v1/banners/:id/images/:imageId
 * @access  Private/Admin
 */
export const removeImageFromBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
        throw ApiError.notFound('Banner not found');
    }

    const imageToRemove = banner.images.id(req.params.imageId);

    if (!imageToRemove) {
        throw ApiError.notFound('Image not found in banner');
    }

    // Ensure at least one image remains
    if (banner.images.length <= 1) {
        throw ApiError.badRequest('Cannot remove the last image. Banner must have at least one image.');
    }

    // Delete image from Cloudinary
    await deleteImages([imageToRemove]);

    // Remove image from array
    banner.images.pull(req.params.imageId);

    await banner.save();

    res.status(200).json({
        success: true,
        message: 'Image removed successfully',
        data: banner
    });
});
