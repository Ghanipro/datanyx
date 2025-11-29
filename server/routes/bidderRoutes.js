
const express = require('express');
const router = express.Router();
const Bidder = require('../models/Bidder');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET All Bidders
router.get('/', async (req, res) => {
  try {
    const bidders = await Bidder.find();
    res.json(bidders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Create Bidder
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // 1. Create Bidder Profile
    const bidder = new Bidder({
      name,
      email,
      phone,
      kycStatus: 'pending'
    });
    await bidder.save();

    // 2. Create User Login for Bidder
    const tempPassword = "password123"; // Default for demo
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Bidder'
    });
    await user.save();

    res.status(201).json(bidder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
