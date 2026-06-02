const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { Admin } = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('user', 'name email phone gender village');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/complaints
// @desc    Register a new complaint and notify submitter & admins
router.post('/', protect, upload.any(), async (req, res) => {
  try {
    const { user, category, description, location, priority, latitude, longitude } = req.body;
    const files = req.files || [];
    const docs = files.map(file => ({
      name: file.originalname,
      path: `/uploads/${file.filename}`
    }));
    
    const shortId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const complaintId = `COMP-${shortId}`;

    const complaint = await Complaint.create({
      user: user || req.user._id, 
      category, 
      description, 
      location,
      priority: priority || 'Medium',
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      documents: docs,
      complaintId
    });

    // 1. Notify Citizen
    await Notification.create({
      user: req.user._id,
      userModel: 'Citizen',
      title: 'Complaint Registered',
      message: `Your complaint for "${category.replace('_', ' ').toUpperCase()}" has been registered successfully. (Priority: ${priority || 'Medium'})`
    });

    // 2. Notify All Panchayat Admins
    try {
      const admins = await Admin.find({});
      const adminNotes = admins.map(admin => ({
        user: admin._id,
        userModel: 'Admin',
        title: 'New Complaint Submitted',
        message: `A new ${priority || 'Medium'} priority complaint about "${category.replace('_', ' ').toUpperCase()}" has been filed at "${location}".`
      }));
      if (adminNotes.length > 0) {
        await Notification.insertMany(adminNotes);
      }
    } catch (adminErr) {
      console.error('Error notifying admins:', adminErr.message);
    }

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status and assigned worker, notify submitter
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, assigned, resolutionCost, resolutionCostDescription } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assigned !== undefined) updateData.assigned = assigned;
    if (resolutionCost !== undefined) updateData.resolutionCost = Number(resolutionCost);
    if (resolutionCostDescription !== undefined) updateData.resolutionCostDescription = resolutionCostDescription;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('user', 'name email phone gender village');

    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Notify the citizen of updates
    try {
      if (status !== undefined) {
        await Notification.create({
          user: updatedComplaint.user._id,
          userModel: 'Citizen',
          title: 'Complaint Status Updated',
          message: `Your complaint for "${updatedComplaint.category.replace('_', ' ').toUpperCase()}" is now "${status}".`
        });
      }
      if (assigned !== undefined && assigned !== '-') {
        await Notification.create({
          user: updatedComplaint.user._id,
          userModel: 'Citizen',
          title: 'Field Worker Assigned',
          message: `Field worker "${assigned}" has been assigned to address your complaint for "${updatedComplaint.category.replace('_', ' ').toUpperCase()}".`
        });
      }
    } catch (noteErr) {
      console.error('Error sending update notification:', noteErr.message);
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/complaints/track/:complaintId
// @desc    Track complaint status by its custom ID
router.get('/track/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId.trim() }).populate('user', 'name email phone gender village');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint tracking ID not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
