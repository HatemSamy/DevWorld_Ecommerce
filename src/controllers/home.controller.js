import Offer from '../models/offer.model.js';
import Product from '../models/product.model.js';
import Banner from '../models/banner.model.js';
import { localizeDocuments, localizeDocument } from '../utils/helpers.util.js';

/**
 * @desc    Get home page data (featured products, active offers, banner)
 * @route   GET /api/v1/home
 * @access  Public
 */
export const getHomePageData = async (req, res, next) => {
    try {
        const now = new Date();

        // Get the singleton banner
        const banner = await Banner.getSingleton();
        const activeBannerImages = banner && banner.isActive
            ? banner.images
                .filter(img => img.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
            : [];

        // Get active offers
        const offers = await Offer.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        })
            .populate('products', 'name images price salePrice')
            .populate('categories', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get featured products
        const featuredProducts = await Product.find({
            isActive: true,
            isFeatured: true
        })
            .populate('brand', 'name image')
            .populate('category', 'name')
            .limit(12);

        // Get latest products
        const latestProducts = await Product.find({ isActive: true })
            .populate('brand', 'name image')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .limit(12);

        // Localize data
        const localizedBannerImages = activeBannerImages.map(img =>
            localizeDocument(img.toObject ? img.toObject() : img, req.language)
        );
        const localizedOffers = localizeDocuments(offers, req.language);
        const localizedFeatured = localizeDocuments(featuredProducts, req.language);
        const localizedLatest = localizeDocuments(latestProducts, req.language);

        res.status(200).json({
            success: true,
            data: {
                bannerImages: localizedBannerImages,
                offers: localizedOffers,
                featuredProducts: localizedFeatured,
                latestProducts: localizedLatest
            }
        });
    } catch (error) {
        next(error);
    }
};

