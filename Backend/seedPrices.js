const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Mandi = require("./models/Mandi");
const CottonPrice = require("./models/CottonPrice");

const prices = [
  { mandi: "Erode", price: 7200, quality: 94 },
  { mandi: "Salem", price: 7100, quality: 82 },
  { mandi: "Coimbatore", price: 7450, quality: 96 },
  { mandi: "Tiruppur", price: 7300, quality: 89 },
  { mandi: "Dindigul", price: 7250, quality: 90 }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected!");

    await CottonPrice.deleteMany();

    for (const item of prices) {
      const mandi = await Mandi.findOne({ name: item.mandi });

      if (!mandi) {
        console.log(`Mandi not found: ${item.mandi}`);
        continue;
      }

      await CottonPrice.create({
        mandiId: mandi._id,
        date: new Date(),
        price: item.price,
        quality: item.quality
      });
    }

    console.log("Cotton prices added successfully!");

    mongoose.connection.close();
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });