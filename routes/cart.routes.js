const router = require("express").Router();
const optionalAuth = require("../middlewares/optionalAuth.middleware.js");
const { authMiddleware } = require("../middlewares/auth.middleware.js"); 
const cart = require("../controllers/cart.controller.js");

// Public-but-personalised: works for guests and logged-in users
router.get("/", optionalAuth, cart.getCart);
router.post("/items", optionalAuth, cart.addItem);
router.patch("/items/:productId", optionalAuth, cart.updateItem);
router.delete("/items/:productId", optionalAuth, cart.removeItem);
router.delete("/", optionalAuth, cart.clearCart);

// Must be logged in
router.post("/merge", authMiddleware, cart.mergeGuestCart);

module.exports = router;