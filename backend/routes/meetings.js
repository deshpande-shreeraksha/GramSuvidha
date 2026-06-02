const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/meetings
// @desc    Get all meetings logged in Panchayat
router.get('/', protect, async (req, res) => {
  try {
    const meetings = await Meeting.find({}).sort({ date: -1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/meetings
// @desc    Create a Panchayat meeting log and email minutes to citizens
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { date, time, detailsDiscussed, questionsRaised, solutionsProvided, actionsNeeded, developmentBeforeNext } = req.body;

    if (!date || !time || !detailsDiscussed || !questionsRaised || !solutionsProvided || !actionsNeeded || !developmentBeforeNext) {
      return res.status(400).json({ message: 'All meeting fields are required' });
    }

    const meeting = await Meeting.create({
      date,
      time,
      detailsDiscussed,
      questionsRaised,
      solutionsProvided,
      actionsNeeded,
      developmentBeforeNext,
      addedBy: req.user._id
    });

    // Send emails and database notifications
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
          title: 'New Panchayat Meeting Logged',
          message: `Official minutes for the Panchayat meeting on ${new Date(date).toLocaleDateString()} have been published. Topic: ${detailsDiscussed.slice(0, 80)}...`
        }));
        await Notification.insertMany(citizenNotes).catch(err => {
          console.error('Error saving meeting database notifications:', err.message);
        });
      }

      const emails = citizens.map(c => c.email);
      if (emails.length > 0) {
        const subject = `Gram Panchayat - Meeting Minutes & Discussion Summary (${new Date(date).toLocaleDateString()})`;
        const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #0d47a1; color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px;">Gram Panchayat General Body Meeting</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Official Minutes & Action Resolution Summary</p>
            </div>
            <div style="padding: 24px;">
              <p>Dear Citizen,</p>
              <p>Please find below the official minutes and resolved actions from the Gram Panchayat body meeting held on <strong>${formattedDate}</strong> at <strong>${time}</strong>.</p>
              
              <hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 20px 0;" />
              
              <h3 style="color: #0d47a1; margin-top: 0;">1. Topics & Details Discussed</h3>
              <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d47a1; border-radius: 4px;">${detailsDiscussed.replace(/\n/g, '<br/>')}</p>
              
              <h3 style="color: #0d47a1;">2. Questions Raised by Citizens</h3>
              <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d47a1; border-radius: 4px;">${questionsRaised.replace(/\n/g, '<br/>')}</p>
              
              <h3 style="color: #0d47a1;">3. Solutions Provided</h3>
              <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d47a1; border-radius: 4px;">${solutionsProvided.replace(/\n/g, '<br/>')}</p>
              
              <h3 style="color: #0d47a1;">4. Immediate Actions Needed</h3>
              <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d47a1; border-radius: 4px;">${actionsNeeded.replace(/\n/g, '<br/>')}</p>
              
              <h3 style="color: #0d47a1;">5. Planned Infrastructure Developments before Next Meeting</h3>
              <p style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #0d47a1; border-radius: 4px;">${developmentBeforeNext.replace(/\n/g, '<br/>')}</p>
              
              <hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 20px 0;" />
              
              <p style="font-size: 13px; color: #64748b;">You received this email because you are a registered resident of the Gram Panchayat on the GramSuvidha platform. Log into the portal to check historical minutes and download official certificates.</p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <strong>Gram Panchayat Administrative Board</strong><br/>
              Government of India / Local Panchayati Raj Node
            </div>
          </div>
        `;

        Promise.all(emails.map(email => sendEmail(email, subject, htmlContent)))
          .then(async () => {
            meeting.sentToCitizens = true;
            await meeting.save();
            console.log('Meeting minutes emails sent successfully to citizens.');
          })
          .catch(err => console.error('Error sending meeting email broadcasts:', err));
      }
    } catch (emailErr) {
      console.error('Failed to trigger meeting emails:', emailErr);
    }

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
