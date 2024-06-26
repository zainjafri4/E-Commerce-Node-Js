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
const {
  UploadImageMulter,
} = require("../../utils/multer/multerImageUpload.js");

router.post(
  "/create",
  authMiddleware,
  UploadImageMulter(),
  productValidator(),
  createProduct
);

router.get("/get-all", getProducts);

router.get("/user-products", authMiddleware, getMyProducts);

router.delete("/:productId/delete", authMiddleware, deleteProduct);

router.put(
  "/:productId/update/",
  authMiddleware,
  UploadImageMulter(),
  updateProduct
);

router.put("/:productId/add-rating/", authMiddleware, addProductReview);

module.exports = router;
