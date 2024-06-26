// app.js
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const productRoutes = require("./routes/adminRoutes/productRoute.js");
const authRoutes = require("./routes/userRoutes/auth.js");
const cartRoutes = require("./routes/userRoutes/cartRoutes.js");

dotenv.config();

const app = express();

// Use express.json() to parse JSON bodies into JS objects
app.use(express.json());
app.use(cors());

// Serve static files from the 'upload/images' for profile & product images directory
app.use("/upload/images", express.static("upload/images/"));

// Serve static files from the 'static' directory for account verification pages
app.use("/static", express.static("static/"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

// Import and run the scheduled job
require("./utils/cron/productExpiry.js");

// Use product routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

// Static GET API endpoint
app.get('/status', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is Now Running On Port ${PORT}`);
});
