const mongoose = require("mongoose");

const mandiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  district: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  latitude: {
    type: Number
  },

  longitude: {
    type: Number
  }
});

module.exports = mongoose.model("Mandi", mandiSchema);