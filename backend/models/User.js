const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'worker'],
    default: 'citizen',
  },
  profilePhoto: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: '',
  },
  villageId: {
    type: String,
    default: '',
  },
  village: {
    type: String,
    default: '',
  },
  taluk: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  pincode: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create separate collections
const Citizen = mongoose.model('Citizen', userSchema, 'citizens');
const Admin = mongoose.model('Admin', userSchema, 'admins');
const Worker = mongoose.model('Worker', userSchema, 'workers');
const User = mongoose.model('User', userSchema, 'users');

module.exports = {
  Citizen,
  Admin,
  Worker,
  User
};

