const { check } = require("express-validator");

// Validator for signup route
exports.signupValidator = [
  check("firstName").notEmpty().withMessage("First name is required"), // Check that firstName is not empty
  check("lastName").notEmpty().withMessage("Last name is required"), // Check that firstName is not empty
  check("email").isEmail().withMessage("Please Prove a Valid Email Address"), // Check that email is a valid email address
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"), // Check that password is at least 6 characters long
];

// Validator for login route
exports.loginValidator = [
  check("email").isEmail().withMessage("Please Prove a Valid Email Address"), // Check that email is a valid email address
  check("password").notEmpty().withMessage("Password is required"), // Check that password is not empty
];

// Validator for pass reset req
exports.passwordResetReqValidator = [
  check("email").isEmail().withMessage("Please Prove a Valid Email Address"), // Check that email is a valid email address
];

// Validator for pass reset
exports.passwordResetValidtor = [
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];
