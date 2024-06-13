// controllers/productController.js
const Product = require("../../models/adminModels/productModels.js");
const { validationResult } = require("express-validator");
const ProductReviews = require("../../models/adminModels/productReviews.js");

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, price, image_url } = req.body;

    // Check if a product with the same title already exists
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(422).json({
        success: false,
        message: "Product With The Same Title Already Exists",
      });
    }

    const product = await Product.create({
      title,
      description,
      category,
      price,
      image_url,
    });

    return res.status(201).json({
      success: true,
      data: product,
      message: "Product Added Successfully",
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

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, category, price, image_url } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (title) {
      product.title = title;
    }

    if (description) {
      product.description = description;
    }

    if (price) {
      product.price = price;
    }

    if (image_url) {
      product.image_url = image_url;
    }

    if (category) {
      product.category = category;
    }

    await product.save();

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      data: products,
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

exports.getProductsByCat = async (req, res) => {
  try {
    const { category } = req.body;

    const products = await Product.find({ category });

    return res.status(200).json({
      success: true,
      data: products,
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

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await Product.findByIdAndDelete(productId);
    if (result) {
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (err) {
    console.log({ err });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: err.message,
    });
  }
};

exports.addProductReview = async (req, res) => {
  const { stars, description } = req.body;
  const { productId } = req.params;

  try {
    // Validate stars input
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating Must Be Between 1 and 5 Stars",
      });
    }

    // Find the product by productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create a new product review
    const newReview = new ProductReviews({
      description,
      stars,
      productId,
    });

    // Save the review
    await newReview.save();

    // Update the product average rating
    const reviews = await ProductReviews.find({ productId });
    const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
    const averageRating = totalStars / reviews.length;

    // Update product averageRating field
    product.averageRating = averageRating;

    // Add the review to product reviews array
    product.reviews.push(newReview?._id);

    // Save the updated product
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: product,
    });
  } catch (error) {
    console.log("Error Adding Product Review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
};
