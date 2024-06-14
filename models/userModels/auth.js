const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the User schema with necessary fields and data types
const UserSchema = new mongoose.Schema(
  {
    name: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
    },
    email: {
      type: String,
      unique: true, // Ensure email is unique
      lowercase: true, // Store email in lowercase
    },
    emailVerification: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpires: {
      type: Date,
    },
    password: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    type: {
      type: String,
      enum: ["user", "admin"], // Restrict userType to 'user' or 'admin'
      default: "user", // Default userType is 'user'
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

// Method to match entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Export the User model
module.exports = mongoose.model("User", UserSchema);
