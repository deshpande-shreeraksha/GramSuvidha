const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Citizen, Admin, Worker } = require('../models/User');
const SchemeApplication = require('../models/SchemeApplication');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const OTP = require('../models/OTP');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/send-otp
// @desc    Generate and send email verification OTP with a warm greeting
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    // Generate a random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update the OTP in DB (overwrite existing for this email)
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: generatedOtp });

    // Print to server console for testing/fallback
    console.log(`\n==================================================`);
    console.log(`[OTP Verification] Code for ${email} (${name || 'User'}): ${generatedOtp}`);
    console.log(`==================================================\n`);

    // Prepare and send the email
    const subject = 'Verify Your Email - GramSuvidha Smart Portal';
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; padding: 10px; background-color: #eff6ff; border-radius: 50%; margin-bottom: 10px;">
            <span style="font-size: 32px;">👋</span>
          </div>
          <h2 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 700;">Welcome to GramSuvidha!</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Smart Rural Administration Portal</p>
        </div>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
          <p style="margin: 0 0 15px 0; color: #334155; font-size: 15px; line-height: 1.5;">
            Hello <strong>${name || 'User'}</strong>,<br>
            We are excited to welcome you to our digital panchayat platform! To complete your registration and secure your account, please verify your email address.
          </p>
          
          <div style="display: inline-block; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #2563eb; background-color: #e0f2fe; padding: 12px 30px; border-radius: 8px; margin: 10px 0;">
            ${generatedOtp}
          </div>
          
          <p style="margin: 15px 0 0 0; color: #64748b; font-size: 12px;">
            This OTP is valid for 5 minutes. If you did not request this, you can safely ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="color: #475569; font-size: 13px; margin: 0 0 5px 0; font-weight: 500;">Why GramSuvidha?</p>
          <p style="color: #64748b; font-size: 12px; margin: 0 0 15px 0; line-height: 1.4;">
            Instant complaint filing, automated scheme applications, direct status updates, and multilingual AI translation.
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
            GramSuvidha Inc. &copy; ${new Date().getFullYear()} - Digital Rural Administration Initiative.
          </p>
        </div>
      </div>
    `;

    // Attempt to send email asynchronously (does not block response)
    sendEmail(email, subject, htmlContent).catch(err => {
      console.error('Failed to send OTP verification email:', err.message);
    });

    res.status(200).json({ message: 'Verification OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, age, role, villageId, village, gender, otp } = req.body;
    const userRole = role || 'citizen';

    let userExists;
    if (userRole === 'admin') {
      userExists = await Admin.findOne({ email });
    } else {
      userExists = await Citizen.findOne({ email });
    }

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP - Enforcing actual registration OTP check
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired verification OTP code' });
    }

    // Delete verified OTP
    await OTP.deleteMany({ email });

    let user;
    if (userRole === 'admin') {
      user = await Admin.create({
        name,
        email,
        phone,
        password,
        age,
        role: 'admin',
        villageId,
        village,
        gender,
      });
    } else {
      user = await Citizen.create({
        name,
        email,
        phone,
        password,
        age,
        role: 'citizen',
        villageId,
        village,
        gender,
      });
    }

    if (user) {
      // Send onboarding welcome email asynchronously
      const isSystemAdmin = user.role === 'admin';
      const welcomeSubject = isSystemAdmin ? 'Welcome to GramSuvidha Admin Portal!' : 'Welcome to GramSuvidha Citizen Portal!';
      const welcomeHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #2563eb; text-align: center;">Welcome to GramSuvidha</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Thank you for registering on GramSuvidha - the Smart Gram Panchayat Portal. Your user account is now active and ready.</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">Account Credentials & Details:</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #475569;">
              <li><strong>Registration Email:</strong> ${user.email}</li>
              <li><strong>User Role:</strong> ${isSystemAdmin ? 'Panchayat Administrator' : 'Citizen'}</li>
              <li><strong>Panchayat/Village Zone:</strong> ${user.village || 'Panchayat Area'}</li>
              ${user.villageId ? `<li><strong>Official Village ID:</strong> ${user.villageId}</li>` : ''}
            </ul>
          </div>
          ${isSystemAdmin ? `
            <p>As a <strong>Panchayat Administrator</strong>, you can use this account to:</p>
            <ul style="color: #475569; line-height: 1.6;">
              <li>Approve and verify civic infrastructure complaints filed by citizens.</li>
              <li>Dispatch field volunteers and active workers to resolve cases.</li>
              <li>Process citizen applications for local government welfare schemes.</li>
              <li>Track live metrics using the Panchayat System Intelligence engine.</li>
            </ul>
          ` : `
            <p>As a registered <strong>Citizen</strong>, you can use your portal to:</p>
            <ul style="color: #475569; line-height: 1.6;">
              <li>Register civic complaints (damaged roads, water leaks, street light failures) with photo evidence and live GPS pins.</li>
              <li>Check your eligibility and apply online for government schemes.</li>
              <li>Monitor the status and progress of your reports in real-time.</li>
              <li>Chat with our Suvidha AI assistant in your language of choice.</li>
            </ul>
          `}
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Log In to Portal</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8;">
            GramSuvidha Inc. &copy; ${new Date().getFullYear()} - Digital Rural Administration Initiative.
          </p>
        </div>
      `;

      // Trigger email sending asynchronously
      sendEmail(user.email, welcomeSubject, welcomeHtml).catch(err => {
        console.error('Asynchronous onboarding email sending failed:', err.message);
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Search sequentially in Citizen, Admin, and Worker collections
    let user = await Citizen.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      user = await Worker.findOne({ email });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile & applications
router.get('/profile', protect, async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id).select('-password');
    } else if (req.user.role === 'worker') {
      user = await Worker.findById(req.user._id).select('-password');
    } else {
      user = await Citizen.findById(req.user._id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const applications = await SchemeApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      user,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/profile/photo
// @desc    Upload profile photo
router.post('/profile/photo', protect, upload.any(), async (req, res) => {
  try {
    const file = req.files?.find((file) => file.fieldname === 'photo');
    if (!file) {
      return res.status(400).json({ message: 'No photo file uploaded' });
    }

    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id);
    } else if (req.user.role === 'worker') {
      user = await Worker.findById(req.user._id);
    } else {
      user = await Citizen.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = `/uploads/${file.filename}`;
    await user.save();

    res.json({
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    let user;
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user._id);
    } else if (req.user.role === 'worker') {
      user = await Worker.findById(req.user._id);
    } else {
      user = await Citizen.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.age = req.body.age !== undefined ? req.body.age : user.age;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    
    // Regional fields - Locked for citizen
    if (req.user.role !== 'citizen') {
      user.village = req.body.village !== undefined ? req.body.village : user.village;
      user.taluk = req.body.taluk !== undefined ? req.body.taluk : user.taluk;
      user.district = req.body.district !== undefined ? req.body.district : user.district;
      user.state = req.body.state !== undefined ? req.body.state : user.state;
      user.country = req.body.country !== undefined ? req.body.country : user.country;
      user.pincode = req.body.pincode !== undefined ? req.body.pincode : user.pincode;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role: user.role,
        profilePhoto: user.profilePhoto,
        gender: user.gender,
        villageId: user.villageId,
        village: user.village,
        taluk: user.taluk,
        district: user.district,
        state: user.state,
        country: user.country,
        pincode: user.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/workers
// @desc    Get all registered workers
router.get('/workers', async (req, res) => {
  try {
    const workers = await Worker.find({}).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/workers
// @desc    Register a new field worker
router.post('/workers', async (req, res) => {
  try {
    const { name, email, phone, age, gender, village } = req.body;
    
    const workerExists = await Worker.findOne({ email });
    if (workerExists) {
      return res.status(400).json({ message: 'Worker already exists with this email' });
    }

    const worker = await Worker.create({
      name,
      email,
      phone,
      age,
      gender,
      village,
      role: 'worker',
      password: 'worker123',
      isActive: true
    });

    if (worker) {
      // Send onboarding welcome email asynchronously
      const welcomeSubject = 'Welcome to GramSuvidha Field Operations Team!';
      const welcomeHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #2563eb; text-align: center;">Welcome to GramSuvidha</h2>
          <p>Hello <strong>${worker.name}</strong>,</p>
          <p>You have been registered as a <strong>Field Operations Worker</strong> for GramSuvidha. Your account is active, and you can now log in to access assigned tasks, inspect civic complaints, and update resolution progress.</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">Your Temporary Account Credentials & Details:</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #475569;">
              <li><strong>Login Email:</strong> ${worker.email}</li>
              <li><strong>Temporary Password:</strong> worker123</li>
              <li><strong>Designated Village/Zone:</strong> ${worker.village || 'Panchayat Area'}</li>
              <li><strong>Account Role:</strong> Field Worker</li>
            </ul>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #e11d48;"><em>Note: Please update your password immediately after logging in for security.</em></p>
          </div>
          <p>As a <strong>Field Worker</strong>, your key tasks include:</p>
          <ul style="color: #475569; line-height: 1.6;">
            <li>Viewing complaints assigned to your zone by administrators.</li>
            <li>Updating the status of tasks (In Progress, Resolved) with remarks.</li>
            <li>Uploading images as proof of resolution for citizen validation.</li>
          </ul>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Access Field Worker Portal</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8;">
            GramSuvidha Inc. &copy; ${new Date().getFullYear()} - Digital Rural Administration Initiative.
          </p>
        </div>
      `;

      // Trigger email sending asynchronously
      sendEmail(worker.email, welcomeSubject, welcomeHtml).catch(err => {
        console.error('Asynchronous worker onboarding email sending failed:', err.message);
      });
    }

    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/auth/workers/:id/status
// @desc    Toggle field worker active/inactive status
router.put('/workers/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    worker.isActive = isActive;
    await worker.save();
    res.json({ message: `Worker status marked as ${isActive ? 'Active' : 'Inactive'}`, worker });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/villages
// @desc    Get all unique villages of registered admins
router.get('/villages', async (req, res) => {
  try {
    const admins = await Admin.find({ village: { $ne: '' } }).select('village villageId');
    const villages = [];
    const seen = new Set();
    
    for (const admin of admins) {
      if (admin.village && !seen.has(admin.village.trim())) {
        seen.add(admin.village.trim());
        villages.push({ name: admin.village, id: admin.villageId });
      }
    }
    
    // Fallback defaults if no admins registered yet
    const defaults = [
      { name: 'Bengeri', id: 'VIL-583217' },
      { name: 'Sai Nagar', id: 'VIL-580020' },
      { name: 'Old Hubli', id: 'VIL-580024' },
      { name: 'Keshwapur', id: 'VIL-580023' }
    ];
    for (const d of defaults) {
      if (!seen.has(d.name)) {
        villages.push(d);
      }
    }
    res.json(villages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/my-admin
// @desc    Get assigned admin details for the citizen
router.get('/my-admin', protect, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(400).json({ message: 'Only citizens have assigned admins' });
    }
    
    let admin = null;
    if (req.user.village) {
      admin = await Admin.findOne({ village: req.user.village }).select('name phone email');
    }
    if (!admin && req.user.villageId) {
      admin = await Admin.findOne({ villageId: req.user.villageId }).select('name phone email');
    }
    
    if (!admin) {
      return res.json({
        name: 'Panchayat Chief Officer',
        phone: '1800-345-6789 (Panchayat Helpline)',
        email: 'support@panchayat.gov.in'
      });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
