const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  authorName: { type: String, required: true, trim: true, maxlength: 80 },
  authorTitle: { type: String, trim: true, maxlength: 80, default: null },
  authorAvatar: { type: String, default: null },
  location: { type: String, trim: true, maxlength: 80, default: null },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'order', default: null },
  isVerifiedBuyer: { type: Boolean, default: false },   // server-set only
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, trim: true, maxlength: 120 },
  content: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  isApproved: { type: Boolean, default: false, index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  approvedAt: { type: Date, default: null },
  isFeatured: { type: Boolean, default: false, index: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

// one testimonial per user per order (ignored when either is empty)
testimonialSchema.index(
  { user: 1, order: 1 },
  {
    unique: true,
    partialFilterExpression: {
      user: { $type: 'objectId' },
      order: { $type: 'objectId' },
    },
  },
);

const Testimonial = mongoose.model('testimonial', testimonialSchema);
module.exports = Testimonial;