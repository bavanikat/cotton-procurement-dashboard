const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Mandi = require("./models/Mandi");
const Supplier = require("./models/Supplier");

const suppliers = [
  {
    name: "Erode Cotton Traders",
    mandi: "Erode",
    qualityScore: 94,
    availability: 1500,
    rating: 4.5,
    reliability: 92
  },
  {
    name: "Salem Cotton Suppliers",
    mandi: "Salem",
    qualityScore: 82,
    availability: 600,
    rating: 4.1,
    reliability: 85
  },
  {
    name: "Coimbatore Cotton Mills",
    mandi: "Coimbatore",
    qualityScore: 96,
    availability: 1200,
    rating: 4.7,
    reliability: 94
  },
  {
    name: "Tiruppur Cotton Traders",
    mandi: "Tiruppur",
    qualityScore: 89,
    availability: 1000,
    rating: 4.3,
    reliability: 88
  },
  {
    name: "Dindigul Cotton Suppliers",
    mandi: "Dindigul",
    qualityScore: 90,
    availability: 800,
    rating: 4.2,
    reliability: 87
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected!");

    await Supplier.deleteMany();

    for (const supplier of suppliers) {
      const mandi = await Mandi.findOne({ name: supplier.mandi });

      if (!mandi) {
        console.log(`Mandi not found: ${supplier.mandi}`);
        continue;
      }

      await Supplier.create({
        name: supplier.name,
        mandiId: mandi._id,
        qualityScore: supplier.qualityScore,
        availability: supplier.availability,
        rating: supplier.rating,
        reliability: supplier.reliability
      });
    }

    console.log("5 suppliers added successfully!");

    mongoose.connection.close();
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });