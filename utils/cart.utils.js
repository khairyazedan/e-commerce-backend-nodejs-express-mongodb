const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");

/* ------------------------------------------------------------------ helpers */

const MAX_PER_ITEM = 10;
const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const PROD_FIELDS = "name slug price featuredImageUrl stockQuantity status isAvailable";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const cleanStr = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid product id", 400);
};

const parseQty = (val) => {
  const q = Number(val);
  if (!Number.isInteger(q) || q < 1) throw new AppError("Quantity must be a whole number of at least 1", 400);
  return q;
};

const getMaxAllowed = (p) => Math.min(MAX_PER_ITEM, p.stockQuantity);

const getGuestId = (req) => {
  const id = cleanStr(req.headers["x-session-id"]);
  return id && UUID_REGEX.test(id) ? id : undefined;
};

const findCart = async (req) => {
  if (req.user) return Cart.findOne({ user: req.user._id });
  const sessionId = getGuestId(req);
  return sessionId ? Cart.findOne({ sessionId, user: null }) : null;
};

const getOrCreateCart = async (req) => {
  if (req.user) {
    return (await Cart.findOne({ user: req.user._id })) || Cart.create({ user: req.user._id });
  }
  const sessionId = getGuestId(req) || crypto.randomUUID();
  return (await Cart.findOne({ sessionId, user: null })) || Cart.create({ sessionId });
};

const saveCart = async (cart) => {
  cart.subTotal = round2(cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  cart.grandTotal = cart.subTotal;
  cart.expiresAt = new Date(Date.now() + TTL_30_DAYS);
  return cart.save();
};

const syncWithCatalog = (cart) => {
  const notices = [];

  cart.items.forEach((item) => {
    const p = item.product;
    const isValid = p && p.status === "active" && p.isAvailable && p.stockQuantity > 0;

    if (!isValid) {
      notices.push(`${p?.name || "An item"} is no longer available and was removed from your cart`);
      cart.items.pull(item._id);
      return;
    }

    const limit = getMaxAllowed(p);
    if (item.quantity > limit) {
      notices.push(`Only ${limit} of ${p.name} available, quantity updated`);
      item.quantity = limit;
    }
    if (item.price !== p.price) {
      notices.push(`The price of ${p.name} changed from ${item.price} to ${p.price} EGP`);
      item.price = p.price;
    }
  });

  return notices;
};

const present = async (req, res, cart, status = 200, message) => {
  await cart.populate({ path: "items.product", select: PROD_FIELDS });

  const notices = syncWithCatalog(cart);
  if (notices.length) await saveCart(cart);

  const meta = { itemCount: cart.items.reduce((n, i) => n + i.quantity, 0), notices };
  if (!req.user) meta.sessionId = cart.sessionId;

  res.status(status).json({ ...(message && { message }), data: cart, meta });
};