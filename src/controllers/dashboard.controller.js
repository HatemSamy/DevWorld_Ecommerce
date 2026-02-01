import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/dashboard/statistics
 * @access  Private/Admin/SuperAdmin
 */
export const getStatistics = asyncHandler(async (req, res) => {
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments()
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            totalProducts,
            totalUsers
        }
    });
});
