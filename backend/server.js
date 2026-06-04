const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const seedWorkers = async () => {
  try {
    const { Worker } = require('./models/User');
    const workerCount = await Worker.countDocuments({ role: 'worker' });
    if (workerCount === 0) {
      console.log('Seeding initial field workers...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('worker123', salt);

      const defaultWorkers = [
        { name: 'Rajesh Kumar', email: 'rajesh@panchayat.gov.in', phone: '9876543211', age: 35, role: 'worker', gender: 'Male', village: 'Mumbai North', password: hashedPassword, isActive: true },
        { name: 'Suresh Patil', email: 'suresh@panchayat.gov.in', phone: '9876543212', age: 42, role: 'worker', gender: 'Male', village: 'Mumbai South', password: hashedPassword, isActive: true },
        { name: 'Meena Tai', email: 'meena@panchayat.gov.in', phone: '9876543213', age: 38, role: 'worker', gender: 'Female', village: 'Andheri West', password: hashedPassword, isActive: true },
        { name: 'Gopal Yadav', email: 'gopal@panchayat.gov.in', phone: '9876543214', age: 45, role: 'worker', gender: 'Male', village: 'Kandivali', password: hashedPassword, isActive: true },
        { name: 'Laxmi Devi', email: 'laxmi@panchayat.gov.in', phone: '9876543215', age: 30, role: 'worker', gender: 'Female', village: 'Worli', password: hashedPassword, isActive: true }
      ];

      await Worker.insertMany(defaultWorkers);
      console.log('Successfully seeded initial field workers.');
    }
  } catch (error) {
    console.error('Failed to seed field workers:', error.message);
  }
};

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gram-suvidha';
    console.log(`Connecting to MongoDB at: ${dbUri.replace(/:[^@]+@/, ':****@')}`);
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedWorkers();

    // Auto-seed Admin, Schemes, Budget, Meetings, and Broadcasts
    try {
      const seedData = require('./utils/seedData');
      await seedData();
    } catch (seedErr) {
      console.error('Failed to run database auto-seeding:', seedErr.message);
    }
    
    // Migrate existing users to have default language set if missing
    try {
      const { Citizen, Admin, Worker, User } = require('./models/User');
      const citResult = await Citizen.updateMany({ language: { $exists: false } }, { $set: { language: 'en' } });
      const admResult = await Admin.updateMany({ language: { $exists: false } }, { $set: { language: 'en' } });
      const wrkResult = await Worker.updateMany({ language: { $exists: false } }, { $set: { language: 'en' } });
      const usrResult = await User.updateMany({ language: { $exists: false } }, { $set: { language: 'en' } });
      console.log(`Panchayat database language migration complete. Citizens: ${citResult.modifiedCount}, Admins: ${admResult.modifiedCount}, Workers: ${wrkResult.modifiedCount}, Users: ${usrResult.modifiedCount}`);
    } catch (migErr) {
      console.error('Failed to run user language migration:', migErr.message);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please make sure you have a MongoDB instance running locally, or have added your MONGO_URI to the .env file in the backend folder.');
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/taxes', require('./routes/taxes'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/broadcasts', require('./routes/broadcasts'));
app.use('/api/chatbot', require('./routes/chatbot'));


// Basic route for testing
app.get('/', (req, res) => {
  res.send('Gram Suvidha API is running...');
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(500).json({ message: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
