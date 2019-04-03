const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: 1,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  first_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  cart: {
    type: Array,
    default: []
  },
  history: {
    type: Array,
    default: []
  },
  role: {
    type: Number,
    default: 0
  }
});

mongoose.model("Users", userSchema);
