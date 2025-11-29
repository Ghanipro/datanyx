
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bidder = require('../models/Bidder');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER (Internal/Officer use or standard signup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Recovery Officer',
      branch: 'Head Office' 
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // CHECK BIDDER STATUS
    if (user.role === 'Bidder') {
        const bidder = await Bidder.findOne({ userId: user._id });
        if (bidder && bidder.kycStatus === 'pending') {
            return res.status(403).json({ message: "Your account is pending approval by the Recovery Officer." });
        }
        if (bidder && bidder.kycStatus === 'rejected') {
            return res.status(403).json({ message: "Your account application has been rejected." });
        }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, branch } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { name, email, branch }, 
      { new: true }
    );
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    console.log(`[EMAIL SIMULATION] Forgot Password for ${email}: ${tempPassword}`);

    res.json({ message: `A temporary password has been sent to ${email}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
