const express = require("express");
const {
  addToCart,
  removeFromCart,
  getUserCart,
  decreaseQuantity,
  emptyCart,
  placeOrder,
} = require("../../controllers/user/cartController.js");
const authMiddleware = require("../../middleware/auth/authMiddleware.js");

const router = express.Router();

// Add to cart route
router.post("/:productId/add", authMiddleware, addToCart);

// Add to cart route
router.post("/:productId/decrease", authMiddleware, decreaseQuantity);

// Remove from cart route
router.post("/remove", authMiddleware, removeFromCart);

// Get user cart route
router.get("/getCart", authMiddleware, getUserCart);

// Empty The Cart
router.post("/empty-cart", authMiddleware, emptyCart);

// Empty The Cart
router.post("/place-order", authMiddleware, placeOrder);

module.exports = router;
