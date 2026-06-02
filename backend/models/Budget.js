const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  allocatedAmount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
    default: '2026-2027',
  },
  items: [
    {
      category: { type: String, required: true },
      allocatedAmount: { type: Number, required: true },
      description: { type: String }
    }
  ],
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  }
}, { timestamps: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
