const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Budget = require('../models/Budget');
const Complaint = require('../models/Complaint');
const Meeting = require('../models/Meeting');
const Broadcast = require('../models/Broadcast');
const PropertyTax = require('../models/PropertyTax');
const { protectOptional } = require('../middleware/authMiddleware');
const translateText = require('../utils/translate');

// @route   POST /api/chatbot/query
// @desc    Query Panchayat data and return localized AI response via ML Service
// @access  Public / Optional Protected
router.post('/query', protectOptional, async (req, res) => {
  try {
    const { message, lang = 'en' } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Query message is required' });
    }

    // Step 1: Translate user query to English for NLP processing if not English
    let englishQuery = message.toLowerCase();
    if (lang !== 'en') {
      englishQuery = (await translateText(message, 'en')).toLowerCase();
    }

    // Step 2: Fetch MongoDB database records to construct the context for the ML service
    const [schemes, budget, meetings, broadcasts] = await Promise.all([
      Scheme.find({ status: 'Active' }),
      Budget.findOne({}).sort({ createdAt: -1 }),
      Meeting.find({}).sort({ date: -1 }).limit(5),
      Broadcast.find({}).sort({ createdAt: -1 }).limit(5)
    ]);

    let userComplaints = [];
    let userTaxes = [];
    if (req.user) {
      userComplaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3);
      userTaxes = await PropertyTax.find({ user: req.user._id });
    }

    const context = {
      schemes: schemes.map(s => ({ title: s.title, description: s.description, eligibility: s.eligibility, benefits: s.benefits, applicationProcess: s.applicationProcess })),
      budget: budget ? { year: budget.year, allocatedAmount: budget.allocatedAmount, items: budget.items } : null,
      meetings: meetings.map(m => ({ title: m.title, date: m.date, venue: m.venue, agenda: m.agenda })),
      broadcasts: broadcasts.map(b => ({ category: b.category, title: b.title, description: b.description, date: b.date, timings: b.timings })),
      userComplaints: userComplaints.map(c => ({ title: `${c.category} Complaint`, category: c.category, status: c.status, address: c.location, date: c.createdAt })),
      userTaxes: userTaxes.map(t => ({ assessmentNumber: t.propertyId, taxAmount: t.taxAmount, status: t.paymentStatus, billingPeriod: t.taxYear })),
      user: req.user ? { name: req.user.name, role: req.user.role } : null
    };

    // Step 3: Call the Python ML Service for NLP intent matching and response generation
    let responseText = '';
    try {
      const mlResponse = await fetch('http://127.0.0.1:8000/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: englishQuery, context })
      });
      
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        responseText = mlData.response;
      } else {
        throw new Error('ML service returned error status ' + mlResponse.status);
      }
    } catch (mlErr) {
      console.error('Failed to communicate with ML service, falling back to local query processing:', mlErr.message);
      
      // Fallback local matching if Python ML service is down
      if (englishQuery.includes('scheme') || englishQuery.includes('yojana') || englishQuery.includes('project')) {
        responseText = 'Here are the active Panchayat schemes:\n' + schemes.map((s, i) => `${i+1}. ${s.title} (${s.description})`).join('\n');
      } else if (englishQuery.includes('budget')) {
        responseText = budget ? `Total Budget for FY ${budget.year} is ₹${budget.allocatedAmount.toLocaleString()}` : 'Budget not set.';
      } else {
        responseText = "Panchayat ML Service classification is temporarily offline. Please check active schemes or budget sections directly in the sidebar tabs.";
      }
    }

    // Step 4: Translate response back to user's selected language
    let translatedResponse = responseText;
    if (lang !== 'en') {
      translatedResponse = await translateText(responseText, lang, 'en');
    }

    res.json({ text: translatedResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
