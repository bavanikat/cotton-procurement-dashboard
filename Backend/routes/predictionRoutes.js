const express = require("express");
const router = express.Router();

const CottonPrice = require("../models/CottonPrice");

router.get("/", async (req, res) => {
  try {
    const latestPrice = await CottonPrice.findOne()
      .sort({ date: -1 });

    if (!latestPrice) {
      return res.status(404).json({
        message: "No cotton price data found"
      });
    }

    const currentPrice = latestPrice.price;

    // Temporary prediction logic
    // Later we will replace this with the ML model
    const predictedPrice = Math.round(currentPrice * 1.035);

    const change = predictedPrice - currentPrice;

    const percentage = Number(
      ((change / currentPrice) * 100).toFixed(2)
    );

    res.json({
      currentPrice,
      predictedPrice,
      change,
      percentage
    });

  } catch (error) {
    res.status(500).json({
      message: "Error generating price prediction",
      error: error.message
    });
  }
});

module.exports = router;