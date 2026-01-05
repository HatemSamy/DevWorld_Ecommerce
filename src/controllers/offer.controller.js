import Offer from '../models/offer.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';

/**
 * @desc    Get all active offers
 * @route   GET /api/v1/offers
 * @access  Public
 */
export const getAllOffers = async (req, res, next) => {
    try {
        const now = new Date();

        const offers = await Offer.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        })
            .populate('products', 'name images price salePrice')
            .populate('categories', 'name')
            .sort({ createdAt: -1 });

        const localizedOffers = localizeDocuments(offers, req.language);

        res.status(200).json({
            success: true,
            count: offers.length,
            data: localizedOffers
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single offer
 * @route   GET /api/v1/offers/:id
 * @access  Public
 */
export const getOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.id)
            .populate('products', 'name images price salePrice')
            .populate('categories', 'name');

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        const localizedOffer = localizeDocument(offer, req.language);

        res.status(200).json({
            success: true,
            data: localizedOffer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create offer (Admin)
 * @route   POST /api/v1/offers
 * @access  Private/Admin
 */
export const createOffer = async (req, res, next) => {
    try {
        const offer = await Offer.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Offer created successfully',
            data: offer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update offer (Admin)
 * @route   PUT /api/v1/offers/:id
 * @access  Private/Admin
 */
export const updateOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Offer updated successfully',
            data: offer
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete offer (Admin)
 * @route   DELETE /api/v1/offers/:id
 * @access  Private/Admin
 */
export const deleteOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
