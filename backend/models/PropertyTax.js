const mongoose = require('mongoose');

const propertyTaxSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true,
  },
  propertyId: {
    type: String,
    required: true,
    unique: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    default: '',
  },
  propertyType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Vacant'],
    required: true,
  },
  constructionType: {
    type: String,
    enum: ['Pucca', 'Semi-Pucca', 'Kutcha', 'None'],
    default: 'None',
  },
  builtUpArea: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  taxYear: {
    type: String,
    required: true,
    default: '2026-2027',
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  paidAt: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
  paymentGateway: {
    type: String,
    default: 'Razorpay (Simulation)',
  }
}, { timestamps: true });

const PropertyTax = mongoose.model('PropertyTax', propertyTaxSchema);

module.exports = PropertyTax;
