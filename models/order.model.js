const mongoose = require('mongoose');
const crypto = require('crypto');
const addressSchema = require('./address.model.js');   

const ORDER_STATUSES = [
  'pending', 'processing', 'shipping', 'out-for-delivery', 'delivered', 'cancelled', 'returned',
];

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  productName: { type: String, required: true },   
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, min: 0 },              
});

const trackingInfoSchema = new mongoose.Schema({
  carrier: { type: String },
  trackingNum: { type: String },
  estimatedDeliveryDate: { type: Date },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ORDER_STATUSES, required: true },
  updatedAt: { type: Date, default: Date.now },
  comment: { type: String },
});

const paymentInfoSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paidAt: { type: Date },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    default: () =>
      `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'An order needs at least one item.',
    },
  },
  shippingAddress: { type: addressSchema, required: true },
  itemsPrice: { type: Number, min: 0 },       
  shippingPrice: { type: Number, required: true, default: 0, min: 0 },
  taxPrice: { type: Number, required: true, default: 0, min: 0 },
  totalPrice: { type: Number, min: 0 },       
  paymentInfo: paymentInfoSchema,
  orderStatus: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
  trackingInfo: trackingInfoSchema,
  statusHistory: [statusHistorySchema],
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: null },
}, { timestamps: true, toJSON: { virtuals: true } });

orderSchema.virtual('isCancelled').get(function () {
  return this.orderStatus === 'cancelled';
});

// runs before validation, so the required checks see the calculated values
orderSchema.pre('validate', async function () {
  this.items.forEach((item) => {
    item.subtotal = round2(item.unitPrice * item.quantity);
  });
  this.itemsPrice = round2(this.items.reduce((sum, item) => sum + item.subtotal, 0));
  this.totalPrice = round2(this.itemsPrice + this.shippingPrice + this.taxPrice);

  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.orderStatus, comment: 'Order placed' });
  }
});

const Order = mongoose.model('order', orderSchema);
module.exports = Order;