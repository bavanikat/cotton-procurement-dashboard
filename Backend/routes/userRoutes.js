const express = require("express");
const router = express.Router();

const User = require("../models/User");

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message
    });
  }
});

// POST a new user
// POST a new user
router.post("/", async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      factoryLocation,
      quantity,
      quality,
      password
    } = req.body;

    if (
      !name ||
      !company ||
      !email ||
      !phone ||
      !factoryLocation ||
      quantity == null ||
      quality == null
    ) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    if (quantity <= 0 || !["Premium", "Standard", "Basic"].includes(quality)) {
      return res.status(400).json({
        message: "Quantity and quality must be positive"
      });
    }

    // Check whether this email already exists
    let user = await User.findOne({ email });

    if (user) {
       if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }
      // Update existing user's details
      user.name = name;
      user.company = company;
      user.phone = phone;
      user.factoryLocation = factoryLocation;
      user.quantity = quantity;
      user.quality = quality;

      await user.save();

      return res.status(200).json(user);
    }

    // Create a new user if email does not exist
    user = await User.create({
      name,
      company,
      email,
      phone,
      factoryLocation,
      quantity,
      quality,
       password
    });

    res.status(201).json(user);

  } catch (error) {
  console.error("ERROR SAVING USER:", error);

  res.status(500).json({
    message: "Error saving user",
    error: error.message
  });
}
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
  return res.status(404).json({
    message: "New user"
  });
}

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

module.exports = router;