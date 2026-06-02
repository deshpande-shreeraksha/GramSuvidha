const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Citizen',
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  assigned: {
    type: String,
    default: '-',
  },
  location: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  documents: [{
    name: String,
    path: String
  }],
  complaintId: {
    type: String,
    unique: true,
  },
  resolutionCost: {
    type: Number,
    default: 0,
  },
  resolutionCostDescription: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;

