import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const { items, paymentMethod, shippingAddress, notes } = req.body;

        // Calculate total and validate products
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name.en}`
                });
            }

            const effectivePrice = product.salePrice || product.price;
            totalAmount += effectivePrice * item.quantity;

            processedItems.push({
                product: item.product,
                quantity: item.quantity,
                priceAtPurchase: effectivePrice,
                attributesSelected: item.attributesSelected || {}
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: processedItems,
            totalAmount,
            paymentMethod,
            shippingAddress,
            notes
        });

        await order.populate('items.product', 'name images');
        await order.populate('paymentMethod', 'name');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name images')
            .populate('paymentMethod', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name images')
            .populate('paymentMethod', 'name')
            .populate('user', 'firstName lastName email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/v1/orders/admin/all
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(query)
            .populate('items.product', 'name images')
            .populate('paymentMethod', 'name')
            .populate('user', 'firstName lastName email phone')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};
