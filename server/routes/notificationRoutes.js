const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET User Notifications
router.get('/:userId', async (req, res) => {
  try {
    // In a real app, use req.user.id from middleware
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as Read
router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Mock Notification (For testing)
router.post('/', async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;