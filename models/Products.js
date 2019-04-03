const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: 1,
      maxlength: 1000,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000
    },
    price: {
      type: Number,
      required: true,
      maxlength: 225
    },
    availability: {
      type: Boolean,
      required: true
    },
    shipping: {
      type: Boolean,
      required: true
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },
    wood: {
      type: Schema.Types.ObjectId,
      ref: "Wood",
      required: true
    },
    sold: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = { Product };
