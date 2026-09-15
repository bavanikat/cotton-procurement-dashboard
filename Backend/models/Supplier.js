const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  mandiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mandi",
    required: true
  },

  qualityScore: {
    type: Number,
    required: true
  },

  availability: {
    type: Number,
    required: true
  },

  rating: {
    type: Number,
    required: true
  },

  reliability: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);