const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  applicationProcess: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active',
  },
}, { timestamps: true });

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;
