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

    // Step 3: Response generation
    let responseText = '';
    let isGeminiUsed = false;

    // Check if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are Suvidha AI, the smart digital village assistant for the GramSuvidha Gram Panchayat portal.
You help citizens and administrators access database records, file complaints, check budgets, view tax dues, and get updates.

Current User Details:
${req.user ? JSON.stringify({ name: req.user.name, role: req.user.role }, null, 2) : 'Anonymous User (Not logged in)'}

Database Context:
${JSON.stringify(context, null, 2)}

Instructions:
1. Answer the user's query politely, clearly, and concisely. Use markdown formatting like bold text, bullet points, and numbered lists where appropriate to make it highly readable.
2. Rely strictly on the Database Context and GramSuvidha product capabilities to answer questions.
3. The query MUST be related to the GramSuvidha product, Gram Panchayat schemes, annual budgets, scheduled meetings, civic complaints, property taxes, public alerts, or Gram Panchayat services.
4. IMPORTANT: If the user asks about anything unrelated to this product (e.g., general knowledge, math, coding, recipe instructions, general news, entertainment, writing essays, etc.), politely decline to answer, explaining that you are only programmed to assist with GramSuvidha and Gram Panchayat services.
5. If the user is logged in, you can mention their name and check their personal complaints and property taxes in the context. If they are not logged in, tell them they can log in to view their complaints and property taxes.
6. Provide the response in the user's requested language. The user's query language is: ${lang}. Make sure to write the response in the same language (${lang}). If the language is Hindi ('hi') or Kannada ('kn'), reply in that language.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser Query: "${message}"`
                  }
                ]
              }
            ]
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0]) {
            responseText = geminiData.candidates[0].content.parts[0].text;
            isGeminiUsed = true;
          } else {
            console.warn('Unexpected Gemini API response structure, falling back.');
          }
        } else {
          console.warn('Gemini API returned error status: ' + geminiResponse.status);
        }
      } catch (geminiErr) {
        console.error('Gemini API call failed:', geminiErr.message);
      }
    }

    if (!isGeminiUsed) {
      try {
        const mlResponse = await fetch('http://127.0.0.1:8000/chatbot/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: englishQuery, context })
        });
        
        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          const rawResponse = mlData.response;
          if (rawResponse.startsWith("I apologize, I couldn't find specific details") || rawResponse.startsWith("I apologize, I couldn")) {
            responseText = getLocalFallbackResponse(englishQuery, context);
          } else {
            responseText = rawResponse;
          }
        } else {
          throw new Error('ML service returned error status ' + mlResponse.status);
        }
      } catch (mlErr) {
        console.error('Failed to communicate with ML service, falling back to local query processing:', mlErr.message);
        responseText = getLocalFallbackResponse(englishQuery, context);
      }
    }

    // Step 4: Translate response back to user's selected language
    let translatedResponse = responseText;
    if (!isGeminiUsed && lang !== 'en') {
      translatedResponse = await translateText(responseText, lang, 'en');
    }

    res.json({ text: translatedResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Helper for smart local search & keyword matching when ML/Gemini are down
function getLocalFallbackResponse(englishQuery, context) {
  const query = englishQuery.toLowerCase();
  
  // 1. Greetings
  if (query.includes('hello') || query.includes('hi') || query.includes('namaste') || query.includes('hey') || query.includes('greet')) {
    return `Namaste! I am Suvidha AI, your smart Gram Panchayat assistant. How can I help you today? You can ask me about:
1. 🌾 **Active government schemes** and eligibility.
2. 💰 **Annual Panchayat budget** details.
3. 📅 **Scheduled council meetings** and agendas.
4. 📝 **Tracking your registered complaints**.
5. 💳 **Checking your property tax dues**.
6. 📢 **Latest village announcements** and alerts.`;
  }
  
  // 2. Schemes
  if (query.includes('scheme') || query.includes('yojana') || query.includes('benefit') || query.includes('project') || query.includes('apply')) {
    const schemes = context.schemes || [];
    if (schemes.length > 0) {
      let res = "Here are the active Panchayat schemes:\n";
      schemes.forEach((s, idx) => {
        res += `\n${idx + 1}. **${s.title}**\n   - *Description*: ${s.description}\n   - *Eligibility*: ${s.eligibility}\n   - *Benefits*: ${s.benefits}\n   - *How to Apply*: ${s.applicationProcess}\n`;
      });
      res += "\nYou can apply for these online in the \"Scheme's\" sidebar tab.";
      return res;
    } else {
      return "There are no active schemes listed at this moment. Please check back later.";
    }
  }
  
  // 3. Budget
  if (query.includes('budget') || query.includes('allocation') || query.includes('money') || query.includes('fund') || query.includes('financial')) {
    const budget = context.budget;
    if (budget) {
      const allocated = budget.allocatedAmount || 0;
      const items = budget.items || [];
      let res = `The annual development budget for our Panchayat (FY ${budget.year}) is **₹${allocated.toLocaleString()}**.\n\nSector-wise Allocations:\n`;
      items.forEach((item, idx) => {
        res += `\n${idx + 1}. **${item.category}**: ₹${item.allocatedAmount.toLocaleString()}\n   - *Description*: ${item.description}\n`;
      });
      res += "\nYou can view interactive charts of this budget in the \"Panchayat Budget\" page.";
      return res;
    } else {
      return "No budget allocation has been uploaded by the Panchayat Board yet.";
    }
  }
  
  // 4. Complaints
  if (query.includes('complaint') || query.includes('report') || query.includes('issue') || query.includes('status') || query.includes('track') || query.includes('leak') || query.includes('streetlight') || query.includes('road')) {
    if (context.user) {
      const complaints = context.userComplaints || [];
      if (complaints.length > 0) {
        let res = "Here are your recent registered complaints and their status:\n";
        complaints.forEach((c, idx) => {
          res += `\n${idx + 1}. **${c.title}** (${c.category})\n   - Status: *${c.status}*\n   - Location: ${c.address || 'GPS Coordinates'}\n   - Filed on: ${new Date(c.date).toLocaleDateString()}\n`;
        });
        res += "\nYou can file a new complaint by clicking \"Register Complaint\" in the sidebar.";
        return res;
      } else {
        return "You haven't registered any complaints yet. To report an issue (like broken streetlights or water pipeline leaks), click \"Register Complaint\" in the sidebar.";
      }
    } else {
      return "Please log in to your account to track your filed complaints. Generally, you can file complaints under categories like Water, Electricity, and Roads in the \"Register Complaint\" section.";
    }
  }
  
  // 5. Meetings
  if (query.includes('meeting') || query.includes('sabha') || query.includes('minutes') || query.includes('agenda') || query.includes('council')) {
    const meetings = context.meetings || [];
    if (meetings.length > 0) {
      let res = "Here are the scheduled Gram Sabha / Panchayat meetings:\n";
      meetings.forEach((m, idx) => {
        res += `\n${idx + 1}. **${m.title}**\n   - Date: ${new Date(m.date).toLocaleDateString()}\n   - Venue: ${m.venue}\n   - Agenda: ${m.agenda}\n`;
      });
      res += "\nYou can read previous meeting minutes in the \"Meetings & Minutes\" page.";
      return res;
    } else {
      return "No Panchayat meetings are currently scheduled.";
    }
  }
  
  // 6. Taxes
  if (query.includes('tax') || query.includes('due') || query.includes('property') || query.includes('bill')) {
    if (context.user) {
      const taxes = context.userTaxes || [];
      if (taxes.length > 0) {
        let res = "Your property tax records are as follows:\n";
        taxes.forEach((t) => {
          res += `\n- Assessment No: **${t.assessmentNumber}**\n  - Total Tax Amount: ₹${t.taxAmount}\n  - Status: *${t.status}*\n  - Billing Period: ${t.billingPeriod}\n`;
        });
        res += "\nYou can pay your property taxes online using the \"Property Taxes\" page.";
        return res;
      } else {
        return "No property tax records found for your account. Please check the \"Property Taxes\" section to add one.";
      }
    } else {
      return "Please log in to check your property tax dues. You can pay your village property tax online through the \"Property Taxes\" page.";
    }
  }
  
  // 7. Alerts
  if (query.includes('election') || query.includes('vote') || query.includes('cutoff') || query.includes('blockage') || query.includes('alert') || query.includes('announcement') || query.includes('broadcast')) {
    const broadcasts = context.broadcasts || [];
    if (broadcasts.length > 0) {
      let res = "Here are the latest alerts and announcements published by the Panchayat:\n";
      broadcasts.forEach((b) => {
        res += `\n📢 **[${b.category}] ${b.title}**\n   - Scheduled Date: ${new Date(b.date).toLocaleDateString()}\n   - Timings: ${b.timings || 'N/A'}\n   - Details: ${b.description}\n`;
      });
      return res;
    } else {
      return "There are no active alerts regarding elections, cutoffs, or road blockages at the moment.";
    }
  }

  // 8. General Word Search Overlap in DB records
  const stopwords = new Set(['the', 'a', 'an', 'is', 'of', 'in', 'to', 'for', 'on', 'how', 'what', 'where', 'can', 'i', 'do', 'you', 'about', 'with', 'and', 'or', 'are', 'your', 'my']);
  const queryWords = query.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w && !stopwords.has(w));
  
  if (queryWords.length > 0) {
    let matchedResults = [];
    
    // Search schemes
    (context.schemes || []).forEach(s => {
      const matchScore = queryWords.reduce((score, w) => {
        if (s.title.toLowerCase().includes(w)) score += 5;
        if (s.description.toLowerCase().includes(w)) score += 2;
        return score;
      }, 0);
      if (matchScore > 0) {
        matchedResults.push({
          score: matchScore,
          text: `🌾 Scheme: **${s.title}** - Eligibility: ${s.eligibility}. Apply in "Scheme's" sidebar.`
        });
      }
    });
    
    // Search budget items
    if (context.budget && context.budget.items) {
      context.budget.items.forEach(item => {
        const matchScore = queryWords.reduce((score, w) => {
          if (item.category.toLowerCase().includes(w)) score += 5;
          if (item.description.toLowerCase().includes(w)) score += 2;
          return score;
        }, 0);
        if (matchScore > 0) {
          matchedResults.push({
            score: matchScore,
            text: `💰 Budget: **${item.category}** - ₹${item.allocatedAmount.toLocaleString()} allocated. Details on "Panchayat Budget" page.`
          });
        }
      });
    }

    // Search meetings
    (context.meetings || []).forEach(m => {
      const matchScore = queryWords.reduce((score, w) => {
        if (m.title.toLowerCase().includes(w)) score += 5;
        if (m.agenda.toLowerCase().includes(w)) score += 2;
        return score;
      }, 0);
      if (matchScore > 0) {
        matchedResults.push({
          score: matchScore,
          text: `📅 Meeting: **${m.title}** - Date: ${new Date(m.date).toLocaleDateString()}, Agenda: ${m.agenda}.`
        });
      }
    });

    // Search broadcasts
    (context.broadcasts || []).forEach(b => {
      const matchScore = queryWords.reduce((score, w) => {
        if (b.title.toLowerCase().includes(w)) score += 5;
        if (b.description.toLowerCase().includes(w)) score += 2;
        return score;
      }, 0);
      if (matchScore > 0) {
        matchedResults.push({
          score: matchScore,
          text: `📢 Alert: **${b.title}** [${b.category}] - ${b.description}.`
        });
      }
    });

    if (matchedResults.length > 0) {
      matchedResults.sort((a, b) => b.score - a.score);
      let res = "Based on your query, here is what I found in our Gram Panchayat database:\n";
      matchedResults.slice(0, 3).forEach((item, idx) => {
        res += `\n${idx + 1}. ${item.text}`;
      });
      return res;
    }
  }

  // 9. Standard Help guide
  return "I apologize, I couldn't find specific details for your query. Try asking about active government schemes, annual budget allocations, meeting details, property tax records, or check the status of your complaints.";
}

module.exports = router;
