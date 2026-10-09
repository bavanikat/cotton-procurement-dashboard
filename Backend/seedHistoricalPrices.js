const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");

const Mandi = require("./models/Mandi");
const CottonPrice = require("./models/CottonPrice");

async function seedHistoricalPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected!");

    const mandis = await Mandi.find();

    if (mandis.length === 0) {
      console.log("No mandis found!");
      return;
    }

    console.log(`Found ${mandis.length} mandis`);

    const historicalData = [];

    for (const mandi of mandis) {
      const latestPrice = await CottonPrice.findOne({
        mandiId: mandi._id
      }).sort({ date: -1 });

      if (!latestPrice) {
        console.log(`No price found for ${mandi.name}`);
        continue;
      }

      const basePrice = latestPrice.price;
      const baseQuality = latestPrice.quality;

      // Create 7 days of historical data
      for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {

        const date = new Date(latestPrice.date);

        date.setDate(date.getDate() - daysAgo);

        // Small realistic price variation
        const variation = (7 - daysAgo) * 25;

        const price = Math.round(
          basePrice - 150 + variation
        );

        const quality = Math.max(
          70,
          Math.min(100, baseQuality - (daysAgo % 3))
        );

        historicalData.push({
          mandiId: mandi._id,
          date,
          price,
          quality
        });
      }
    }

    // Remove previously generated historical records
    

    await CottonPrice.insertMany(historicalData);

    console.log(
      `${historicalData.length} historical price records inserted!`
    );

  } catch (error) {
    console.error("Error:", error.message);

  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}
