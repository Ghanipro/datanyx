
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER
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
      branch: 'Head Office' // Default branch
    });
    await user.save();

    // Create a Welcome Notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to RecoverAI',
      message: `Hello ${name}, your account has been created successfully. You can now start managing assets.`,
      type: 'success',
      isRead: false
    });

    // Generate Token
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

// FORGOT PASSWORD (SIMULATED TEMP PASSWORD)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    user.password = hashedPassword;
    await user.save();

    // LOGGING FOR DEMO PURPOSES
    console.log("=========================================");
    console.log(`[EMAIL SIMULATION] Forgot Password Request`);
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset`);
    console.log(`Body: Your temporary password is: ${tempPassword}`);
    console.log("=========================================");

    res.json({ message: `A temporary password has been sent to ${email}. (Check Server Console)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
