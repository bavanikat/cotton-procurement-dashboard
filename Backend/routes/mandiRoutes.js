const express = require("express");
const router = express.Router();

const Mandi = require("../models/Mandi");

// GET all mandis
router.get("/", async (req, res) => {
  try {
    const mandis = await Mandi.find();

    res.json(mandis);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching mandis",
      error: error.message
    });
  }
});

module.exports = router;