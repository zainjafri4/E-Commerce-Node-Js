const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  updateUser,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  verifyUserAccount,
} = require("../../controllers/user/authController.js");

const authmiddleware = require("../../middleware/auth/authMiddleware.js");

const {
  signupValidator,
  loginValidator,
  passwordResetReqValidator,
  passwordResetValidtor,
} = require("../../validators/auth/authValidator.js");
const {
  UploadImageMulter,
} = require("../../utils/multer/multerImageUpload.js");

// Route for user signup
router.post("/signup", signupValidator, UploadImageMulter(), signup);

// Route for user login
router.post("/login", loginValidator, login);

// Route for user login
router.post("/update", authmiddleware, UploadImageMulter(), updateUser);

// Route to delete an admin by ID
router.delete("/:userId/delete", authmiddleware, deleteUser);

router.post(
  "/request-password-reset",
  passwordResetReqValidator,
  requestPasswordReset
);

router.post("/reset-password/:token", passwordResetValidtor, resetPassword);

// Route for verifying user email
router.get("/verify-email", verifyUserAccount);

module.exports = router;
