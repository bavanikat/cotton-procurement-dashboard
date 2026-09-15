const mongoose = require("mongoose");

const procurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  mandiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mandi",
    required: true
  },

  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },

  quantity: {
    type: Number,
    required: true
  },

  cottonPrice: {
    type: Number,
    required: true
  },

  transportCost: {
    type: Number,
    required: true
  },

  totalCost: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Procurement", procurementSchema);