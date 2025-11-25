import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// @route   GET /api/v1/cart
// @desc    Get user's cart
// @access  Private
router.get('/', getCart);

// @route   POST /api/v1/cart/items
// @desc    Add item to cart
// @access  Private
router.post('/items', addToCart);

// @route   PATCH /api/v1/cart/items/:productId
// @desc    Update cart item quantity
// @access  Private
router.patch('/items/:productId', updateCartItem);

// @route   DELETE /api/v1/cart/items/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/items/:productId', removeFromCart);

// @route   DELETE /api/v1/cart
// @desc    Clear cart
// @access  Private
router.delete('/', clearCart);

export default router;
