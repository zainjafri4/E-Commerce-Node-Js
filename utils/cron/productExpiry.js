const Product = require("../../models/adminModels/productModels.js");

const moment = require("moment");
const schedule = require("node-schedule");

// Function to fetch and update products
const deactivateOldProducts = async () => {
  try {
    // Fetch all products
    const products = await Product.find({ active: true });

    const currentDate = moment();

    if (products && products.length > 0) {
      // Iterate over each product
      for (const product of products) {
        // Compare created_at with the current date
        if (
          moment(product.created_at).isBefore(currentDate.subtract(30, "days"))
        ) {
          // Update the product's active status
          product.active = false;
          await product.save();
        }
      }
      console.log("Products Expired successfully!");
    }
  } catch (error) {
    console.error("Error updating products:", error);
  }
};

// Schedule the job to run at 23:55 every day
const job = schedule.scheduleJob("55 23 * * *", async () => {
  console.log("Running scheduled job to deactivate old products...");
  await deactivateOldProducts();
});
