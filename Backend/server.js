const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const mandiRoutes = require("./routes/mandiRoutes");
const priceRoutes = require("./routes/priceRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const userRoutes = require("./routes/userRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
console.log("PREDICTION ROUTE FILE LOADED:", typeof predictionRoutes);
const app = express();
console.log("SUPPLIER ROUTE FILE LOADED:", typeof supplierRoutes);
app.use(cors());
app.use(express.json());

app.use("/api/mandis", mandiRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/procurements", procurementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/prediction", predictionRoutes);
console.log("PREDICTION ROUTE REGISTERED");

app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKING");
});
console.log("SUPPLIER ROUTE REGISTERED");
app.get("/", (req, res) => {
  res.send("Cotton Procurement Backend is running!");
});

mongoose
  .connect(process.env.MONGO_URI, {
    tls: true,
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
  console.log("MongoDB connection failed:");
  console.log(error);
});