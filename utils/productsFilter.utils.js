const mongoose = require("mongoose");
const Product = require("../models/product.model.js");

const str = (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ?gender=men&gender=unisex  or  ?gender=men,unisex. Unknown values are ignored.
const list = (value, allowed) =>
  [].concat(value ?? [])
    .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
    .map((v) => v.trim().toLowerCase())
    .filter((v) => allowed.includes(v));

const GENDERS = Product.schema.path("gender").enumValues;
const FITS = Product.schema.path("fit").enumValues;
const STATUSES = Product.schema.path("status").enumValues;

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  name: { name: 1 },
};

// ?search=&category=&gender=&fit=&brand=&minPrice=&maxPrice=&featured=&inStock=&status=(admin only)
const buildFilter = (query, { admin }) => {
  const filter = {};

  // Public callers only ever see active products. Admins may pick a status or see all.
  if (!admin) filter.status = "active";
  else if (STATUSES.includes(str(query.status))) filter.status = query.status;

  const search = str(query.search);
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { brand: rx }];
  }

  const category = str(query.category);
  if (category && mongoose.isValidObjectId(category)) filter.category = category;

  const genders = list(query.gender, GENDERS);
  const fits = list(query.fit, FITS);
  if (genders.length) filter.gender = { $in: genders };
  if (fits.length) filter.fit = { $in: fits };

  const brand = str(query.brand);
  if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}$`, "i");

  const minPrice = Number(str(query.minPrice));
  const maxPrice = Number(str(query.maxPrice));
  if (str(query.minPrice) && !Number.isNaN(minPrice)) filter.price = { ...filter.price, $gte: minPrice };
  if (str(query.maxPrice) && !Number.isNaN(maxPrice)) filter.price = { ...filter.price, $lte: maxPrice };

  if (str(query.featured) === "true") filter.isFeatured = true;
  if (str(query.inStock) === "true") filter.stockQuantity = { $gt: 0 };

  return filter;
};

// Options for paginate(Product, productListOptions({ admin }))
exports.productListOptions = ({ admin }) => ({
  buildFilter: (query) => buildFilter(query, { admin }),
  sorts: SORTS,
  populate: ["category", "name slug"],
  lean: true,
  defaultLimit: 12,
  maxLimit: 50,
});