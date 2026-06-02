const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/budget
// @desc    Get current budget allocation
router.get('/', async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const budgets = await Budget.find({}).sort({ year: -1 });
      return res.json(budgets);
    }
    
    if (req.query.year) {
      const budget = await Budget.findOne({ year: req.query.year });
      if (!budget) {
        return res.json(null);
      }
      return res.json(budget);
    }

    const budget = await Budget.findOne({}).sort({ createdAt: -1 });
    if (!budget) {
      // Return a default mock budget with itemized allocations (total 15 Crore)
      return res.json({
        allocatedAmount: 150000000,
        description: 'Default Panchayat annual development budget including major road developments, school upgrades, water conservation, healthcare access, and solar grids.',
        year: '2026-2027',
        items: [
          { category: 'Road Development', allocatedAmount: 100000000, description: 'Laying asphalt and repairing major link roads' },
          { category: 'Infrastructure (Schools, etc.)', allocatedAmount: 20000000, description: 'Constructing library blocks and digital classrooms' },
          { category: 'Water Supply & Sanitation', allocatedAmount: 15000000, description: 'Sinking borewells and pipeline distribution' },
          { category: 'Healthcare Services', allocatedAmount: 10000000, description: 'Stocking generic health centers and organizing camps' },
          { category: 'Solar Street Lights', allocatedAmount: 5000000, description: 'Fitting solar cells and street LEDs' }
        ]
      });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/budget
// @desc    Allocate or update annual budget
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { allocatedAmount, description, year, items } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Budget description is required' });
    }

    let finalAmount = Number(allocatedAmount);
    if (items && items.length > 0) {
      finalAmount = items.reduce((sum, item) => sum + Number(item.allocatedAmount || 0), 0);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ message: 'Total budget amount must be positive' });
    }

    // Upsert or create a new budget entry
    let budget = await Budget.findOne({ year: year || '2026-2027' });
    if (budget) {
      budget.allocatedAmount = finalAmount;
      budget.description = description;
      budget.items = items || [];
      budget.allocatedBy = req.user._id;
      await budget.save();
    } else {
      budget = await Budget.create({
        allocatedAmount: finalAmount,
        description,
        year: year || '2026-2027',
        items: items || [],
        allocatedBy: req.user._id
      });
    }

    // Fetch all citizens and email them the budget update
    try {
      const { Citizen } = require('../models/User');
      const sendEmail = require('../utils/sendEmail');
      const Notification = require('../models/Notification');
      const citizens = await Citizen.find({ role: 'citizen' });
      
      // Create database notifications for citizens
      if (citizens.length > 0) {
        const citizenNotes = citizens.map(c => ({
          user: c._id,
          userModel: 'Citizen',
          title: 'New Annual Budget Published',
          message: `The annual budget for FY ${budget.year} has been published/updated. Total amount: ₹${finalAmount.toLocaleString('en-IN')}.`
        }));
        await Notification.insertMany(citizenNotes).catch(err => {
          console.error('Error saving budget database notifications:', err.message);
        });
      }

      const emails = citizens.map(c => c.email);
      if (emails.length > 0) {
        const subject = `Gram Panchayat - Budget Allocation Published/Updated for FY ${budget.year}`;
        
        const formatRupees = (num) => {
          if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Crore`;
          if (num >= 100000) return `${(num / 100000).toFixed(2)} Lakh`;
          return num.toLocaleString('en-IN');
        };

        const itemsListHtml = budget.items.map((item, idx) => `
          <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 10px; font-weight: bold; color: #1a202c; font-size: 14px;">${idx + 1}. ${item.category}</td>
            <td style="padding: 10px; font-weight: bold; color: #0d47a1; text-align: right; font-size: 14px;">₹${formatRupees(item.allocatedAmount)}</td>
            <td style="padding: 10px; color: #4a5568; font-size: 13px;">${item.description || ''}</td>
          </tr>
        `).join('');

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0d47a1; color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Gram Panchayat Public Reserves</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Annual Budget Allocation published for FY ${budget.year}</p>
            </div>
            <div style="padding: 24px;">
              <p>Dear Citizen,</p>
              <p>The Gram Panchayat administration has published the updated budget allocations for the fiscal year <strong>${budget.year}</strong>. We are committed to complete financial transparency and tracking.</p>
              
              <div style="background-color: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                <span style="font-size: 12px; color: #2b6cb0; text-transform: uppercase; font-weight: bold; tracking-wider">TOTAL ALLOCATED BUDGET</span>
                <div style="font-size: 28px; font-weight: 900; color: #2b6cb0; margin-top: 4px;">₹${formatRupees(budget.allocatedAmount)}</div>
              </div>

              <h4 style="margin: 0 0 8px 0; color: #4a5568; text-transform: uppercase; font-size: 11px;">Budget Directives</h4>
              <p style="background-color: #f7fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #4a5568; margin-top: 0;">${budget.description}</p>
              
              <h3 style="color: #0d47a1; margin-top: 24px;">Itemized Sector Allocations</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 10px; text-align: left; font-size: 11px; color: #718096; text-transform: uppercase;">Sector / Category</th>
                    <th style="padding: 10px; text-align: right; font-size: 11px; color: #718096; text-transform: uppercase;">Allocation</th>
                    <th style="padding: 10px; text-align: left; font-size: 11px; color: #718096; text-transform: uppercase;">Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
              </table>
              
              <p style="margin-top: 24px; font-size: 12px; color: #718096;">Please log in to the GramSuvidha platform to view the detailed budget pie charts and analytics.</p>
            </div>
            <div style="background-color: #f7fafc; padding: 16px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0;">
              <strong>Gram Panchayat Administrative Board</strong><br/>
              Node: GramSuvidha transparency ledger
            </div>
          </div>
        `;

        Promise.all(emails.map(email => sendEmail(email, subject, htmlContent)))
          .then(() => console.log('Budget broadcast email alerts sent successfully to citizens.'))
          .catch(err => console.error('Error broadcasting budget emails:', err));
      }
    } catch (emailErr) {
      console.error('Failed to trigger budget update emails:', emailErr);
    }

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
