import Governorate from '../models/governorate.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';
import { paginate } from '../utils/pagination.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc    Get all governorates
 * @route   GET /api/v1/governorates
 * @access  Public
 */
export const getAllGovernorates = asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    const { limit, skip } = paginate(page, size);

    const governorates = await Governorate.find()
        .sort({ 'name.en': 1 })
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await Governorate.countDocuments();

    // Localize response based on user's language preference
    const localizedGovernorates = localizeDocuments(governorates, req.language);

    res.status(200).json({
        success: true,
        count: governorates.length,
        total,
        page: parseInt(page) || 1,
        pages: Math.ceil(total / limit),
        data: localizedGovernorates
    });
});

/**
 * @desc    Get single governorate
 * @route   GET /api/v1/governorates/:id
 * @access  Public
 */
export const getGovernorate = asyncHandler(async (req, res) => {
    const governorate = await Governorate.findById(req.params.id);

    if (!governorate) {
        throw ApiError.notFound('Governorate not found');
    }

    const localizedGovernorate = localizeDocument(governorate, req.language);

    res.status(200).json({
        success: true,
        data: localizedGovernorate
    });
});

/**
 * @desc    Create governorate(s) (Admin) - Supports single or bulk creation
 * @route   POST /api/v1/governorates
 * @access  Private/Admin
 */
export const createGovernorate = asyncHandler(async (req, res) => {
    const data = req.body;

    // Check if data is an array (bulk creation) or single object
    if (Array.isArray(data)) {
        // Bulk creation
        const governorates = await Governorate.insertMany(data);

        res.status(201).json({
            success: true,
            message: `${governorates.length} governorate(s) created successfully`,
            count: governorates.length,
            data: governorates
        });
    } else {
        // Single creation
        const governorate = await Governorate.create(data);

        res.status(201).json({
            success: true,
            message: 'Governorate created successfully',
            data: governorate
        });
    }
});

/**
 * @desc    Update governorate (Admin)
 * @route   PUT /api/v1/governorates/:id
 * @access  Private/Admin
 */
export const updateGovernorate = asyncHandler(async (req, res) => {
    const governorate = await Governorate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!governorate) {
        throw ApiError.notFound('Governorate not found');
    }

    res.status(200).json({
        success: true,
        message: 'Governorate updated successfully',
        data: governorate
    });
});

/**
 * @desc    Delete governorate (Admin)
 * @route   DELETE /api/v1/governorates/:id
 * @access  Private/Admin
 */
export const deleteGovernorate = asyncHandler(async (req, res) => {
    const governorate = await Governorate.findByIdAndDelete(req.params.id);

    if (!governorate) {
        throw ApiError.notFound('Governorate not found');
    }

    res.status(200).json({
        success: true,
        message: 'Governorate deleted successfully'
    });
});
