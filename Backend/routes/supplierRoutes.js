const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find().populate("mandiId");
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching suppliers",
      error: error.message
    });
  }
});

module.exports = router;