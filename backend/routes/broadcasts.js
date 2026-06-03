const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');
const Notification = require('../models/Notification');
const { Citizen } = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const translateText = require('../utils/translate');
const sendEmail = require('../utils/sendEmail');

// @route   GET /api/broadcasts
// @desc    Get all broadcasts
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/broadcasts
// @desc    Create a new broadcast, translate it, and email/notify all citizens
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { category, title, description, date, timings } = req.body;

    if (!category || !title || !description || !date) {
      return res.status(400).json({ message: 'Please provide category, title, description, and date' });
    }

    // Auto-translate to Hindi and Kannada
    const [titleKn, descKn, timingsKn] = await Promise.all([
      translateText(title, 'kn'),
      translateText(description, 'kn'),
      translateText(timings || '', 'kn')
    ]);

    const [titleHi, descHi, timingsHi] = await Promise.all([
      translateText(title, 'hi'),
      translateText(description, 'hi'),
      translateText(timings || '', 'hi')
    ]);

    const broadcast = await Broadcast.create({
      category,
      title,
      description,
      date: new Date(date),
      timings: timings || '',
      createdBy: req.user._id,
      translations: {
        kn: {
          title: titleKn,
          description: descKn,
          timings: timingsKn
        },
        hi: {
          title: titleHi,
          description: descHi,
          timings: timingsHi
        }
      }
    });

    // Notify citizens asynchronously to not block response
    const notifyCitizens = async () => {
      try {
        const citizens = await Citizen.find({ role: 'citizen' });
        if (!citizens || citizens.length === 0) return;

        // 1. Create DB notifications in their respective languages
        const notificationsData = citizens.map(c => {
          let localizedTitle = title;
          let localizedMsg = `New alert: ${description}`;

          if (c.language === 'kn') {
            localizedTitle = titleKn;
            localizedMsg = `ಹೊಸ ಸೂಚನೆ: ${descKn} ${timingsKn ? `\nಸಮಯ: ${timingsKn}` : ''}`;
          } else if (c.language === 'hi') {
            localizedTitle = titleHi;
            localizedMsg = `नई सूचना: ${descHi} ${timingsHi ? `\nसमय: ${timingsHi}` : ''}`;
          } else {
            localizedMsg = `New alert: ${description} ${timings ? `\nTimings: ${timings}` : ''}`;
          }

          return {
            user: c._id,
            userModel: 'Citizen',
            title: `[${category}] ${localizedTitle}`,
            message: localizedMsg
          };
        });

        await Notification.insertMany(notificationsData);
        console.log(`Created ${notificationsData.length} localized dashboard notifications.`);

        // 2. Send localized emails (completely translated according to c.language)
        const emailPromises = citizens.map(async (c) => {
          let subject = `[GramSuvidha Alert] Panchayat Announcement - ${category}`;
          let emailHeader = 'Gram Panchayat Announcement Alert';
          let emailSubHeader = `Broadcast Alert Category: ${category}`;
          let greeting = 'Hello Citizen,';
          let introMsg = 'Your Panchayat administration has published an important broadcast alert in your language of choice.';
          let labelDate = 'Date:';
          let labelTimings = 'Timings:';
          let footerNotice = 'This is a localized email based on your language selection. You can change your language anytime inside your GramSuvidha Profile settings.';
          let footerTitle = 'Gram Panchayat Smart Operations Node';

          let localizedTitle = title;
          let localizedDesc = description;
          let localizedDate = new Date(date).toLocaleDateString();
          let localizedTimings = timings || 'N/A';

          if (c.language === 'kn') {
            subject = `[ಗ್ರಾಮಸುವಿಧಾ ಸೂಚನೆ] ಪಂಚಾಯತ್ ಪ್ರಕಟಣೆ - ${category}`;
            emailHeader = 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಪ್ರಕಟಣೆ ಎಚ್ಚರಿಕೆ';
            emailSubHeader = `ಪ್ರಕಟಣೆ ವರ್ಗ: ${category}`;
            greeting = 'ನಮಸ್ಕಾರ ನಾಗರಿಕರೆ,';
            introMsg = 'ನಿಮ್ಮ ಪಂಚಾಯತ್ ಆಡಳಿತವು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಮುಖ ಪ್ರಸಾರ ಎಚ್ಚರಿಕೆಯನ್ನು ಪ್ರಕಟಿಸಿದೆ.';
            labelDate = 'ದಿನಾಂಕ:';
            labelTimings = 'ಸಮಯಾವಳಿ:';
            footerNotice = 'ನಿಮ್ಮ ಭಾಷೆಯ ಆಯ್ಕೆಯ ಆಧಾರದ ಮೇಲೆ ಕಳುಹಿಸಲಾದ ಸ್ಥಳೀಯ ಇಮೇಲ್ ಇದಾಗಿದೆ. ನಿಮ್ಮ ಗ್ರಾಮಸುವಿಧಾ ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು.';
            footerTitle = 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಸ್ಮಾರ್ಟ್ ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ';

            localizedTitle = titleKn;
            localizedDesc = descKn;
            localizedTimings = timingsKn || 'ಲಭ್ಯವಿಲ್ಲ';
          } else if (c.language === 'hi') {
            subject = `[ग्रामसुविधा अलर्ट] पंचायत घोषणा - ${category}`;
            emailHeader = 'ग्राम पंचायत घोषणा अलर्ट';
            emailSubHeader = `घोषणा श्रेणी: ${category}`;
            greeting = 'नमस्कार नागरिक,';
            introMsg = 'आपके पंचायत प्रशासन ने आपकी पसंद की भाषा में एक महत्वपूर्ण प्रसारण अलर्ट प्रकाशित किया है।';
            labelDate = 'तिथि:';
            labelTimings = 'समय:';
            footerNotice = 'यह आपकी भाषा पसंद के आधार पर भेजा गया स्थानीयकृत ईमेल है। आप अपने ग्रामसुविधा प्रोफाइल सेटिंग्स में कभी भी अपनी भाषा बदल सकते हैं।';
            footerTitle = 'ग्राम पंचायत स्मार्ट ऑपरेशंस नोड';

            localizedTitle = titleHi;
            localizedDesc = descHi;
            localizedTimings = timingsHi || 'उपलब्ध नहीं';
          }

          const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background-color: #0d47a1; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">${emailHeader}</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${emailSubHeader}</p>
              </div>
              <div style="padding: 24px;">
                <p>${greeting}</p>
                <p>${introMsg}</p>
                
                <div style="background-color: #f7fafc; border-left: 4px solid #0d47a1; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="margin-top: 0; color: #0d47a1;">${localizedTitle}</h3>
                  <p style="font-size: 14px; color: #4a5568;">${localizedDesc}</p>
                  
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px;">
                    <tr>
                      <td style="padding: 4px 0; font-weight: bold; width: 120px; color: #718096;">${labelDate}</td>
                      <td style="padding: 4px 0; font-weight: bold; color: #2d3748;">${localizedDate}</td>
                    </tr>
                    ${timings ? `
                    <tr>
                      <td style="padding: 4px 0; font-weight: bold; color: #718096;">${labelTimings}</td>
                      <td style="padding: 4px 0; font-weight: bold; color: #2d3748;">${localizedTimings}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>

                <p style="font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; padding-top: 15px; margin-top: 20px;">
                  ${footerNotice}
                </p>
              </div>
              <div style="background-color: #f7fafc; padding: 16px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #e2e8f0;">
                <strong>${footerTitle}</strong>
              </div>
            </div>
          `;

          return sendEmail(c.email, subject, htmlContent);
        });

        await Promise.all(emailPromises);
        console.log(`Sent ${emailPromises.length} localized emails to citizens.`);
      } catch (err) {
        console.error('Error broadcasting alerts to citizens:', err.message);
      }
    };

    // Run asynchronously
    notifyCitizens();

    res.status(201).json(broadcast);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
