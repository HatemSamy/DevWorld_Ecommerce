import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

/**
 * Merge guest cart into user cart on login
 * @param {String} guestId - Guest cart identifier
 * @param {String} userId - User ID to merge cart into
 * @returns {Object|null} - Merged user cart or null if no guest cart
 */
export const mergeGuestCartToUser = async (guestId, userId) => {
    const guestCart = await Cart.findOne({ guestId });

    if (!guestCart || guestCart.items.length === 0) {
        return null;
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
        userCart = new Cart({ user: userId, items: [] });
    }

    for (const guestItem of guestCart.items) {
        const product = await Product.findById(guestItem.product);

        if (!product || !product.isActive) {
            continue;
        }

        const existingIndex = userCart.items.findIndex(
            item => item.product.toString() === guestItem.product.toString()
        );

        if (existingIndex > -1) {
            const newQty = userCart.items[existingIndex].quantity + guestItem.quantity;

            if (newQty <= product.stock) {
                userCart.items[existingIndex].quantity = newQty;
            } else {
                userCart.items[existingIndex].quantity = product.stock;
            }
        } else {
            if (guestItem.quantity <= product.stock) {
                userCart.items.push({
                    product: guestItem.product,
                    quantity: guestItem.quantity,
                    price: guestItem.price,
                    attributes: guestItem.attributes
                });
            } else {
                userCart.items.push({
                    product: guestItem.product,
                    quantity: product.stock,
                    price: guestItem.price,
                    attributes: guestItem.attributes
                });
            }
        }
    }

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });

    return userCart;
};
