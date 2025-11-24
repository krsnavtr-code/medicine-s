import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
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
      type: String,
      required: [true, 'Brand name is required'],
      enum: [
        'TSA',
        'Brand2',
        'Brand3',
        'Brand4',
        'Brand5',
        'Brand6',
        'Brand7',
        'Brand8',
        'Brand9',
        'Brand10'
      ]
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },

    // Category & Subcategory
    category: {
      type: String,
      required: [true, 'Please select category for this product'],
      enum: [
        'Tablets',
        'Capsules',
        'Syrups',
        'Injection',
        'Drops',
        'Inhalers',
        'Ointments',
        'Creams',
        'Baby Care',
        'Personal Care',
        'Healthcare Devices',
        'Surgical',
        'Herbal & Ayurvedic',
        'Homeopathy'
      ]
    },
    subCategory: {
      type: String,
      enum: [
        'Pain Relief', 'Fever', 'Cold & Cough', 'Allergy', 'Digestive Health',
        'Heart Health', 'Diabetes Care', 'Women\'s Health', 'Men\'s Health',
        'Baby Care', 'Elderly Care', 'First Aid', 'Vitamins & Supplements',
        'Sexual Wellness', 'Skin Care', 'Hair Care', 'Oral Care', 'Eye Care',
        'Wound Care', 'Surgical', 'Mobility Aids', 'Support & Braces',
        'Monitoring', 'Therapeutic', 'Respiratory', 'Alternative Medicine',
        'Homeopathy', 'Ayurvedic', 'Herbal Supplements', 'Other'
      ]
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      validate: {
        validator: function(value) {
          return value >= this.price;
        },
        message: 'MRP must be greater than or equal to selling price'
      }
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
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative']
    },
    inStock: {
      type: Boolean,
      default: true
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: [
        'Strip', 'Bottle', 'Box', 'Pack', 'Tube', 'Jar',
        'Sachet', 'Vial', 'Ampoule', 'Capsule', 'Tablet',
        'Syringe', 'Inhaler', 'Drop', 'Pieces', 'Pair',
        'Set', 'Roll', 'Meter', 'Gram', 'Kilogram',
        'Milliliter', 'Liter', 'Inch', 'Centimeter', 'Foot',
        'Yard', 'Meter', 'Square Meter', 'Cubic Centimeter', 'Dozen',
        'Pack of 5', 'Pack of 10', 'Pack of 20', 'Pack of 30', 'Pack of 50',
        'Pack of 100', 'Carton', 'Can', 'Pouch', 'Packet', 'Bag', 'Tin', 'Barrel',
        'Drum', 'Canister', 'Dispenser', 'Bowl', 'Tray', 'Blister', 'Strip of 5',
        'Strip of 10', 'Strip of 14', 'Strip of 15', 'Strip of 20', 'Strip of 30',
        'Bottle of 30ml', 'Bottle of 60ml', 'Bottle of 100ml', 'Bottle of 200ml',
        'Suspension', 'Lotion', 'Solution', 'Suppository', 'Others'
      ]
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
      required: [true, 'Salt composition is required']
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required']
    },
    packSize: {
      type: String,
      required: [true, 'Pack size is required']
    },
    dosageForm: {
      type: String,
      required: [true, 'Dosage form is required'],
      enum: [
        'Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Inhaler',
        'Ointment', 'Cream', 'Gel', 'Lotion', 'Spray', 'Powder',
        'Suspension', 'Lotion', 'Solution', 'Suppository', 'Others'
      ]
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    storageInfo: {
      type: String,
      required: [true, 'Storage information is required']
    },
    safetyInformation: {
      type: String,
      required: [true, 'Safety information is required']
    },
    howToUse: {
      type: String,
      required: [true, 'Usage instructions are required']
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
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
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
