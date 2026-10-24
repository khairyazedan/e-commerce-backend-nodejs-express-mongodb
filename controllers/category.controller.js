
 const Category = require('../models/category.model.js');
 const catchAsync = require("../utils/catchAsync.utils.js");
 const AppError = require("../utils/appError.utils.js");
 const {resolveSlug} = require("../utils/slug.utils.js");
 const Product = require("../models/product.model.js")

 const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 const str = (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
 

 exports.createCategory =catchAsync(async (req, res)=>{
    // const data = {...req.body};
    // data.slug = await resolveSlug(Category, data); 

    const category = await Category.create(req.body);
    res.status(201).json({ message: "category created", data: category });

 });

 exports.getCategories = catchAsync(async (req, res) => {
   const categories = await Category.find({ status: "active" }).sort({ name: 1 }).lean();
   res.status(200).json({message: "all categories", data: categories });
 });
 
 exports.getCategory = catchAsync(async (req, res) => {
   const { idOrSlug } = req.params;
   const key = mongoose.isValidObjectId(idOrSlug)
     ? { _id: idOrSlug }
     : { slug: idOrSlug.toLowerCase() };
  
   const category = await Category.findOne({ ...key, status: "active" })
     .populate("parentCategory", "name slug")
     .lean();
   if (!category) throw new AppError("Category not found", 404);
  
   const children = await Category.find({ parentCategory: category._id, status: "active" })
     .sort({ name: 1 })
     .select("name slug imageUrl")
     .lean();
  
   res.status(200).json({ data: { ...category, children } });
 });

 exports.getAdminCategories = catchAsync(async (req, res) => {
   const filter = {};
   if (["active", "inactive"].includes(str(req.query.status))) filter.status = req.query.status;
   const search = str(req.query.search);
   if (search) filter.name = new RegExp(escapeRegex(search), "i");
  
   const [categories, counts] = await Promise.all([
     Category.find(filter).sort({ name: 1 }).populate("parentCategory", "name slug").lean(),
     Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
   ]);
  
   const countById = new Map(counts.map((c) => [String(c._id), c.count]));
   const data = categories.map((c) => ({ ...c, productCount: countById.get(String(c._id)) || 0 }));
  
   res.status(200).json({ data });
 });
  

 // GET /categories/admin/:id 
exports.getAdminCategory = catchAsync(async (req, res) => {
  assertValidId(req.params.id);
 
  const category = await Category.findById(req.params.id)
    .populate("parentCategory", "name slug")
    .lean();
  if (!category) throw new AppError("Category not found", 404);
 
  res.status(200).json({ data: category });
});

exports.updateCategory = catchAsync(async (req, res) => {
   const { id } = req.params;
   const data = { ...req.body };
  
   if (data.slug) {
     const taken = await Category.exists({ slug: data.slug, _id: { $ne: id } });
     if (taken) throw new AppError("This slug is already used by another category", 409);
   }
   if (data.parentCategory) {
     if (String(data.parentCategory) === id) {
       throw new AppError("A category cannot be its own parent", 400);
     }
  
     let cursor = await Category.findById(data.parentCategory).select("parentCategory").lean();
     if (!cursor) throw new AppError("Parent category not found", 404);
  
     
     const seen = new Set();
     while (cursor && cursor.parentCategory) {
       const parentId = String(cursor.parentCategory);
       if (parentId === id) {
         throw new AppError("A category cannot be moved under one of its own subcategories", 400);
       }
       if (seen.has(parentId)) break; 
       seen.add(parentId);
       cursor = await Category.findById(parentId).select("parentCategory").lean();
     }
   }
  
   let category;
   try {
     category = await Category.findByIdAndUpdate(
       id,
       { $set: data },
       { new: true, runValidators: true }
     );
   } catch (err) {
      if (err && err.code === 11000) {
         return new AppError("A category with this name or slug already exists", 409);
       }
       return err;
   }
   if (!category) throw new AppError("Category not found", 404);
  
   res.status(200).json({ message: "category updated", data: category });
 });