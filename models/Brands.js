const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
  name: {
    type: String,
    unique: 1,
    maxlength: 100,
    required: true
  }
});

const Brand = mongoose.model("Brand", brandSchema);
module.exports = { Brand };
