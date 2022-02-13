const mongoose = require("mongoose");
const product = mongoose.Schema(
  {
    name: String,
    category: String,
    color: [],
    size: [],
    image: [],
    price: Number,
    description: String,
    minQuantity: Number,
    quantity: Number,
    SKU: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", product);
