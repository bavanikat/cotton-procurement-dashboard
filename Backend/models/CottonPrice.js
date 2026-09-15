const mongoose = require("mongoose");

const cottonPriceSchema = new mongoose.Schema({
  mandiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mandi",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  quality: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("CottonPrice", cottonPriceSchema);