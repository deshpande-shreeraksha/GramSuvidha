const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  detailsDiscussed: {
    type: String,
    required: true,
  },
  questionsRaised: {
    type: String,
    required: true,
  },
  solutionsProvided: {
    type: String,
    required: true,
  },
  actionsNeeded: {
    type: String,
    required: true,
  },
  developmentBeforeNext: {
    type: String,
    required: true,
  },
  sentToCitizens: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  }
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
