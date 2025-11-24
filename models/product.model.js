import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    // Reference to the user who created the product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Basic Product Information
    productType: {
      type: String,
      enum: ["single", "combo"],
      default: "single"
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    brand: {
      type: String
    },
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },

    // Category & Subcategory
    category: {
      type: String
    },
    subCategory: {
      type: String
    },

    // Pricing
    price: {
      type: Number,
      min: [0, 'Price must be a positive number']
    },
    mrp: {
      type: Number,
      validate: {
        validator: function(value) {
          // If price is not set yet (during creation), skip validation
          if (typeof this.price === 'undefined') return true;
          return value >= this.price;
        },
        message: 'MRP must be greater than or equal to selling price'
      },
      required: [true, 'MRP is required']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%']
    },
    sellingPrice: {
      type: Number,
      default: function() {
        return this.price;
      }
    },

    // Stock & Inventory
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative']
    },
    inStock: {
      type: Boolean,
      default: true
    },
    unit: {
      type: String
    },

    // Images
    images: [
      {
        public_id: {
          type: String,
          required: true
        },
        url: {
          type: String,
          required: true
        }
      }
    ],
    thumbnail: {
      type: String
    },

    // Prescription Requirement
    isPrescriptionRequired: {
      type: Boolean,
      default: false
    },
    requiresUpload: {
      type: Boolean,
      default: false
    },

    // Medicine Information
    saltComposition: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    packSize: {
      type: String,
    },
    dosageForm: {
      type: String
    },
    expiryDate: {
      type: Date,
    },
    storageInfo: {
      type: String,
    },
    safetyInformation: {
      type: String,
    },
    howToUse: {
      type: String,
    },
    benefits: [{
      type: String
    }],
    sideEffects: [{
      type: String
    }],

    // Ratings & Reviews
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // SEO
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title cannot exceed 70 characters']
    },
    metaKeywords: {
      type: [String],
      default: []
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },

    // Status Flags
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },

    // System Fields
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create product slug from the name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Calculate selling price if price or discount changes
  if (this.isModified('price') || this.isModified('discount')) {
    this.sellingPrice = this.price - (this.price * this.discount) / 100;
  }
  
  // Update inStock based on stock
  this.inStock = this.stock > 0;
  
  next();
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', 'saltComposition': 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1, isDeleted: 1 });

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, item) => acc + item.rating, 0);
  return sum / this.reviews.length;
});

// Query middleware to filter out deleted products
productSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Static method to get product by slug
productSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
