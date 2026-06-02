const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const SchemeApplication = require('../models/SchemeApplication');
const Notification = require('../models/Notification');
const { Admin } = require('../models/User');
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

const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/schemes
router.post('/', protect, async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/schemes/apply
// @desc    Apply for a scheme with an ID proof, notify submitter & admins
router.post('/apply', protect, upload.any(), async (req, res) => {
  try {
    console.log('Scheme application received:', req.body);
    console.log('Files received:', req.files);
    
    const { schemeName, applicantName, age, idNumber, relationship, documentNames } = req.body;
    const files = req.files?.filter((file) => file.fieldname === 'documents') || [];

    if (!schemeName) {
      return res.status(400).json({ message: 'Scheme name is required' });
    }

    if (!applicantName) {
      return res.status(400).json({ message: 'Applicant name is required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Documents are required' });
    }

    if (!idNumber) {
      return res.status(400).json({ message: 'ID Number is required' });
    }

    // Basic regex validation for Aadhar (12 digits) or PAN (ABCDE1234F)
    const aadharRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    
    const cleanId = idNumber.replace(/\s/g, '');
    if (!aadharRegex.test(cleanId) && !panRegex.test(cleanId)) {
      return res.status(400).json({ message: 'Invalid Aadhar or PAN number format' });
    }

    let parsedDocNames = [];
    try {
      if (documentNames) parsedDocNames = JSON.parse(documentNames);
    } catch (e) {
      console.error('Error parsing document names:', e);
    }

    const docs = files.map((file, index) => ({
      name: parsedDocNames[index] || file.originalname,
      path: `/uploads/${file.filename}`
    }));

    const shortId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const applicationId = `SCH-${shortId}`;

    const application = await SchemeApplication.create({
      schemeName,
      applicantName,
      age: parseInt(age),
      idNumber: cleanId,
      documents: docs,
      idProofPath: docs.length > 0 ? docs[0].path : '',
      relationship: relationship || 'Self',
      userId: req.user._id,
      applicationId
    });

    console.log('Application created successfully:', application._id);

    // 1. Notify Citizen
    try {
      await Notification.create({
        user: req.user._id,
        userModel: 'Citizen',
        title: 'Scheme Application Submitted',
        message: `Your application for the scheme "${schemeName}" has been successfully submitted and is under review.`
      });
    } catch (notifyErr) {
      console.error('Error notifying citizen:', notifyErr.message);
    }

    // 2. Notify all Panchayat Admins
    try {
      const admins = await Admin.find({});
      const adminNotes = admins.map(admin => ({
        user: admin._id,
        userModel: 'Admin',
        title: 'New Scheme Application',
        message: `Citizen "${applicantName}" has applied for the scheme "${schemeName}".`
      }));
      if (adminNotes.length > 0) {
        await Notification.insertMany(adminNotes);
      }
    } catch (adminErr) {
      console.error('Error notifying admins of scheme application:', adminErr.message);
    }

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error in scheme application:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/schemes/applications
// @desc    Get all scheme applications (for admin)
router.get('/applications', async (req, res) => {
  try {
    const applications = await SchemeApplication.find({}).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/schemes/applications/:id
// @desc    Update scheme application status and benefit dates, notify submitter (for admin)
router.put('/applications/:id', protect, async (req, res) => {
  try {
    const { status, availableFrom, expiresAt } = req.body;
    const application = await SchemeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) application.status = status;
    if (availableFrom !== undefined) application.availableFrom = availableFrom ? new Date(availableFrom) : null;
    if (expiresAt !== undefined) application.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await application.save();

    // Notify citizen of the status update
    try {
      if (status) {
        await Notification.create({
          user: application.userId,
          userModel: 'Citizen',
          title: 'Scheme Application Update',
          message: `Your application for the scheme "${application.schemeName}" is now "${status}".`
        });
      }
    } catch (noteErr) {
      console.error('Error sending scheme update notification:', noteErr.message);
    }

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/schemes/track/:applicationId
// @desc    Track scheme application status by custom ID
router.get('/track/:applicationId', async (req, res) => {
  try {
    const application = await SchemeApplication.findOne({ applicationId: req.params.applicationId.trim() });
    if (!application) {
      return res.status(404).json({ message: 'Scheme application tracking ID not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
