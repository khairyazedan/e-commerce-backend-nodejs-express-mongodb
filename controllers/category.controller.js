
 const Category = require('../models/category.model.js');
 const catchAsync = require("../utils/catchAsync.utils.js");
 const AppError = require("../utils/appError.utils.js");
 const {resolveSlug} = require("../utils/slug.utils.js");


 exports.createCategory =catchAsync(async (req, res)=>{
    // const data = {...req.body};
    // data.slug = await resolveSlug(Category, data);

    const category = await Category.create(req.body);
    res.status(201).json({ message: "category created", data: category });

 });
