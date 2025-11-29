
const express = require('express');
const router = express.Router();
const Bidder = require('../models/Bidder');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Configure Multer for PAN uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'PAN-' + Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// GET All Bidders
router.get('/', async (req, res) => {
  try {
    const bidders = await Bidder.find().sort({ createdAt: -1 });
    res.json(bidders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Register Bidder (With PAN Upload)
router.post('/register', upload.single('panDocument'), async (req, res) => {
  try {
    const { name, email, phone, aadharNumber, password } = req.body;

    // 1. Check if user exists
    let existingUser = await User.findOne({ email });
    if(existingUser) return res.status(400).json({message: "User with this email already exists"});

    // 2. Create User Account (Role: Bidder)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Bidder'
    });
    await user.save();

    // 3. Create Bidder Profile
    const bidder = new Bidder({
      userId: user._id,
      name,
      email,
      phone,
      aadharNumber,
      panUrl: req.file ? req.file.path.replace(/\\/g, "/") : null,
      kycStatus: 'pending'
    });
    await bidder.save();

    res.status(201).json({ message: "Registration successful. Please wait for officer approval." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH Update Bidder Status (Approve/Reject)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const bidder = await Bidder.findById(req.params.id);
    if(!bidder) return res.status(404).json({message: "Bidder not found"});

    bidder.kycStatus = status;
    await bidder.save();

    // Log for simulation
    if (status === 'verified') {
        console.log(`[KYC APPROVED] Bidder ${bidder.email} can now login.`);
    }

    res.json(bidder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
