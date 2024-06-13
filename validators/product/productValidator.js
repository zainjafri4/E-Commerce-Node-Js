// validators/productValidation.js
const { body } = require("express-validator");

const productValidator = () => {
  return [
    body("title").isString().withMessage("Title is required"),
    body("description").isString().withMessage("Description is required"),
    body("price")
      .isNumeric()
      .withMessage("Price is required and Should be a number"),
    body("image_url")
      .isURL()
      .withMessage("Image URL is required and Should be a valid URL"),
  ];
};

module.exports = {
  productValidator,
};
