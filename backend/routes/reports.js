const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// @route   GET /api/reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({});
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/reports
router.post('/', async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
