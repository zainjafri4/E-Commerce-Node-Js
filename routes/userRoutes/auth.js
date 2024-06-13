const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  deleteUser,
  requestPasswordReset,
  resetPassword,
} = require("../../controllers/user/authController.js");

const authmiddleware = require("../../middleware/auth/authMiddleware.js");

const {
  signupValidator,
  loginValidator,
  passwordResetReqValidator,
  passwordResetValidtor,
} = require("../../validators/auth/authValidator.js");

// Route for user signup
router.post("/signup", signupValidator, signup);

// Route for user login
router.post("/login", loginValidator, login);

// Route to delete an admin by ID
router.delete("/:userId/delete", authmiddleware, deleteUser);

router.post(
  "/request-password-reset",
  passwordResetReqValidator,
  requestPasswordReset
);

router.post("/reset-password/:token", passwordResetValidtor, resetPassword);

module.exports = router;
