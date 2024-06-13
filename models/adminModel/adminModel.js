const mongoose = require("mongoose");

// Define the User schema with necessary fields and data types
const adminSchema = new mongoose.Schema(
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
    password: {
      typ: String,
    },
    type: {
      type: "admin",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: { createdAt: "created_at" } }
);

// Export the User model
module.exports = mongoose.model("Admin", adminSchema);
