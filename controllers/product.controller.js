 const Product = require('../models/product.model.js');
 const catchAsync = require("../utils/catchAsync.utils.js");
 const AppError = require("../utils/appError.utils.js");
 const {uniqueSlug, resolveSlug} = require("../utils/slug.utils.js");

 

 exports.createProduct =catchAsync(async (req, res)=>{
    const data = {...req.body};
    data.slug = await resolveSlug(Product, data);

    const product = await Product.create(data);
    res.status(201).json({ message: "Product created", data: product });

 });