const User = require("../../models/userModels/auth.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const generateToken = require("../../utils/token/generateToke.js");
const crypto = require("crypto");
const moment = require("moment");

const {
  customEmail,
  emailVerification,
} = require("../../utils/email/index.js");

// Controller for user signup
exports.signup = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract user data from request body
    const {
      firstName,
      lastName,
      email,
      phoneNo,
      address,
      city,
      country,
      zipCode,
      password,
      type,
    } = req.body;

    const profileImageName = req?.file?.filename;

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

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      name: {
        firstName,
        lastName,
      },
      email,
      password,
      phoneNo,
      address,
      city,
      country,
      zipCode,
      type,
      profileImageName: profileImageName || "dummy",
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: Date.now() + 3600000, // 1 hour
    });

    const verificationLink = `${process.env.WEB_URL}/api/auth/verify-email?token=${verificationToken}`;

    await emailVerification(email, verificationLink);

    return res.status(201).json({
      success: true,
      message: "Email Verification Email Sent",
      data: newUser,
    });
  } catch (error) {
    console.log({ error });
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
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
    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return res.status(422).json({
        success: false,
        message: "Incorrect Password please enter correct password",
      });
    }

    if (!user.emailVerification) {
      return res.status(422).json({
        success: false,
        message: "Please Verify Your Email First",
      });
    }

    // Create a JWT payload with only userId
    const payload = {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      type: user?.type || "-",
      number: user?.phoneNo || "-",
      emailVerification: user?.emailVerification,
      address: user?.address || "-",
      city: user?.city || "-",
      country: user?.country || "-",
      zipCode: user?.zipCode || "-",
      profileImageName: user?.profileImageName || "-",
      token: "Bearer " + generateToken(user?._id),
    };

    return res.status(200).json({
      success: true,
      data: { payload },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Extract user data from request body
    const {
      firstName,
      lastName,
      email,
      phoneNo,
      address,
      city,
      country,
      zipCode,
      password,
      type,
    } = req.body;

    const profileImageName = req?.file?.filename;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (firstName) {
      user.name.firstName = firstName;
    }
    if (lastName) {
      user.name.lastName = lastName;
    }
    if (email) {
      user.email = email;
    }
    if (profileImageName) {
      if (user.profileImageName) {
        const filePath = path.join(
          __dirname,
          "../../upload/images",
          user.profileImageName
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      user.profileImageName = profileImageName;
    }
    if (phoneNo) {
      user.phoneNo = phoneNo;
    }
    if (address) {
      user.address = address;
    }
    if (city) {
      user.city = city;
    }
    if (country) {
      user.country = country;
    }
    if (zipCode) {
      user.zipCode = zipCode;
    }
    if (password) {
      user.password = password;
    }
    await user.save();

    return res.status(201).json({
      success: true,
      data: user,
      message: "User Updated",
    });
  } catch (error) {
    console.log({ error });
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
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

    const resetUrl = `${process.env.WEB_URL}/api/products/reset-password/${resetPasswordToken}`;
    subject = "Password Reset Request";
    const body = `
      <p>Dear User,</p>
      <p>You have requested to reset your password. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,</p>
    `;

    await customEmail(user?.email, subject, body);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
      data: resetPasswordToken,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
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
    } catch (error) {
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
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
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
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
};

exports.verifyUserAccount = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    // Redirect to token_invalid.html if token is missing
    return res.redirect("../../static/token_invalid.html");
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Redirect to token_invalid.html if token is invalid or expired
      return res.redirect("../../static/token_invalid.html");
    }

    // Update user email verification status
    user.emailVerification = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save();

    // Redirect to account_verified.html after successful verification
    return res.redirect("../../static/account_verified.html");
  } catch (error) {
    console.error("Error verifying user account:", error);
    // Redirect to token_invalid.html on internal server error
    return res.redirect("../../static/token_invalid.html");
  }
};
