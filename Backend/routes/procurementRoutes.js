const express = require("express");
const router = express.Router();

const Procurement = require("../models/Procurement");


// GET all procurement records
router.get("/", async (req, res) => {
  try {
    const procurements = await Procurement.find()
      .populate("userId")
      .populate("mandiId")
      .populate("supplierId");

    res.json(procurements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching procurement records",
      error: error.message
    });
  }
});


// POST a new procurement record
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      mandiId,
      supplierId,
      quantity,
      cottonPrice,
      transportCost
    } = req.body;

    if (!userId || !mandiId || !quantity || !cottonPrice) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    if (quantity <= 0 || cottonPrice <= 0 || transportCost < 0) {
      return res.status(400).json({
        message: "Quantity and cotton price must be positive"
      });
    }

    const totalCost =
      (quantity * cottonPrice) + transportCost;

    const procurement = await Procurement.create({
      userId,
      mandiId,
      supplierId,
      quantity,
      cottonPrice,
      transportCost,
      totalCost
    });

    res.status(201).json(procurement);
  } catch (error) {
    res.status(500).json({
      message: "Error creating procurement record",
      error: error.message
    });
  }
});


module.exports = router;