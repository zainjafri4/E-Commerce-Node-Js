const User = require("../../models/userModels/cartModels.js");
const Product = require("../../models/adminModels/productModels.js");
const Cart = require("../../models/userModels/cartModels.js");

const addToCart = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;

    const { productId } = req.params;

    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const productFound = cart.items.find((item) =>
      item.productId.equals(productId)
    );

    if (productFound) {
      // Product exists in the cart, update quantity and total price
      productFound.quantity += quantity;
      productFound.totalPrice = productFound.quantity * product.price;
    } else {
      // Product does not exist in the cart, add new product
      cart.items.push({
        productId,
        quantity,
        totalPrice: quantity * product.price,
      });
    }

    await cart.save();

    return res.status(201).json({
      success: true,
      data: cart,
      message: "Product Added To Cart",
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

const decreaseQuantity = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;

    const { productId } = req.params;

    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No Cart Created",
      });
    }

    const productFound = cart.items.find((item) =>
      item.productId.equals(productId)
    );
    if (productFound) {
      // Product exists in the cart, decrease quantity
      productFound.quantity -= quantity;
      if (productFound.quantity <= 0) {
        // Remove the item from the cart if quantity is zero or less
        cart.items.splice(productFound, 1);
      } else {
        // Update the total price if the item is still in the cart
        productFound.totalPrice = productFound.quantity * product.price;
      }

      await cart.save();
    }

    return res.status(201).json({
      success: true,
      data: cart,
      message: "Quanitity Reduced From Cart",
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

const removeFromCart = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;

    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No Cart Created",
      });
    }

    cart.items = cart.items.filter((item) => !item.productId.equals(productId));

    await cart.save();

    return res.status(201).json({
      success: true,
      data: cart,
      message: "Product Removed From Cart",
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

const getUserCart = async (req, res) => {
  try {
    const { userId } = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No Cart Created",
      });
    }

    return res.status(201).json({
      success: true,
      data: cart,
      message: "Product Removed From Cart",
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

const emptyCart = async (req, res) => {
  try {
    const user = req.user;
    const userId = user?._id;

    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
      return res.status(201).json({
        success: true,
        data: cart,
        message: "Cart Cleared",
      });
    } else {
      let cart = await Cart.create({
        userId,
        items: [],
      });
      return res.status(201).json({
        success: true,
        data: cart,
        message: "Cart Cleared",
      });
    }
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: error.message,
    });
  }
};
module.exports = {
  addToCart,
  removeFromCart,
  getUserCart,
  decreaseQuantity,
  emptyCart,
};
