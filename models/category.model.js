const mongoose = require('mongoose');
const { uniqueSlug } = require('../utils/slug.utils');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: {
    type: String,
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens'],
  },
  description: { type: String, trim: true, maxlength: 500 },
  imageUrl: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'category', default: null, index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
}, { timestamps: true, toJSON: { virtuals: true } });

// "Men" and "men" count as the same name
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// build the slug from the name when none is given
categorySchema.pre('validate', async function () {
  if (!this.slug && this.name) {
    this.slug = await uniqueSlug(this.constructor, this.name, this._id)
  }
  if (this.parentCategory && this.parentCategory.equals(this._id)) {
    this.invalidate('parentCategory', 'A category cannot be its own parent.');
  }
});

// subcategories, loaded with .populate('children')
categorySchema.virtual('children', {
  ref: 'category',
  localField: '_id',
  foreignField: 'parentCategory',
});

const Category = mongoose.model('category', categorySchema);
module.exports = Category;