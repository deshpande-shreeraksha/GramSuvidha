const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Election', 'Electricity Cutoff', 'Water Cutoff', 'Water Supplying', 'Road Construction', 'Road Blockage']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timings: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  translations: {
    kn: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      timings: { type: String, default: '' }
    },
    hi: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      timings: { type: String, default: '' }
    }
  }
}, { timestamps: true });

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

module.exports = Broadcast;
