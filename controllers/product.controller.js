const mongoose = require("mongoose");
const Product = require("../models/product.model.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");
const { resolveSlug } = require("../utils/slug.utils.js");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid product id", 400);
};

// admin
exports.createProduct = catchAsync(async (req, res) => {
  const data = { ...req.body };
  data.slug = await resolveSlug(Product, data);

  const product = await Product.create(data);
  res.status(201).json({ message: "Product created", data: product });
});

exports.getAdminProduct = catchAsync(async (req, res) => {
  assertValidId(req.params.id);

  const product = await Product.findById(req.params.id).populate("category", "name slug").lean();
  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ data: product });
});

exports.updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const data = { ...req.body };

  if (data.slug) {
    const taken = await Product.exists({ slug: data.slug, _id: { $ne: id } });
    if (taken) throw new AppError("This slug is already used by another product", 409);
  }

  const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ message: "Product updated", data: product });
});


exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: { status: "archived", isAvailable: false, isFeatured: false } },
    { returnDocument: 'after'}
  );
  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ message: "Product archived", data: product });
});

// customer: active products only
exports.getProduct = catchAsync(async (req, res) => {
  const { idOrSlug } = req.params;
  const key = mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

  const product = await Product.findOne({ ...key, status: "active" })
    .populate("category", "name slug")
    .lean();
  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ data: product });
});