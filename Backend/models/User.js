const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  company: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  },

  factoryLocation: {
    type: String,
    required: true
  },

  quantity: {
    type: Number ,
    required: true
  },

  quality: {
    type:String,
    required: true
  },
  password: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);