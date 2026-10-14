const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const url = z.string().trim().url("Must be a valid URL");
const {makeSlug} = require('../utils/slug.utils')

const productBase = z.object({
  name: z.string().trim().min(1, "Name is required").max(150, "Name must be 150 characters or fewer"),
  slug: z
  .string()
  .transform((s) => makeSlug(s))
  .refine((s) => s.length > 0, "Slug must contain letters or numbers")
  .optional(),
    // .string()
    // .trim()
    // .toLowerCase()
    // .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens")
    // .optional(), 
  description: z.string().trim().min(1, "Description is required"),
  brand: z.string().trim().optional(),
  category: objectId,
  subCategory: z.string().trim().optional(),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price cannot be negative"),
  featuredImageUrl: url.optional(),
  galleryImages: z.array(url).max(10, "Maximum 10 gallery images").optional(),
  stockQuantity: z.number().int("Stock must be a whole number").min(0, "Stock cannot be negative").optional(),
  seo: z
    .object({
      metaTitle: z.string().trim().max(70, "Meta title max 70 characters").optional(),
      metaDescription: z.string().trim().max(160, "Meta description max 160 characters").optional(),
      keywords: z.array(z.string().trim().min(1)).max(20).optional(),
    })
    .optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  gender: z.enum(["men", "women", "unisex", "kids", "boys", "girls"]).optional(),
  material: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  fit: z.enum(["slim", "oversized", "relaxed", "regular"]).optional(),
  sizeChartImage: url.optional(),
});

exports.addProductSchema = productBase;

exports.updateProductSchema = productBase
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });