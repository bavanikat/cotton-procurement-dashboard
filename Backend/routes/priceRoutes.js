const express = require("express");
const router = express.Router();

const CottonPrice = require("../models/CottonPrice");

// GET all cotton prices
router.get("/", async (req, res) => {
  try {
    const prices = await CottonPrice.find().populate("mandiId");

    res.json(prices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cotton prices",
      error: error.message
    });
  }
});

module.exports = router;