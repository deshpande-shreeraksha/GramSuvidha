const bcrypt = require('bcryptjs');
const { Admin } = require('../models/User');
const Scheme = require('../models/Scheme');
const Budget = require('../models/Budget');
const Meeting = require('../models/Meeting');
const Broadcast = require('../models/Broadcast');

const seedData = async () => {
  try {
    console.log('Running database auto-seeding routines...');

    // 1. Seed Default Admin
    let admin = await Admin.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Seeding default Admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin = await Admin.create({
        name: 'System Admin',
        email: 'admin@panchayat.gov.in',
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin',
        age: 40,
        gender: 'Male',
        village: 'Mumbai North',
        isActive: true,
        language: 'en'
      });
      console.log('Successfully seeded default Admin user.');
    } else {
      console.log('Admin user already exists.');
    }

    const adminId = admin._id;

    // 2. Seed Default Schemes
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      console.log('Seeding initial government schemes...');
      const defaultSchemes = [
        {
          title: 'Pradhan Mantri Awas Yojana (PMAY)',
          description: 'Housing for the rural poor.',
          eligibility: 'Homeless families or those with zero, one, or two-room houses with kutcha walls and kutcha roof. Annual household income must be less than ₹3,00,000. No family member should be a government employee.',
          benefits: 'Financial assistance of ₹1.20 lakh in plains and ₹1.30 lakh in hilly states. Assistance for construction of toilets (₹12,000) under Swachh Bharat Mission-Gramin (SBM-G). 90/95 days of unskilled wage labor under MGNREGA.',
          applicationProcess: 'Submit application with Aadhaar Card, Bank Account Details, Job Card (MGNREGA), and Swachh Bharat Mission (SBM) number on the Schemes Portal.',
          status: 'Active'
        },
        {
          title: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
          description: 'Guarantees 100 days of wage employment.',
          eligibility: 'Must be a Citizen of India and 18 years of age or older. Must reside in the rural area (Gram Panchayat). Willing to do unskilled manual work.',
          benefits: 'Guaranteed 100 days of employment per year. Wages are paid directly into the bank or post office accounts. If work is not provided within 15 days of demand, the applicant is entitled to an unemployment allowance.',
          applicationProcess: 'Submit application with Aadhaar Card or Voter ID, Bank or Post Office Account Details, and Passport size photographs on the Schemes Portal.',
          status: 'Active'
        },
        {
          title: 'PM Kisan Samman Nidhi (PM-KISAN)',
          description: 'Income support to all landholding farmer families.',
          eligibility: 'All landholding farmers\' families with cultivable landholding in their name (exclusions apply for government employees/taxpayers).',
          benefits: 'Income support of ₹6,00,000 per year. The amount is provided in three equal installments of ₹2,000 every four months. Direct Benefit Transfer (DBT) into the bank accounts.',
          applicationProcess: 'Submit application with Land Ownership Papers (Khatauni), Aadhaar Card, and Bank Account Details (Passbook).',
          status: 'Active'
        },
        {
          title: 'National Social Assistance Programme (NSAP)',
          description: 'Pension scheme for elderly citizens.',
          eligibility: 'Must belong to a Below Poverty Line (BPL) household. Age must be 60 years or higher.',
          benefits: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS): ₹200/month (60-79 years), ₹500/month (80+ years). State governments typically contribute an equal or greater amount.',
          applicationProcess: 'Submit application with BPL Card, Aadhaar Card, Age Proof (Voter ID, Birth Certificate), and Bank Account Details.',
          status: 'Active'
        },
        {
          title: 'Sukanya Samriddhi Yojana (SSY)',
          description: 'Savings scheme targeted at parents of girl children.',
          eligibility: 'The girl child must be an Indian resident. Account must be opened before the girl child attains the age of 10 years. Only one account per girl child, and maximum two accounts per family.',
          benefits: 'High interest rate (compounded annually). Tax benefits under Section 80C of the Income Tax Act. The account matures 21 years after the date of opening.',
          applicationProcess: 'Submit application with Birth Certificate of the girl child, Identity and Address Proof of the parent/guardian.',
          status: 'Active'
        },
        {
          title: 'Jal Jeevan Mission (Har Ghar Jal)',
          description: 'Safe and adequate drinking water through individual household tap connections.',
          eligibility: 'Applicable to all rural households that do not have a functional tap connection.',
          benefits: 'A functional household tap connection (FHTC) providing 55 liters per capita per day (lpcd) of prescribed quality. Water quality monitoring and surveillance at the community level.',
          applicationProcess: 'Submit application with Aadhaar Card, Address Proof (Ration Card, Voter ID), and Village Panchayat resolution.',
          status: 'Active'
        },
        {
          title: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
          description: 'Placement linked skill development program for rural youth.',
          eligibility: 'Rural youth between the age of 15 and 35 years (upper age limit is 45 years for women, SC/ST, and PWD candidates). Must belong to a poor family (BPL card, Antyodaya Anna Yojana card, RSBY card, etc.).',
          benefits: 'Free residential/non-residential skill training programs (3-12 months duration). Free uniforms, books, and study materials. Guaranteed placement for at least 70% of trained candidates. Post-placement support.',
          applicationProcess: 'Submit application with Aadhaar Card, Proof of age, BPL/Category certificate, and Educational qualification certificates.',
          status: 'Active'
        }
      ];
      await Scheme.insertMany(defaultSchemes);
      console.log('Successfully seeded default Schemes.');
    } else {
      console.log('Schemes already seeded.');
    }

    // 3. Seed Default Budget
    const budgetCount = await Budget.countDocuments();
    if (budgetCount === 0) {
      console.log('Seeding initial annual budget...');
      const defaultBudget = {
        allocatedAmount: 150000000,
        description: 'Annual Panchayat Development Budget for village connectivity, healthcare, and primary infrastructure improvements.',
        year: '2026-2027',
        items: [
          { category: 'Road Development', allocatedAmount: 100000000, description: 'Laying asphalt and repairing major link roads' },
          { category: 'Infrastructure (Schools, etc.)', allocatedAmount: 20000000, description: 'Constructing library blocks and digital classrooms' },
          { category: 'Water Supply & Sanitation', allocatedAmount: 15000000, description: 'Sinking borewells and pipeline distribution' },
          { category: 'Healthcare Services', allocatedAmount: 10000000, description: 'Stocking generic health centers and organizing camps' },
          { category: 'Solar Street Lights', allocatedAmount: 5000000, description: 'Fitting solar cells and street LEDs' }
        ],
        allocatedBy: adminId
      };
      await Budget.create(defaultBudget);
      console.log('Successfully seeded default Budget.');
    } else {
      console.log('Budget already seeded.');
    }

    // 4. Seed Default Meetings
    const meetingCount = await Meeting.countDocuments();
    if (meetingCount === 0) {
      console.log('Seeding initial Panchayat meetings...');
      const defaultMeetings = [
        {
          date: new Date('2026-05-15'),
          time: '10:00 AM',
          detailsDiscussed: 'Discussion on water pipeline extension, garbage segregation in Ward 4, and finalizing school library block construction plans.',
          questionsRaised: '1. Water shortage in morning hours. 2. Overflowing public trash bins near school. 3. Insufficient library hours.',
          solutionsProvided: '1. Morning water timings extended by 1 hour. 2. Placed new segregation bins and scheduled twice-daily collections. 3. Panchayat library hours extended.',
          actionsNeeded: '1. Deploy technicians to water valves. 2. Instruct municipal workers to empty bins daily. 3. Appoint part-time librarian helper.',
          developmentBeforeNext: 'Complete layout design for library expansion and install 5 new trash container units.',
          sentToCitizens: true,
          addedBy: adminId
        },
        {
          date: new Date('2026-04-10'),
          time: '02:30 PM',
          detailsDiscussed: 'Annual tax assessment verification process, scheduling election safety drills, and review of road construction progress.',
          questionsRaised: '1. Discrepancies in built-up area calculations for property tax. 2. Speeding vehicles near main bazaar intersection.',
          solutionsProvided: '1. Set up a free verification camp with surveyor next Monday. 2. Install rubber speed breakers near the bazaar intersection.',
          actionsNeeded: '1. Issue notices for tax verification camps. 2. Procure and install speed bumps.',
          developmentBeforeNext: 'Finished laying 2km asphalt on East Connecting road. Standardized tax built-up definitions.',
          sentToCitizens: true,
          addedBy: adminId
        }
      ];
      await Meeting.insertMany(defaultMeetings);
      console.log('Successfully seeded default Meetings.');
    } else {
      console.log('Meetings already seeded.');
    }

    // 5. Seed Default Broadcasts
    const broadcastCount = await Broadcast.countDocuments();
    if (broadcastCount === 0) {
      console.log('Seeding initial broadcasts / alerts...');
      const defaultBroadcasts = [
        {
          category: 'Road Construction',
          title: 'Connecting Road Construction Work',
          description: 'Re-laying of connecting roads is scheduled to start next week. Please use alternate routes to avoid construction dust and delays.',
          date: new Date('2026-06-10'),
          timings: '08:00 AM to 06:00 PM',
          createdBy: adminId
        },
        {
          category: 'Water Cutoff',
          title: 'Water Pipe Maintenance in Ward 3',
          description: 'Water supply will be temporarily suspended in Ward 3 due to main pump replacement. Please store adequate water beforehand.',
          date: new Date('2026-06-05'),
          timings: '09:00 AM to 01:00 PM',
          createdBy: adminId
        }
      ];
      await Broadcast.insertMany(defaultBroadcasts);
      console.log('Successfully seeded default Broadcasts.');
    } else {
      console.log('Broadcasts already seeded.');
    }

    console.log('Database auto-seeding routines complete.');
  } catch (error) {
    console.error('Error during database auto-seeding:', error);
  }
};

module.exports = seedData;
