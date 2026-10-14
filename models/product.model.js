const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may only contain lowercase letters, numbers and hyphens",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brand: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    featuredImageUrl: { type: String },
    galleryImages: [{ type: String }],
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 70 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      keywords: [{ type: String, trim: true }],
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "kids", "boys", "girls"],
    },
    material: { type: String , trim: true },
    careInstructions: { type: String,trim: true},
    fit: {
      type: String,
      enum: ["slim", "oversized", "relaxed", "regular"],
    },
    sizeChartImage: { type: String },  
  },
  { timestamps: true , toJSON: { virtuals: true }},
);

productSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
productSchema.index({ name: 'text', brand: 'text', description: 'text', 'seo.keywords': 'text' });

productSchema.virtual('inStock').get(function () {
    return this.isAvailable && this.stockQuantity > 0;
  });
  
  // hide deleted products from every find/count unless the query asks about isDeleted
  productSchema.pre(/^(find|count)/, function () {
    if (this.getFilter().isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
  });

const Product = mongoose.model("product", productSchema);
module.exports = Product;
