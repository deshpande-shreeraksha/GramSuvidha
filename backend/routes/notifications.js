const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get current user's notifications
router.get('/', protect, async (req, res) => {
  try {
    let userModel = 'Citizen';
    if (req.user.role === 'admin') {
      userModel = 'Admin';
    } else if (req.user.role === 'worker') {
      userModel = 'Worker';
    }

    const notifications = await Notification.find({
      user: req.user._id,
      userModel: userModel
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this notification as read' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
