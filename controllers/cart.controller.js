import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Calculate totals
        const totals = cart.items.reduce((acc, item) => {
            acc.totalItems += item.quantity;
            acc.totalPrice += item.product.price * item.quantity;
            return acc;
        }, { totalItems: 0, totalPrice: 0 });

        res.status(200).json({
            success: true,
            data: {
                items: cart.items,
                ...totals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        // Check if product already in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Update quantity if product already in cart
            cart.items[itemIndex].quantity += parseInt(quantity, 10);
        } else {
            // Add new item to cart
            cart.items.push({
                product: productId,
                quantity: parseInt(quantity, 10)
            });
        }

        await cart.save();

        // Populate product details
        await cart.populate('items.product');

        // Calculate totals
        const totals = cart.items.reduce((acc, item) => {
            acc.totalItems += item.quantity;
            acc.totalPrice += item.product.price * item.quantity;
            return acc;
        }, { totalItems: 0, totalPrice: 0 });

        res.status(200).json({
            success: true,
            data: {
                items: cart.items,
                ...totals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PATCH /api/v1/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Update quantity
        cart.items[itemIndex].quantity = parseInt(quantity, 10);
        await cart.save();

        // Populate product details
        await cart.populate('items.product');

        // Calculate totals
        const totals = cart.items.reduce((acc, item) => {
            acc.totalItems += item.quantity;
            acc.totalPrice += item.product.price * item.quantity;
            return acc;
        }, { totalItems: 0, totalPrice: 0 });

        res.status(200).json({
            success: true,
            data: {
                items: cart.items,
                ...totals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove item from cart
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        // Populate product details
        await cart.populate('items.product');

        // Calculate totals
        const totals = cart.items.reduce((acc, item) => {
            acc.totalItems += item.quantity;
            acc.totalPrice += item.product.price * item.quantity;
            return acc;
        }, { totalItems: 0, totalPrice: 0 });

        res.status(200).json({
            success: true,
            data: {
                items: cart.items,
                ...totals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Clear all items from cart
        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            data: {
                items: [],
                totalItems: 0,
                totalPrice: 0
            }
        });
    } catch (error) {
        next(error);
    }
};