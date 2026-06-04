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
const https = require('https');
const http = require('http');

// Safe fetch polyfill using native Node.js http/https modules
const safeFetch = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const reqOptions = {
        method: options.method || 'GET',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        headers: options.headers || {},
      };

      const httpLib = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = httpLib.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: async () => {
              try {
                return JSON.parse(data);
              } catch (e) {
                return {};
              }
            },
            text: async () => data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Safe date formatter to prevent RangeError: Invalid time value
function formatDate(dateVal) {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
}

const projectContext = {
  projectName: "Gram-Suvidha AI",
  description: "An intelligent, secure, full-stack smart governance web application designed to modernize rural governance. It streamlines Gram Panchayat administration, empowers rural citizens, and automates tracking and scheme applications under a beautiful, unified dark glassmorphic design system.",
  techStack: {
    frontend: "React 19, Vite 6, Tailwind CSS 3, Recharts, Lucide Icons, React Router 7",
    backend: "Node.js, Express, Nodemailer, MongoDB Driver",
    database: "MongoDB Atlas (Mongoose ODM)",
    deployment: "Vercel Serverless Configurations"
  },
  keyFeatures: [
    "Role-Based Access Control (RBAC): Citizen Portal (OTP registration, schemes eligibility & apply, complaints track, tax payment, budget) and Administrative Portal (analytics, worker assignment, scheme approval).",
    "Secure Onboarding & Authentication: Locked onboarding, OTP verification, developer sandbox bypass removed.",
    "Nodemailer Delivery: Verification via SMTP, automatic Ethereal Mail fallback for developer testing, automated budget and meetings email broadcasts.",
    "OpenStreetMap Geocoding: Reverse-geocodes complaints coordinates using Nominatim API, OSM maps embedded in UI.",
    "Modern Glassmorphic Design: Styled globally in index.css (dark glassmorphism), responsive layout overlays, mobile-friendly grid spacing.",
    "Performance: Lazy loading components via React.lazy and React.Suspense."
  ],
  howToUse: {
    fileComplaint: "To file a complaint: 1. Click on the 'Register Complaint' option in the sidebar menu. 2. Select a category for the issue (Water, Electricity, Roads, Welfare, or Other). 3. Provide a detailed description of the problem. 4. Upload photo evidence of the issue if available. 5. Lock the automatic GPS location coordinates of the incident. 6. Click 'Submit Complaint' to register it. You can track its progress under the 'Citizen Dashboard' or 'My Submissions' tab.",
    payTaxes: "To view and pay property taxes: 1. Click on 'Property Taxes' in the sidebar. 2. If you are an administrator, you can calculate and register a new tax bill under 'Assign Tax Assessment' using the area (sq ft) and construction type. 3. If you are a citizen, you will see your registered property tax assessments and their payment status (Paid/Unpaid). 4. Click 'Pay Now' (or use the simulated payment path) to settle your tax dues online, and download your tax receipts.",
    seeBroadcasts: "To view announcements or alerts: 1. You can see the 'Panchayat Digital Notice Board' on the Citizen Portal dashboard home page (includes high-priority announcements like Tax deadlines, Health drives, etc.). 2. Or, click on 'Panchayat Announcements' in the sidebar menu to view the full list of active notifications, timing, categories, and descriptions.",
    applySchemes: "To view and apply for government schemes: 1. Click on 'Government Schemes' (or Scheme's) in the sidebar. 2. Browse the available development and welfare schemes (such as PMAY, MGNREGA). 3. Read the description, eligibility rules, and benefits details. 4. Fill in the digital application form. 5. Click submit to generate your digital receipt.",
    viewMeetings: "To view Gram Sabha / Panchayat meetings and minutes: 1. Click on 'Meetings & Minutes' in the sidebar. 2. Here you can see scheduled assemblies, agendas, dates, and venues. 3. You can review the logged council minutes, questions raised by residents, agreed solutions, and infrastructure goals.",
    adminBudget: "For administrators to configure the annual budget: 1. Click on 'Configure Annual Budget' or 'Allocate Budget' in the admin panel shortcuts. 2. Set the total budget amount, allocate funds category-wise (Roads, Water, Sanitation, education), and submit. This will broadcast automatic email alerts to all citizens.",
    adminWorker: "For administrators to manage field workers: 1. Click on 'Field Workers' in the sidebar. 2. View active workers and their assigned cases. 3. Use the 'Register Worker' form to add new field workers (requires name, email, phone, age, and a profile photo)."
  },
  directoryStructure: {
    root: "Gram-Suvidha AI project root",
    backend: "server.js (entrypoint), clear_db.js (wipe utility), routes/ (auth, complaints, schemes, budget, meetings, taxes, chatbot), models/ (User, Complaint, Scheme, Budget, Meeting, PropertyTax), utils/ (Nodemailer sendEmail)",
    frontend: "package.json (Vite), src/main.jsx (entrypoint), src/App.jsx (lazy routing), components/ (Sidebar, Chatbot), context/ (Language, Auth), layouts/ (dashboard shells), pages/ (CitizenDashboard, AdminDashboard, SignUp)"
  },
  apiEndpoints: [
    "Auth: POST /api/auth/send-otp, POST /api/auth/register, POST /api/auth/login, GET/PUT /api/auth/profile",
    "Complaints: POST /api/complaints (submit complaint), GET /api/complaints (fetch), PUT /api/complaints/:id/status (update status)",
    "Schemes: GET /api/schemes (fetch all), POST /api/schemes/apply (apply), GET /api/schemes/applications (fetch submissions)",
    "Taxes: GET/POST /api/taxes (dues, calculate, pay, receipts)",
    "Budget: GET/POST /api/budget (annual budget items, sector allocations)",
    "Meetings: GET/POST /api/meetings (council assembly schedules, publish minutes)"
  ],
  setupInstructions: "1. Backend: cd backend, npm install, configure .env, npm start. 2. Frontend: cd frontend, npm install, npm run dev.",
  authors: [
    { name: "Shreeraksha R Deshpande", github: "@deshpande-shreeraksha" },
    { name: "Ashwini Rati", github: "@ashwini-rati" }
  ]
};

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
      project: projectContext,
      schemes: schemes.map(s => ({ title: s.title, description: s.description, eligibility: s.eligibility, benefits: s.benefits, applicationProcess: s.applicationProcess })),
      budget: budget ? { year: budget.year, allocatedAmount: budget.allocatedAmount, items: budget.items } : null,
      meetings: meetings.map(m => ({
        date: m.date,
        time: m.time,
        detailsDiscussed: m.detailsDiscussed,
        questionsRaised: m.questionsRaised,
        solutionsProvided: m.solutionsProvided,
        actionsNeeded: m.actionsNeeded,
        developmentBeforeNext: m.developmentBeforeNext
      })),
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

        const geminiResponse = await safeFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
        const mlResponse = await safeFetch('http://127.0.0.1:8000/chatbot/query', {
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
  
  const backupSchemes = [
    {
      title: "Pradhan Mantri Awas Yojana (PMAY)",
      description: "Housing for the rural poor.",
      eligibility: "Homeless families or those with zero, one, or two-room houses with kutcha walls and kutcha roof. Annual household income must be less than ₹3,00,000.",
      benefits: "Financial assistance of ₹1.20 lakh in plains and ₹1.30 lakh in hilly states. Toilet construction assistance of ₹12,000. 90/95 days of unskilled wage labor under MGNREGA.",
      applicationProcess: "Submit application with Aadhaar Card, Bank Account Details, Job Card (MGNREGA), and Swachh Bharat Mission (SBM) number on the Schemes Portal."
    },
    {
      title: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
      description: "Guarantees 100 days of wage employment.",
      eligibility: "Must be a Citizen of India and 18 years of age or older. Must reside in the rural area (Gram Panchayat). Willing to do unskilled manual work.",
      benefits: "Guaranteed 100 days of employment per year. Wages are paid directly into bank/post office. Unemployment allowance if work not provided in 15 days.",
      applicationProcess: "Submit application with Aadhaar Card or Voter ID, Bank or Post Office Account Details, and Passport size photographs on the Schemes Portal."
    },
    {
      title: "PM Kisan Samman Nidhi (PM-KISAN)",
      description: "Income support to all landholding farmer families.",
      eligibility: "All landholding farmers' families with cultivable landholding in their name (exclusions apply for government employees/taxpayers).",
      benefits: "Income support of ₹6,00,000 per year. The amount is provided in three equal installments of ₹2,000 every four months.",
      applicationProcess: "Submit application with Land Ownership Papers (Khatauni), Aadhaar Card, and Bank Account Details (Passbook)."
    },
    {
      title: "National Social Assistance Programme (NSAP)",
      description: "Pension scheme for elderly citizens.",
      eligibility: "Must belong to a Below Poverty Line (BPL) household. Age must be 60 years or higher.",
      benefits: "IGNOAPS Old age pension: ₹200/month (60-79 years), ₹500/month (80+ years). State governments typically contribute an equal or greater amount.",
      applicationProcess: "Submit application with BPL Card, Aadhaar Card, Age Proof (Voter ID, Birth Certificate), and Bank Account Details."
    },
    {
      title: "Sukanya Samriddhi Yojana (SSY)",
      description: "Savings scheme targeted at parents of girl children.",
      eligibility: "Girl child must be an Indian resident. Account must be opened before the girl child attains the age of 10 years. Only one account per girl child, and maximum two accounts per family.",
      benefits: "High interest rate (compounded annually). Tax benefits under Section 80C. Account matures 21 years from opening date.",
      applicationProcess: "Submit application with Birth Certificate of the girl child, Identity and Address Proof of the parent/guardian."
    },
    {
      title: "Jal Jeevan Mission (Har Ghar Jal)",
      description: "Safe and adequate drinking water through individual household tap connections.",
      eligibility: "Applicable to all rural households that do not have a functional tap connection.",
      benefits: "Functional household tap connection providing 55 liters per capita per day of prescribed quality. Water quality monitoring and surveillance at the community level.",
      applicationProcess: "Submit application with Aadhaar Card, Address Proof, and Village Panchayat resolution."
    },
    {
      title: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
      description: "Placement linked skill development program for rural youth.",
      eligibility: "Rural youth between 15 and 35 years (up to 45 for women, SC/ST, PWD). Must belong to a poor family (BPL card, Antyodaya card, etc.).",
      benefits: "Free skill training programs, free uniforms and materials, guaranteed placement for at least 70% of candidates, post-placement support.",
      applicationProcess: "Submit application with Aadhaar Card, Proof of age, BPL/Category certificate, and Educational qualification certificates."
    }
  ];

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

  // 1.5. GramSuvidha Project details fallback
  if (query.includes('gramsuvidha') || query.includes('gram suvidha') || query.includes('repository') || query.includes('codebase') || query.includes('tech stack') || query.includes('technology') || query.includes('author') || query.includes('developer') || query.includes('creator') || query.includes('contributor') || (query.includes('project') && (query.includes('gram') || query.includes('suvidha') || query.includes('ai') || query.includes('github') || query.includes('git')))) {
    return `Gram-Suvidha AI is an intelligent, secure, full-stack smart governance web application designed to modernize rural governance. 

Key Project Information:
- **Technologies**: React 19, Vite 6, Tailwind CSS 3, Node.js, Express, MongoDB Atlas.
- **Portals**: Citizen Portal (OTP registration, schemes, complaints tracking, tax dues) and Admin Dashboard (worker dispatcher, budgets, tax audits).
- **Developers**: Shreeraksha R Deshpande and Ashwini Rati.
- **APIs**: Auth, Complaints, Schemes, Budgets, Taxes, Meetings.
- **Structure**: \`backend/\` (Express server & Mongoose routes) and \`frontend/\` (Vite React Client).`;
  }

  // 1.8. Instructions / How-to queries
  const isHowToQuery = query.includes('how to') || query.includes('how do') || query.includes('how can') || query.includes('how i') || query.includes('steps to') || query.includes('procedure') || query.includes('process for') || query.includes('where can') || query.includes('where to') || query.includes('guide to');
  if (isHowToQuery && context.project && context.project.howToUse) {
    if (query.includes('complaint') || query.includes('report') || query.includes('grievance')) {
      return `Here are the steps to file a complaint in GramSuvidha:\n\n${context.project.howToUse.fileComplaint}`;
    }
    if (query.includes('tax') || query.includes('pay') || query.includes('property')) {
      return `Here are the steps to view and pay property taxes in GramSuvidha:\n\n${context.project.howToUse.payTaxes}`;
    }
    if (query.includes('broadcast') || query.includes('announcement') || query.includes('notice') || query.includes('alert')) {
      return `Here are the steps to view village broadcasts/announcements:\n\n${context.project.howToUse.seeBroadcasts}`;
    }
    if (query.includes('scheme') || query.includes('yojana') || query.includes('apply')) {
      return `Here are the steps to browse and apply for government welfare schemes:\n\n${context.project.howToUse.applySchemes}`;
    }
    if (query.includes('meeting') || query.includes('sabha') || query.includes('minutes')) {
      return `Here are the steps to view Gram Sabha Panchayat meetings and minutes:\n\n${context.project.howToUse.viewMeetings}`;
    }
    if (query.includes('budget') || query.includes('allocate')) {
      return `Here are the steps to configure and view budget details:\n\n${context.project.howToUse.adminBudget}`;
    }
    if (query.includes('worker') || query.includes('staff')) {
      return `Here are the steps to register and manage field workers:\n\n${context.project.howToUse.adminWorker}`;
    }
  }
  
  // 2. Schemes
  if (query.includes('scheme') || query.includes('yojana') || query.includes('benefit') || query.includes('project') || query.includes('apply')) {
    const schemes = (context.schemes && context.schemes.length > 0) ? context.schemes : backupSchemes;
    if (schemes.length > 0) {
      let res = "Here are the active Panchayat schemes:\n";
      schemes.forEach((s, idx) => {
        res += `\n${idx + 1}. **${s.title}**\n   - *Description*: ${s.description}\n   - *Eligibility*: ${s.eligibility}\n   - *Benefits*: ${s.benefits}\n   - *How to Apply*: ${s.applicationProcess || s.benefits}\n`;
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
          res += `\n${idx + 1}. **${c.title}** (${c.category})\n   - Status: *${c.status}*\n   - Location: ${c.address || 'GPS Coordinates'}\n   - Filed on: ${formatDate(c.date)}\n`;
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
        res += `\n${idx + 1}. **Meeting on ${formatDate(m.date)} at ${m.time || 'N/A'}**\n   - *Discussions*: ${m.detailsDiscussed || 'N/A'}\n   - *Questions Raised*: ${m.questionsRaised || 'N/A'}\n   - *Solutions*: ${m.solutionsProvided || 'N/A'}\n   - *Next Steps*: ${m.actionsNeeded || 'N/A'}\n`;
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
        res += `\n📢 **[${b.category}] ${b.title}**\n   - Scheduled Date: ${formatDate(b.date)}\n   - Timings: ${b.timings || 'N/A'}\n   - Details: ${b.description}\n`;
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
    const searchSchemes = (context.schemes && context.schemes.length > 0) ? context.schemes : backupSchemes;
    searchSchemes.forEach(s => {
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
        if ((m.detailsDiscussed || '').toLowerCase().includes(w)) score += 4;
        if ((m.questionsRaised || '').toLowerCase().includes(w)) score += 3;
        if ((m.solutionsProvided || '').toLowerCase().includes(w)) score += 2;
        return score;
      }, 0);
      if (matchScore > 0) {
        matchedResults.push({
          score: matchScore,
          text: `📅 Meeting on ${formatDate(m.date)}: Discussed "${m.detailsDiscussed || 'N/A'}".`
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

  // 10. Standard Help guide
  return "I apologize, I couldn't find specific details for your query. Try asking about active government schemes, annual budget allocations, meeting details, property tax records, or check the status of your complaints.";
}

module.exports = router;
