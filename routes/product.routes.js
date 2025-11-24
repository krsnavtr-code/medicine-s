import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  productPhotoUpload,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getProductCategories
} from '../controllers/product.controller.js';

import { protect, authorize } from '../middleware/auth.js';
import advancedResults from '../middleware/advancedResults.js';
import Product from '../models/product.model.js';


const router = express.Router();


// Public routes
router
  .route('/')
  .get(
    advancedResults(Product, {
      path: 'user',
      select: 'name email'
    }),
    getProducts
  );

router.route('/categories').get(getProductCategories);
router.route('/category/:category').get(getProductsByCategory);
router.route('/featured').get(getFeaturedProducts);
router.route('/search').get(searchProducts);

router
  .route('/:idOrSlug')
  .get(getProduct);

// Protected routes (require authentication and authorization)
router.use(protect);

// Admin only routes
router.use(authorize('admin', 'pharmacist'));

router
  .route('/')
  .post(createProduct);

router
  .route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

router
  .route('/:id/photo')
  .put(productPhotoUpload);

export default router;
