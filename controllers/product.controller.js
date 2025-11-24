import Product from '../models/product.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import catchAsync from '../utils/catchAsync.js';
import path from 'path';
import slugify from 'slugify';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = catchAsync(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Product.find(JSON.parse(queryStr)).populate('reviews.user', 'name');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    data: products
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/v1/products/:idOrSlug
// @access  Public
// @desc    Get single product by ID or slug
// @route   GET /api/v1/products/:idOrSlug
// @access  Public
export const getProduct = catchAsync(async (req, res, next) => {
  const { idOrSlug } = req.params;
  
  let product;
  
  // Check if the parameter is a valid MongoDB ObjectId
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idOrSlug).populate('reviews.user', 'name');
  } 
  
  // If not found by ID or not a valid ID, try to find by slug
  if (!product) {
    product = await Product.findOne({ slug: idOrSlug }).populate('reviews.user', 'name');
  }

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id or slug of ${req.params.idOrSlug}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = catchAsync(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Create slug from name if not provided
  if (!req.body.slug && req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this product`,
        401
      )
    );
  }

  // If name is being updated, update the slug
  if (req.body.name && req.body.name !== product.name) {
    req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  // Update the product
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this product`,
        401
      )
    );
  }

  // Soft delete
  product.isDeleted = true;
  await product.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload photo for product
// @route   PUT /api/v1/products/:id/photo
// @access  Private/Admin
// @desc    Upload photo for product
// @route   PUT /api/v1/products/:id/photo
// @access  Private/Admin
export const productPhotoUpload = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this product`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000; // 1MB default
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${product._id}${path.parse(file.name).ext}`;

  // Upload file to storage (example using local file system)
  const uploadPath = `${process.env.FILE_UPLOAD_PATH || 'public/uploads'}/products`;
  
  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  file.mv(`${uploadPath}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Update product with image details
    const image = {
      public_id: file.name.split('.')[0],
      url: `/uploads/products/${file.name}`
    };

    // If no thumbnail, set first image as thumbnail
    if (!product.thumbnail) {
      product.thumbnail = image.url;
    }

    product.images.push(image);
    await product.save();

    res.status(200).json({
      success: true,
      data: image
    });
  });
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:category
// @access  Public
// @desc    Get products by category
// @route   GET /api/v1/products/category/:category
// @access  Public
export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const products = await Product.find({ 
    category: { $regex: new RegExp(category, 'i') },
    isActive: true,
    isDeleted: { $ne: true }
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
export const getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ 
    isFeatured: true,
    isActive: true,
    isDeleted: { $ne: true }
  }).limit(10).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get all unique product categories
// @route   GET /api/v1/products/categories
// @access  Public
export const getProductCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category', { 
    isActive: true, 
    isDeleted: { $ne: true } 
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Search products
// @route   GET /api/v1/products/search
// @access  Public
export const searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return next(new ErrorResponse('Please provide a search term', 400));
  }

  const products = await Product.find({
    $text: { $search: q },
    isActive: true,
    isDeleted: { $ne: true }
  });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
