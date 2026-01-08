import Category from '../models/category.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import cloudinary from '../config/cloudinary.config.js';
import productModel from '../models/product.model.js';

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = async (req, res, next) => {
    try {
        const { page, size } = req.query;
        const { limit, skip } = paginate(page, size);

        const categories = await Category.find({ isActive: true })
            .limit(limit)
            .skip(skip);

        const total = await Category.countDocuments({ isActive: true });

        // Localize response
        const localizedCategories = localizeDocuments(categories, req.language);

        res.status(200).json({
            success: true,
            count: categories.length,
            total,
            page: parseInt(page) || 1,
            pages: Math.ceil(total / limit),
            data: localizedCategories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single category
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // 🔤 Localize category
    const localizedCategory = localizeDocument(category, req.language);

    // 📦 Get products in this category
    const products = await productModel.find({ category: category._id, isActive: true })
      .select('name price salePrice images')
      .sort({ createdAt: -1 });

    // 🔤 Localize products
    const localizedProducts = products.map(product => {
      const localized = localizeDocument(product, req.language);
      return {
        id: localized._id,
        name: localized.name,
        price: localized.price,
        salePrice: localized.salePrice,
        image: localized.images?.[0] || null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        category: {
          id: localizedCategory._id,
          name: localizedCategory.name,
          slug: localizedCategory.slug,
          image: localizedCategory.image
        },
        products: localizedProducts,
        count: localizedProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
    try {
       
        // Check if image file is uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Category image is required'
            });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'electronics-store/categories',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });

        // Create category with Cloudinary URL
        const category = await Category.create({
            ...req.body,
            image: result.secure_url
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // If new image is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            if (category.image) {
                const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(`electronics-store/categories/${publicId}`);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'electronics-store/categories',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' }
                ]
            });

            req.body.image = result.secure_url;
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete image from Cloudinary
        if (category.image) {
            const publicId = category.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(`electronics-store/categories/${publicId}`);
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

