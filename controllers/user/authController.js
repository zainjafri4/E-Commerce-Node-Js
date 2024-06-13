const User = require("../../models/userModel/auth.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { default: generateToken } = require("../../utils/generateToke.js");
const sendEmail = require("../../utils/emailsend.js");
const crypto = require("crypto");

// Controller for user signup
exports.signup = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract user data from request body
    const { firstName, lastName, email, phoneNo, password, type } = req.body;

    if (!firstName || !lastName) {
      return res.status(422).json({
        success: false,
        message: "First & Last Name Must Be Provided",
      });
    }

    // Check if the user already exists with same email
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(422).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    // Check if the user already exists with same email
    const userPhone = await User.findOne({ phoneNo });
    if (userPhone) {
      return res.status(422).json({
        success: false,
        message: "Phone Number Already Added To Another Account",
      });
    }

    // Create a new user with hashed password
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      type,
    });

    return res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

// Controller for user login
exports.login = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract login data from request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email Not Found",
      });
    }

    // Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(422).json({
        success: false,
        message: "Incorrect Password please enter correct password",
      });
    }

    // Create a JWT payload with only userId
    const payload = {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      type: user?.type,
      number: user?.phoneNo,
      token: "Bearer " + generateToken(user?._id),
    };

    return res.status(200).json({
      success: true,
      data: { payload },
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    // Generate a reset token using crypto
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Sign the reset token with JWT
    const resetPasswordToken = jwt.sign(
      { resetToken, userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // 15 minutes
      }
    );

    // Set reset token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save the updated user
    await user.save();

    const resetUrl = `http://localhost:8000/api/products/reset-password/${resetPasswordToken}`;
    subject = "Password Reset Request";
    const body = `
      <p>Dear User,</p>
      <p>You have requested to reset your password. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,</p>
    `;

    await sendEmail(user?.email, subject, body);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
      data: resetPasswordToken,
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Decode the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.userId;

    // Fetch the user by ID
    const user = await User.findById(userId);
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Save the new password
    user.password = password;

    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    res.status(201).json({
      success: true,
      message: "Password Reset successfully",
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

// Controller to delete an admin
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await User.findByIdAndDelete(userId);

    // Check if the user is an admin
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User Deleted",
    });
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};
