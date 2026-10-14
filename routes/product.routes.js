  const express = require("express");
  const {validateBody} = require("../middlewares/validateBody.middleware.js");
  const { authMiddleware } = require('../middlewares/auth.middleware.js');
  const {authorize} = require("../middlewares/role.middleware.js");
  const {createProduct} = require("../controllers/product.controller.js")
  const {addProductSchema} = require("../validation/product.validation.js")
  const router = express.Router();

  router.post('/add-product',  authMiddleware, authorize('admin'),validateBody(addProductSchema), createProduct)


 
  module.exports = router;
