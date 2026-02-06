import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Coupon from '../models/coupon.model.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { ApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';
import { validateCoupon } from './coupon.controller.js';

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
// export const createOrder = asyncHandler(async (req, res) => {
//   const { items, paymentMethod, shippingAddress, notes } = req.body;

//   // Start a session for transaction
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Calculate subtotal and validate products
//     let subtotal = 0;
//     const processedItems = [];

//     for (const item of items) {
//       const product = await Product.findById(item.product).session(session);

//       if (!product) {
//         throw ApiError.notFound(`Product not found: ${item.product}`);
//       }

//       if (product.stock < item.quantity) {
//         throw ApiError.badRequest(`Insufficient stock for product: ${product.name.en}`);
//       }

//       const effectivePrice = product.price;
//       subtotal += effectivePrice * item.quantity;

//       processedItems.push({
//         product: item.product,
//         quantity: item.quantity,
//         priceAtPurchase: effectivePrice,
//         attributesSelected: item.attributesSelected || {}
//       });

//       // Reduce stock
//       product.stock -= item.quantity;
//       await product.save({ session });
//     }

//     // Create order
//     const orderData = {
//       user: req.user._id,
//       items: processedItems,
//       subtotal,
//       totalAmount: subtotal,
//       paymentMethod,
//       shippingAddress,
//       notes
//     };

//     const order = await Order.create([orderData], { session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     // Populate order details
//     await order[0].populate('items.product', 'name images');
//     await order[0].populate('paymentMethod', 'name');


//     // Prepare clear response
//     const responseData = {
//       orderId: order[0]._id,
//       orderCode: order[0].orderCode,
//       user: order[0].user,
//       items: order[0].items,
//       paymentMethod: order[0].paymentMethod,
//       shippingAddress: order[0].shippingAddress,
//       notes: order[0].notes,
//       status: order[0].status,
//       subtotal: subtotal,
//       totalAmount: subtotal,
//       createdAt: order[0].createdAt,
//       updatedAt: order[0].updatedAt
//     };

//     res.status(201).json({
//       success: true,
//       message: 'Order placed successfully',
//       data: responseData
//     });
//   } catch (error) {
//     // Rollback transaction on error
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// });




export const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, shippingAddress, notes, couponCode } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw ApiError.notFound(`Product not found: ${item.product}`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for product: ${product.name.en}`);
      }

      const effectivePrice = product.price;
      subtotal += effectivePrice * item.quantity;

      processedItems.push({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: effectivePrice,
        attributesSelected: item.attributesSelected || {}
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    // ---------------------------
    // ✅ APPLY COUPON (if exists)
    // ---------------------------
    let discountAmount = 0;
    let totalAmount = subtotal;
    let appliedCoupon = null;

    if (couponCode) {
      const couponValidation = await validateCoupon(couponCode, subtotal);

      if (!couponValidation.isValid) {
        throw ApiError.badRequest(couponValidation.message);
      }

      discountAmount = couponValidation.discountAmount;
      totalAmount = subtotal - discountAmount;
      appliedCoupon = couponValidation.coupon;

      // Increment coupon usage count within the transaction
      await Coupon.findByIdAndUpdate(
        appliedCoupon._id,
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    // Create order
    const orderData = {
      user: req.user._id,
      items: processedItems,
      subtotal,
      orderTotalPrice: totalAmount,
      paymentMethod,
      shippingAddress,
      notes,
      couponCode: couponCode || null,
      discountAmount
    };

    const order = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    await order[0].populate('items.product', 'name images');
    await order[0].populate('paymentMethod', 'name');

    const responseData = {
      orderId: order[0]._id,
      orderCode: order[0].orderCode,
      user: order[0].user,
      items: order[0].items,
      paymentMethod: order[0].paymentMethod,
      shippingAddress: order[0].shippingAddress,
      notes: order[0].notes,
      status: order[0].status,
      total: subtotal,
      totalAfterDiscount: totalAmount,
      createdAt: order[0].createdAt,
      updatedAt: order[0].updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: responseData
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});


/**
 * @desc    Get user's orders
 * @route   GET /api/v1/orders/my-orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .populate('paymentMethod', 'name')
    .sort({ createdAt: -1 });

  const formattedOrders = orders.map(order => ({
    orderId: order._id,
    orderCode: order.orderCode,
    date: order.createdAt,
    status: order.status,
    totalAmount: order.orderTotalPrice,
    paymentMethod: order.paymentMethod?.name || 'cash',
    shippingAddress: {
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country
    },
    items: order.items.map(item => ({
      productId: item.product._id,
      name: item.product.name.en,
      image: item.product.images?.[0] || null,
      quantity: item.quantity,
      price: item.priceAtPurchase
    }))
  }));

  res.status(200).json({
    success: true,
    count: formattedOrders.length,
    data: formattedOrders
  });
});

/**
 * @desc    Get single order details (User & Admin)
 * @route   GET /api/v1/orders/:id
 * @access  Private (User: own orders only, Admin: all orders)
 */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price')
    .populate('user', 'firstName lastName email phone role');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Check authorization: user can only view own orders, admin can view all
  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user._id.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Not authorized to access this order');
  }

  // Format order details
  const formattedOrder = {
    orderId: order._id,
    orderCode: order.orderCode,
    orderNumber: `#${order._id.toString().slice(-8).toUpperCase()}`,
    date: order.createdAt,
    status: order.status,
    total: order.subtotal || order.orderTotalPrice,
    totalAfterDiscount: order.orderTotalPrice,

    // Full customer details for all users
    customer: {
      id: order.user._id,
      firstName: order.user.firstName,
      lastName: order.user.lastName,
      fullName: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      phone: order.user.phone,
    },

    // Payment method is stored as a string in the Order model
    paymentMethod: order.paymentMethod || 'Not specified',

    shippingAddress: {
      city: order.shippingAddress.city,
      street: order.shippingAddress.street,
      building: order.shippingAddress.building || '',
      floor: order.shippingAddress.floor || '',
      apartment: order.shippingAddress.apartment || '',
      additionalInfo: order.shippingAddress.additionalInfo || ''
    },

    items: order.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || null,
      quantity: item.quantity,
      unitPrice: item.priceAtPurchase,
      totalPrice: item.priceAtPurchase * item.quantity,
      attributesSelected: item.attributesSelected || {}
    })),

    notes: order.notes || '',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  res.status(200).json({
    success: true,
    data: formattedOrder
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/v1/orders/admin/all
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const orders = await Order.find(query)
    .populate('items.product', 'name images')
    .populate('paymentMethod', 'name')
    .populate('user', 'firstName lastName email phone ')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  const formattedOrders = orders.map(order => ({
    orderId: order._id,
    orderCode: order.orderCode,
    date: order.createdAt,
    status: order.status,
    totalAmount: order.orderTotalPrice,
    paymentMethod: order.paymentMethod?.name || 'cash',
    customer: {
      id: order.user._id,
      name: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      phone: order.user.phone
    },
    shippingAddress: order.shippingAddress,

    items: order.items.map(item => ({
      productId: item.product._id,
      name: item.product.name.en,
      image: item.product.images?.[0] || null,
      quantity: item.quantity,
      price: item.priceAtPurchase
    }))
  }));

  res.status(200).json({
    success: true,
    count: formattedOrders.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: formattedOrders
  });
});

/**
 * @desc    Cancel an order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find the order
  const order = await Order.findById(id);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Verify order belongs to the user
  if (order.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('Not authorized to cancel this order');
  }

  // Check if order can be cancelled
  const cancellableStatuses = ['pending', 'processing'];
  if (!cancellableStatuses.includes(order.status)) {
    throw ApiError.badRequest(`Cannot cancel order with status: ${order.status}`);
  }

  // Restore product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  // Restore coupon usage count if a coupon was used
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      { $inc: { usedCount: -1 } },
      { runValidators: false } // Don't validate as we're decrementing
    );
  }

  // Update order status to cancelled
  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: {
      orderId: order._id,
      orderCode: order.orderCode,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('_id orderCode status updatedAt');

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: {
      orderId: order._id,
      orderCode: order.orderCode,
      status: order.status,
      updatedAt: order.updatedAt
    }
  });
});
