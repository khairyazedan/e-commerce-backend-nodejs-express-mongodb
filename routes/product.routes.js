const express = require("express");
const { validateBody } = require("../middlewares/validateBody.middleware.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js");
const { authorize } = require("../middlewares/role.middleware.js");
const {
  createProduct,
  getAdminProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} = require("../controllers/product.controller.js");
const { addProductSchema, updateProductSchema } = require("../validation/product.validation.js");
const paginate = require("../middlewares/paginate.middleware.js");
const Product = require("../models/product.model.js");
const { productListOptions } = require("../utils/productsFilter.utils.js");

const router = express.Router();


router.get("/", paginate(Product, productListOptions({ admin: false })));

router.post("/add-product", authMiddleware, authorize("admin"), validateBody(addProductSchema), createProduct);

router.get("/admin-products", authMiddleware, authorize("admin"), paginate(Product, productListOptions({ admin: true })));
router.get("/admin-products/:id", authMiddleware, authorize("admin"), getAdminProduct);

router.patch("/:id", authMiddleware, authorize("admin"), validateBody(updateProductSchema), updateProduct);
router.delete("/:id", authMiddleware, authorize("admin"), deleteProduct); // no body, so no validateBody

router.get("/:idOrSlug", getProduct);

module.exports = router;