const express = require('express');
const router = express.Router();
const PropertyTax = require('../models/PropertyTax');
const Budget = require('../models/Budget');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/taxes
// @desc    Get all properties (Admin) or user's properties (Citizen)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const properties = await PropertyTax.find({}).populate('user', 'name email phone village');
      res.json(properties);
    } else {
      const properties = await PropertyTax.find({ user: req.user._id });
      res.json(properties);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/taxes/assessment
// @desc    Create a new property tax assessment
router.post('/assessment', protect, async (req, res) => {
  try {
    const { ownerName, propertyType, constructionType, builtUpArea, taxAmount, village, userId, email } = req.body;
    
    if (!ownerName || !propertyType || !builtUpArea || !taxAmount) {
      return res.status(400).json({ message: 'Missing property tax details' });
    }

    let targetUserId = userId;
    if (!targetUserId && email) {
      const { Citizen } = require('../models/User');
      const citizen = await Citizen.findOne({ email });
      if (!citizen) {
        return res.status(404).json({ message: 'No registered citizen found with this email' });
      }
      targetUserId = citizen._id;
    }
    if (!targetUserId) {
      targetUserId = req.user._id;
    }

    const shortId = Math.floor(100000 + Math.random() * 900000).toString();
    const propertyId = `PRP-${shortId}`;

    const newProperty = await PropertyTax.create({
      user: targetUserId,
      propertyId,
      ownerName,
      village: village || req.user.village || 'Gram Panchayat',
      propertyType,
      constructionType: constructionType || 'None',
      builtUpArea: Number(builtUpArea),
      taxAmount: Number(taxAmount),
      taxYear: '2026-2027',
      paymentStatus: 'Unpaid'
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/taxes/pay/:propertyId
// @desc    Simulate paying property tax
router.post('/pay/:propertyId', protect, async (req, res) => {
  try {
    const property = await PropertyTax.findOne({ propertyId: req.params.propertyId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Tax has already been paid' });
    }

    const txId = 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    property.paymentStatus = 'Paid';
    property.paidAt = new Date();
    property.transactionId = txId;
    property.paymentGateway = req.body.paymentGateway || 'Razorpay (Simulation)';
    
    await property.save();

    res.json({ message: 'Tax payment completed successfully', property });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/taxes/financial-summary
// @desc    Get financial summary (Total tax revenue, budget allocation, expenses)
router.get('/financial-summary', protect, async (req, res) => {
  try {
    // 1. Get total taxes collected (Paid property taxes)
    const paidTaxes = await PropertyTax.find({ paymentStatus: 'Paid' });
    const totalTaxesCollected = paidTaxes.reduce((sum, item) => sum + item.taxAmount, 0);

    // 2. Get total outstanding taxes (Unpaid property taxes)
    const unpaidTaxes = await PropertyTax.find({ paymentStatus: 'Unpaid' });
    const totalTaxesOutstanding = unpaidTaxes.reduce((sum, item) => sum + item.taxAmount, 0);

    // 3. Get allocated budget
    const budget = await Budget.findOne({}).sort({ createdAt: -1 });
    const allocatedBudget = budget ? budget.allocatedAmount : 1500000; // Default fallback to 15L

    // 4. Get total expenses spent on resolved complaints
    const resolvedComplaints = await Complaint.find({ status: 'Resolved' });
    const totalResolutionExpenses = resolvedComplaints.reduce((sum, item) => sum + (item.resolutionCost || 0), 0);

    const netBalance = (totalTaxesCollected + allocatedBudget) - totalResolutionExpenses;

    res.json({
      totalTaxesCollected,
      totalTaxesOutstanding,
      allocatedBudget,
      totalResolutionExpenses,
      netBalance,
      budgetDescription: budget ? budget.description : 'Default Panchayat budget allocation.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
