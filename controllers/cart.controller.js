const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");

const {
  validateId,
  parseQty,
  getMaxAllowed,
  getGuestId,
  findCart,
  getOrCreateCart,
  saveCart,
  present,
} = require("../utils/cart.utils.js");



exports.getCart = catchAsync(async (req, res) => {
  const cart = await findCart(req);
  if (!cart) {
    return res.status(200).json({
      data: { items: [], subTotal: 0, grandTotal: 0 },
      meta: { itemCount: 0, notices: [] },
    });
  }
  await present(req, res, cart);
});

exports.addItem = catchAsync(async (req, res) => {
  const { productId } = req.body;
  validateId(productId);
  const quantity = req.body.quantity === undefined ? 1 : parseQty(req.body.quantity);

  const product = await Product.findOne({ _id: productId, status: "active", isAvailable: true })
    .select("name price stockQuantity");
  if (!product) throw new AppError("Product not found or unavailable", 404);

  const limit = getMaxAllowed(product);
  if (limit < 1) throw new AppError("This product is out of stock", 409);

  const cart = await getOrCreateCart(req);
  const existing = cart.items.find((i) => i.product.equals(product._id));
  const newQuantity = (existing?.quantity || 0) + quantity;

  if (newQuantity > limit) {
    throw new AppError(`You can have at most ${limit} of this product in your cart`, 409);
  }

  if (existing) {
    existing.quantity = newQuantity;
    existing.price = product.price;
  } else {
    cart.items.push({ product: product._id, quantity, price: product.price });
  }

  await saveCart(cart);
  await present(req, res, cart, 200, "Item added to cart");
});

exports.updateItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  validateId(productId);
  const quantity = parseQty(req.body.quantity);

  const cart = await findCart(req);
  const item = cart?.items.find((i) => i.product.equals(productId));
  if (!item) throw new AppError("Item not found in cart", 404);

  const product = await Product.findOne({ _id: productId, status: "active", isAvailable: true })
    .select("name price stockQuantity");
  if (!product) throw new AppError("Product not found or unavailable", 404);

  const limit = getMaxAllowed(product);
  if (quantity > limit) throw new AppError(`You can have at most ${limit} of this product in your cart`, 409);

  item.quantity = quantity;
  item.price = product.price;

  await saveCart(cart);
  await present(req, res, cart, 200, "Cart updated");
});

exports.removeItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  validateId(productId);

  const cart = await findCart(req);
  const item = cart?.items.find((i) => i.product.equals(productId));
  if (!item) throw new AppError("Item not found in cart", 404);

  cart.items.pull(item._id);
  await saveCart(cart);
  await present(req, res, cart, 200, "Item removed");
});

exports.clearCart = catchAsync(async (req, res) => {
  const cart = await findCart(req);
  if (cart) {
    cart.items = [];
    await saveCart(cart);
  }
  res.status(200).json({
    message: "Cart cleared",
    data: { items: [], subTotal: 0, grandTotal: 0 },
    meta: { itemCount: 0, notices: [] },
  });
});

exports.mergeGuestCart = catchAsync(async (req, res) => {
  const sessionId = getGuestId(req);
  const guest = sessionId ? await Cart.findOne({ sessionId, user: null }) : null;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!guest || !guest.items.length) {
    if (guest) await guest.deleteOne();
    cart = cart || (await Cart.create({ user: req.user._id }));
    return present(req, res, cart);
  }

  if (!cart) {
    guest.user = req.user._id;
    guest.sessionId = null;
    await saveCart(guest);
    return present(req, res, guest, 200, "Cart merged");
  }

  const products = await Product.find({
    _id: { $in: guest.items.map((i) => i.product) },
    status: "active",
    isAvailable: true,
  }).select("name price stockQuantity");
  const byId = new Map(products.map((p) => [String(p._id), p]));

  guest.items.forEach((g) => {
    const product = byId.get(String(g.product));
    if (!product) return;
    const limit = getMaxAllowed(product);
    if (limit < 1) return;

    const existing = cart.items.find((i) => i.product.equals(product._id));
    if (existing) {
      existing.quantity = Math.min(existing.quantity + g.quantity, limit);
      existing.price = product.price;
    } else {
      cart.items.push({ product: product._id, quantity: Math.min(g.quantity, limit), price: product.price });
    }
  });

  await saveCart(cart);
  await guest.deleteOne();
  await present(req, res, cart, 200, "Cart merged");
});