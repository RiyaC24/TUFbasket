const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    image: {type: String, required: true},
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);