const { z } = require("zod");
const { makeSlug } = require("../utils/slug.utils");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const url = z.string().trim().url("Must be a valid URL");

const categoryBase = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  slug: z
    .string()
    .transform((s) => makeSlug(s))
    .refine((s) => s.length > 0, "Slug must contain letters or numbers")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
  imageUrl: url.optional(),
  // null = top-level category
  parentCategory: objectId.nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

exports.addCategorySchema = categoryBase;

exports.updateCategorySchema = categoryBase
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// for /:id params
exports.categoryIdParamSchema = z.object({ id: objectId });