  const express = require("express");
  const {validateBody} = require("../middlewares/validateBody.middleware.js");
  const { authMiddleware } = require('../middlewares/auth.middleware.js');
  const {authorize} = require("../middlewares/role.middleware.js");
  const {createCategory, getAdminCategories, getAdminCategory, getCategories, updateCategory, getCategory} = require("../controllers/category.controller.js")
  const {addCategorySchema, updateCategorySchema} = require("../validation/category.validation.js")
  const router = express.Router();

  router.get("/", getCategories);
 
router.get("/admin", authMiddleware, authorize("admin"), getAdminCategories);
router.get("/admin/:id", authMiddleware, authorize("admin"), getAdminCategory);
 
router.post("/", authMiddleware, authorize("admin"), validateBody(addCategorySchema), createCategory);
router.patch("/:id", authMiddleware, authorize("admin"), validateBody(updateCategorySchema), updateCategory);

 
router.get("/:idOrSlug", getCategory);

 
  module.exports = router; 
  