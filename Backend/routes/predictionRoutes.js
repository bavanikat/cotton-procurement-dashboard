const ex
press = require("express");
const router = express.Router();

const CottonPrice = require("../models/CottonPrice");
const path = require("path");
const { PythonShell } = require("python-shell");


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

const market = "APMC Akola";

const scriptPath = path.join(
  __dirname,
  "../../ML/predict.py"
);

const options = {
  mode: "json",
  pythonOptions: ["-u"],
  args: [market]
};

const results = await PythonShell.run(scriptPath, options);

const prediction = results[0];

if (!prediction || !prediction.success) {
  return res.status(500).json({
    message: "ML prediction failed",
    error: prediction?.message || "Unknown prediction error"
  });
}

const predictedPrice = prediction.predictedPrice;
const change = prediction.change;
const percentage = prediction.percentage;

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