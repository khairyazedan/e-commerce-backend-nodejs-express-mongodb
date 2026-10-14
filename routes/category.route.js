  const express = require("express");
  const {validateBody} = require("../middlewares/validateBody.middleware.js");
  const { authMiddleware } = require('../middlewares/auth.middleware.js');
  const {authorize} = require("../middlewares/role.middleware.js");
  const {createCategory} = require("../controllers/category.controller.js")
  const {addCategorySchema} = require("../validation/category.validation.js")
  const router = express.Router();

  router.post('/add-category',  authMiddleware, authorize('admin'),validateBody(addCategorySchema), createCategory)


 
  module.exports = router;
