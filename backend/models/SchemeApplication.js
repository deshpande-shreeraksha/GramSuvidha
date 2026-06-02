const mongoose = require('mongoose');

const schemeApplicationSchema = new mongoose.Schema({
  schemeName: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
  },
  idProofPath: {
    type: String,
    required: false,
  },
  documents: [{
    name: String,
    path: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Application Submitted', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  relationship: {
    type: String,
    enum: ['Self', 'Father', 'Mother', 'Spouse', 'Sibling', 'Daughter', 'Son'],
    default: 'Self',
  },
  availableFrom: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
  },
  applicationId: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

const SchemeApplication = mongoose.model('SchemeApplication', schemeApplicationSchema);

module.exports = SchemeApplication;
