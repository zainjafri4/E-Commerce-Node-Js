// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getMyProducts,
  updateProduct,
  deleteProduct,
  addProductReview,
} = require("../../controllers/admin/productController");

const authMiddleware = require("../../middleware/auth/authMiddleware.js");

const {
  productValidator,
} = require("../../validators/product/productValidator");

router.post("/product", authMiddleware, productValidator(), createProduct);

router.get("/products", authMiddleware, getProducts);

router.get("/user-products", authMiddleware, getMyProducts);

router.delete("/:productId/delete", authMiddleware, deleteProduct);

router.put("/:productId/update/", authMiddleware, updateProduct);

router.put("/:productId/add-rating/", authMiddleware, addProductReview);

module.exports = router;
