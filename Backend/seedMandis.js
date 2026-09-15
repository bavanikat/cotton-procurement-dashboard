const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
require("dotenv").config();

const Mandi = require("./models/Mandi");

const mandis = [
  {
    name: "Erode",
    district: "Erode",
    state: "Tamil Nadu",
    latitude: 11.3410,
    longitude: 77.7172
  },
  {
    name: "Salem",
    district: "Salem",
    state: "Tamil Nadu",
    latitude: 11.6643,
    longitude: 78.1460
  },
  {
    name: "Coimbatore",
    district: "Coimbatore",
    state: "Tamil Nadu",
    latitude: 11.0168,
    longitude: 76.9558
  },
  {
    name: "Tiruppur",
    district: "Tiruppur",
    state: "Tamil Nadu",
    latitude: 11.1085,
    longitude: 77.3411
  },
  {
    name: "Dindigul",
    district: "Dindigul",
    state: "Tamil Nadu",
    latitude: 10.3673,
    longitude: 77.9803
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected!");

    await Mandi.deleteMany();

    await Mandi.insertMany(mandis);

    console.log("5 mandis added successfully!");

    mongoose.connection.close();
  })
  .catch((error) => {
    console.log("Error:", error.message);
  });