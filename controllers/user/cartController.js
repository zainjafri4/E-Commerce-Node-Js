const User = require("../../models/userModels/auth.js");
const Product = require("../../models/adminModels/productModels.js");
const Cart = require("../../models/userModels/cartModels.js");
const { customEmail } = require("../../utils/email/index.js");

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
    const userId = req.user._id;

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

const placeOrder = async (req, res) => {
  const userId = req.user._id; // Assuming user is authenticated and userId is available

  try {
    // Fetch cart details with populated product data
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Fetch user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check product stock and calculate total price
    let totalPrice = 0;
    let outOfStock = false;

    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        outOfStock = true;
        break;
      }
      const itemTotal = item.quantity * product.price;
      totalPrice += itemTotal;
    }

    if (outOfStock) {
      return res.status(422).json({
        success: false,
        message: "Stock is less than quantity for one or more products",
      });
    }

    // Calculate shipping charges
    let shippingCharge = 0;
    if (totalPrice <= 200) {
      shippingCharge = 30;
    } else if (totalPrice <= 400) {
      shippingCharge = 25;
    } else if (totalPrice > 401) {
      shippingCharge = 20;
    }

    // Add shipping charges to total price
    const finalTotalPrice = totalPrice + shippingCharge;

    // Deduct product stock and save
    for (const item of cart.items) {
      const product = item.productId;
      product.stock -= item.quantity;
      await product.save(); // Save updated product stock
    }

    // Create HTML for invoice dynamically
    let invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Invoice</title>
        <style>
          body {
            font-family: sans-serif;
          }
          .invoice-container {
            width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
          }
          h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border: 1px solid #ccc;
          }
          th {
            background-color: #f2f2f2;
          }
          .total-price {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <h2>Order Invoice</h2>
          <p><strong>Customer Name:</strong> ${user?.name?.firstName} ${
      user?.name?.lastName
    }</p>
          <p><strong>Customer Email:</strong> ${user?.email}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Loop through cart items to add each product to the invoice
    for (const item of cart.items) {
      const product = item.productId;
      const itemTotal = item.quantity * product.price;

      invoiceHtml += `
        <tr>
          <td>${product.title}</td>
          <td>${item.quantity}</td>
          <td>${product.price}</td>
          <td>${itemTotal}</td>
        </tr>
      `;
    }

    // Add total price and shipping charges to the invoice
    invoiceHtml += `
          </tbody>
        </table>
        <p><strong>Total Price (Products):</strong> ${totalPrice}</p>
        <p><strong>Shipping Charges:</strong> ${shippingCharge}</p>
        <p><strong>Final Total Price:</strong> ${finalTotalPrice}</p>
        <p><strong>Company Bank Account:</strong></p>
        <ul>
          <li>Account Name: Market Wizards </li>
          <li>Account Number: 123456789 </li>
          <li>Bank Name: Muslim Commercial Bank </li>
          <li>Sort Code: 01-12-45</li>
        </ul>
        <p>Thank you for your order!</p>
        <p>Please complete the payment to the above bank account and send the transaction receipt to ${process.env.FROM_EMAIL}, Once the order is confirmed your order will be shipped</p>
      </div>
    </body>
    </html>
    `;

    // Send invoice email
    await customEmail(user?.email, "Order Invoice", invoiceHtml);

    // Clear cart after email is sent
    await Cart.updateOne({ userId }, { $set: { items: [] } });

    return res.status(200).json({
      success: true,
      message: "Order placed successfully. Invoice sent to your email.",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getUserCart,
  decreaseQuantity,
  emptyCart,
  placeOrder,
};
