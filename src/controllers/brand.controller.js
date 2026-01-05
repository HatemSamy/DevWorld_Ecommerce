import Brand from '../models/brand.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import cloudinary from '../config/cloudinary.config.js';

/**
 * @desc    Get all brands
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getAllBrands = async (req, res, next) => {
    try {
        const { page, size } = req.query;
        const { limit, skip } = paginate(page, size);

        const brands = await Brand.find({ isActive: true })
            .limit(limit)
            .skip(skip);

        const total = await Brand.countDocuments({ isActive: true });

        // Localize response
        const localizedBrands = localizeDocuments(brands, req.language);

        res.status(200).json({
            success: true,
            count: brands.length,
            total,
            page: parseInt(page) || 1,
            pages: Math.ceil(total / limit),
            data: localizedBrands
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single brand
 * @route   GET /api/v1/brands/:id
 * @access  Public
 */
export const getBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        const localizedBrand = localizeDocument(brand, req.language);

        res.status(200).json({
            success: true,
            data: localizedBrand
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create brand
 * @route   POST /api/v1/brands
 * @access  Private/Admin
 */
export const createBrand = async (req, res, next) => {
    try {
        // Check if image file is uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Brand image is required'
            });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'electronics-store/brands',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });

        // Create brand with Cloudinary URL
        const brand = await Brand.create({
            ...req.body,
            image: result.secure_url
        });

        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update brand
 * @route   PUT /api/v1/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // If new image is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            if (brand.image) {
                const publicId = brand.image.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(`electronics-store/brands/${publicId}`);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'electronics-store/brands',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' }
                ]
            });

            req.body.image = result.secure_url;
        }

        // Update brand
        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Brand updated successfully',
            data: updatedBrand
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete brand
 * @route   DELETE /api/v1/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Delete image from Cloudinary
        if (brand.image) {
            const publicId = brand.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(`electronics-store/brands/${publicId}`);
        }

        await Brand.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

