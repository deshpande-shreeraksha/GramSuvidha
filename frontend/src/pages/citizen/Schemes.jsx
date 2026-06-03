import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Lightbulb, Search, Filter, ShieldCheck, IndianRupee, FileText, CheckCircle, XCircle, Clock, Calendar, Download, Printer, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SCHEMES_DB = [
  { 
    id: 1, 
    name: 'Pradhan Mantri Awas Yojana (PMAY)', 
    desc: 'Housing for the rural poor.', 
    minAge: 18, 
    maxAge: 100, 
    maxIncome: 300000, 
    fullDetails: `**Overview**: The Pradhan Mantri Awas Yojana (Gramin) aims to provide a pucca house with basic amenities to all houseless households and those living in kutcha and dilapidated houses.
**Benefits**:
• Financial assistance of ₹1.20 lakh in plains and ₹1.30 lakh in hilly states.
• Assistance for construction of toilets (₹12,000) under Swachh Bharat Mission-Gramin (SBM-G).
• 90/95 days of unskilled wage labor under MGNREGA.
**Eligibility Criteria**:
• Homeless families or those with zero, one, or two-room houses with kutcha walls and kutcha roof.
• Annual household income must be less than ₹3,00,000.
• No family member should be a government employee.
**Documents Required**:
• Aadhaar Card
• Bank Account Details
• Job Card (MGNREGA)
• Swachh Bharat Mission (SBM) number` 
  },
  { 
    id: 2, 
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)', 
    desc: 'Guarantees 100 days of wage employment.', 
    minAge: 18, 
    maxAge: 65, 
    maxIncome: 500000, 
    fullDetails: `**Overview**: MGNREGA enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment in a financial year to every household whose adult members volunteer to do unskilled manual work.
**Benefits**:
• Guaranteed 100 days of employment per year.
• Wages are paid directly into the bank or post office accounts.
• If work is not provided within 15 days of demand, the applicant is entitled to an unemployment allowance.
**Eligibility Criteria**:
• Must be a Citizen of India and 18 years of age or older.
• Must reside in the rural area (Gram Panchayat).
• Willing to do unskilled manual work.
**Documents Required**:
• Aadhaar Card or Voter ID
• Bank or Post Office Account Details
• Passport size photographs` 
  },
  { 
    id: 3, 
    name: 'PM Kisan Samman Nidhi (PM-KISAN)', 
    desc: 'Income support to all landholding farmer families.', 
    minAge: 18, 
    maxAge: 100, 
    maxIncome: 600000, 
    fullDetails: `**Overview**: PM-KISAN is a central sector scheme to supplement the financial needs of all landholding farmers' families to procure various inputs related to agriculture and allied activities.
**Benefits**:
• Income support of ₹6,000 per year.
• The amount is provided in three equal installments of ₹2,000 every four months.
• Direct Benefit Transfer (DBT) into the bank accounts.
**Eligibility Criteria**:
• All landholding farmers' families with cultivable landholding in their name.
• Exclusions apply (e.g., institutional landholders, farmer families holding constitutional posts, serving/retired government employees, income tax payers).
**Documents Required**:
• Land Ownership Papers (Khatauni)
• Aadhaar Card
• Bank Account Details (Passbook)` 
  },
  { 
    id: 4, 
    name: 'National Social Assistance Programme (NSAP)', 
    desc: 'Pension scheme for elderly citizens.', 
    minAge: 60, 
    maxAge: 120, 
    maxIncome: 200000, 
    fullDetails: `**Overview**: A welfare program administered by the Ministry of Rural Development. It provides financial assistance to the elderly, widows, and persons with disabilities from Below Poverty Line (BPL) households.
**Benefits**:
• Indira Gandhi National Old Age Pension Scheme (IGNOAPS): ₹200/month (60-79 years), ₹500/month (80+ years).
• State governments typically contribute an equal or greater amount.
**Eligibility Criteria**:
• Must belong to a Below Poverty Line (BPL) household.
• Age must be 60 years or higher.
**Documents Required**:
• BPL Card
• Aadhaar Card
• Age Proof (Voter ID, Birth Certificate)
• Bank Account Details` 
  },
  { 
    id: 5, 
    name: 'Sukanya Samriddhi Yojana (SSY)', 
    desc: 'Savings scheme targeted at parents of girl children.', 
    minAge: 0, 
    maxAge: 10, 
    maxIncome: 1000000, 
    fullDetails: `**Overview**: Launched as a part of the 'Beti Bachao Beti Padhao' campaign, SSY is a small deposit scheme for the girl child meant to meet her education and marriage expenses.
**Benefits**:
• High interest rate (currently around 8.2% per annum, compounded annually).
• Tax benefits under Section 80C of the Income Tax Act.
• The account matures 21 years after the date of opening.
**Eligibility Criteria**:
• The girl child must be an Indian resident.
• Account must be opened before the girl child attains the age of 10 years.
• Only one account per girl child, and maximum two accounts per family.
**Documents Required**:
• Birth Certificate of the girl child
• Identity and Address Proof of the parent/guardian
• Medical certificate in case of birth of multiple girl children on a single order of birth` 
  },
  { 
    id: 6, 
    name: 'Jal Jeevan Mission (Har Ghar Jal)', 
    desc: 'Safe and adequate drinking water through individual household tap connections.', 
    minAge: 18, 
    maxAge: 100, 
    maxIncome: 10000000, 
    fullDetails: `**Overview**: The Jal Jeevan Mission aims to provide safe and adequate drinking water through individual household tap connections to all households in rural India.
**Benefits**:
• A functional household tap connection (FHTC) providing 55 liters per capita per day (lpcd) of prescribed quality.
• Water quality monitoring and surveillance at the community level.
**Eligibility Criteria**:
• Applicable to all rural households that do not have a functional tap connection.
**Documents Required**:
• Aadhaar Card
• Address Proof (Ration Card, Voter ID)
• Village Panchayat resolution (for community implementation)` 
  },
  { 
    id: 7, 
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)', 
    desc: 'Placement linked skill development program for rural youth.', 
    minAge: 15, 
    maxAge: 35, 
    maxIncome: 400000, 
    fullDetails: `**Overview**: DDU-GKY aims to transform rural poor youth into an economically independent and globally relevant workforce through skill training and placement.
**Benefits**:
• Free residential/non-residential skill training programs (3-12 months duration).
• Free uniforms, books, and study materials.
• Guaranteed placement for at least 70% of trained candidates.
• Post-placement support.
**Eligibility Criteria**:
• Rural youth between the age of 15 and 35 years (upper age limit is 45 years for women, SC/ST, and PWD candidates).
• Must belong to a poor family (BPL card, Antyodaya Anna Yojana card, RSBY card, etc.).
• Documents Required:
• Aadhaar Card
• Proof of age
• BPL/Category certificate
• Educational qualification certificates` 
  },
];

const Schemes = () => {
  const { t } = useLanguage();
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [socialCategory, setSocialCategory] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  // Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [documents, setDocuments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [relationship, setRelationship] = useState('Self');
  const [myApplications, setMyApplications] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const printRef = useRef();

  const fetchProfileAndApps = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setProfileLoading(true);
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyApplications(data.applications || []);
        if (data.user && data.user.age) {
          setAge(data.user.age.toString());
        }
        if (data.user && data.user.name) {
          setApplicantName(data.user.name);
        }
      }
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndApps();
  }, []);

  const requiredDocs = useMemo(() => {
    if (!selectedScheme) return [];
    const parts = selectedScheme.fullDetails.split('**Documents Required**:');
    if (parts.length < 2) return [];
    const docSection = parts[1];
    return docSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('•'))
      .map(line => line.replace('•', '').trim());
  }, [selectedScheme]);

  const filteredSchemes = useMemo(() => {
    if (!hasSearched) return SCHEMES_DB;
    
    const userAge = parseInt(age, 10);
    const userIncome = parseInt(income, 10);

    if (isNaN(userAge) || isNaN(userIncome)) return SCHEMES_DB;

    return SCHEMES_DB.filter(
      (scheme) =>
        userAge >= scheme.minAge &&
        userAge <= scheme.maxAge &&
        userIncome <= scheme.maxIncome
    );
  }, [age, income, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleResetFilters = () => {
    setAge('');
    setIncome('');
    setSocialCategory('');
    setOccupation('');
    setHasSearched(false);
    // Reload user profile age if possible
    fetchProfileAndApps();
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applicantName) return;

    for (const doc of requiredDocs) {
      if (!documents[doc]) {
        alert(`${t('Please upload')}: ${t(doc)}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('schemeName', selectedScheme.name);
    formData.append('applicantName', applicantName);
    formData.append('idNumber', idNumber);
    formData.append('age', age);
    formData.append('socialCategory', socialCategory || 'General');
    formData.append('occupation', occupation || 'Unemployed');
    formData.append('relationship', relationship);
    formData.append('documentNames', JSON.stringify(requiredDocs));

    requiredDocs.forEach(doc => {
      formData.append('documents', documents[doc]);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schemes/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Refresh Applications List
        await fetchProfileAndApps();
        setTimeout(() => {
          setSelectedScheme(null);
          setSubmitSuccess(false);
          setIdNumber('');
          setDocuments({});
        }, 2500);
      } else {
        const errData = await response.json();
        alert(t("Failed to submit application: ") + errData.message);
      }
    } catch (error) {
      console.error(error);
      alert(t("Error submitting application. Is the backend running?"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif;">
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state cleanly
  };

  return (
    <div className="w-full space-y-8 text-[#C4F8FF]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <Lightbulb className="text-[#C4F8FF] animate-pulse" size={32} />
            {t("Panchayat Scheme's Portal")}
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm max-w-xl">
            {t('Explore, filter and apply for state and national government welfare schemes directly with instant digital acknowledgment.')}
          </p>
        </div>
      </div>
          {/* Eligibility Filter Panel */}
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h2 className="text-sm font-bold text-[#C4F8FF] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter size={16} className="text-[#C4F8FF]" />
              {t('Eligibility Checker & Filter')}
            </h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1.5">
                  {t('Age (Years)')}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  required
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-medium" 
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => {setAge(e.target.value); setHasSearched(false);}}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <IndianRupee size={12} />
                  {t('Annual Income (₹)')}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  required
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-medium" 
                  placeholder="e.g. 250000"
                  value={income}
                  onChange={(e) => {setIncome(e.target.value); setHasSearched(false);}}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1.5">
                  {t('Social Category')}
                </label>
                <select 
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-medium" 
                  value={socialCategory}
                  onChange={(e) => {setSocialCategory(e.target.value); setHasSearched(false);}}
                >
                  <option value="" className="bg-[#061926]">{t('All Categories')}</option>
                  <option value="General" className="bg-[#061926]">{t('General')}</option>
                  <option value="OBC" className="bg-[#061926]">{t('OBC')}</option>
                  <option value="SC" className="bg-[#061926]">{t('SC')}</option>
                  <option value="ST" className="bg-[#061926]">{t('ST')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1.5">
                  {t('Occupation')}
                </label>
                <select 
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-medium" 
                  value={occupation}
                  onChange={(e) => {setOccupation(e.target.value); setHasSearched(false);}}
                >
                  <option value="" className="bg-[#061926]">{t('All Occupations')}</option>
                  <option value="Farmer" className="bg-[#061926]">{t('Farmer')}</option>
                  <option value="Student" className="bg-[#061926]">{t('Student')}</option>
                  <option value="Labour" className="bg-[#061926]">{t('Labour')}</option>
                  <option value="Unemployed" className="bg-[#061926]">{t('Unemployed')}</option>
                  <option value="Self-Employed" className="bg-[#061926]">{t('Self-Employed')}</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex gap-3 mt-2">
                <button type="submit" className="flex-1 py-3 bg-[#0F4B70]/80 text-white rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  <Search size={18} />
                  {t('Check Eligible Schemes')}
                </button>
                {hasSearched && (
                  <button 
                    type="button" 
                    onClick={handleResetFilters}
                    className="px-6 py-3 border border-[#C4F8FF]/15 text-[#C4F8FF]/80 rounded-xl font-semibold hover:bg-[#0F4B70]/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={16} /> {t('Reset')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Schemes Display list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#C4F8FF]/15 pb-3">
              <h2 className="text-lg font-bold text-[#C4F8FF] flex items-center gap-2">
                <Filter size={18} className="text-[#C4F8FF]/60" />
                {hasSearched ? `${t('Recommended Schemes')} (${filteredSchemes.length})` : `${t('All Available Schemes')} (${SCHEMES_DB.length})`}
              </h2>
              {hasSearched && (
                <span className="text-xs bg-[#0F4B70]/80/10 text-[#C4F8FF] px-3 py-1 rounded-full font-bold">
                  {t('Filtered by Demographics')}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSchemes.map((scheme) => (
                <div 
                  key={scheme.id} 
                  onClick={() => {setSelectedScheme(scheme); setSubmitSuccess(false);}}
                  className="bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-2xl p-6 hover:shadow-lg hover:border-[#C4F8FF]/30 transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between"
                >
                  <div className="absolute -top-6 -right-6 p-8 text-[#C4F8FF]/5 group-hover:text-[#C4F8FF]/10 group-hover:scale-110 transition-all duration-300">
                    <ShieldCheck size={80} />
                  </div>
                  
                  <div>
                    <h3 className="font-extrabold text-lg text-[#C4F8FF] mb-2.5 group-hover:text-[#C4F8FF] transition-colors pr-8">
                      {t(scheme.name)}
                    </h3>
                    <p className="text-[#C4F8FF]/70 text-sm leading-relaxed mb-6">
                      {t(scheme.desc)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#C4F8FF]/20">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#C4F8FF] bg-[#0F4B70]/80/5 px-3 py-1.5 rounded-lg">
                      <ShieldCheck size={14} /> {t('Eligible')}
                    </div>
                    <span className="text-xs font-bold text-[#C4F8FF] group-hover:underline flex items-center gap-1">
                      {t('View details & apply')} &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Applications Tracker Section */}
        <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-[#C4F8FF]/20 bg-[#0F4B70]/20">
            <h2 className="font-bold text-[#C4F8FF] text-base">{t('Your Scheme Application Submissions')}</h2>
            <p className="text-xs text-[#C4F8FF]/60 mt-1">{t('Official tracking timeline and proof-of-submission receipts for Panchayat audits.')}</p>
          </div>

          {profileLoading ? (
            <div className="p-12 text-center text-[#C4F8FF]/60 font-medium">
              <Clock className="animate-spin text-[#C4F8FF] mx-auto mb-3" size={28} />
              {t('Retrieving applications...')}
            </div>
          ) : myApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="text-[#C4F8FF]/70 mx-auto mb-4" size={48} />
              <p className="text-[#C4F8FF]/80 font-semibold text-sm">{t('No scheme applications logged yet.')}</p>
              <p className="text-[#C4F8FF]/60 text-xs mt-1">{t('Go to "Available Schemes" to browse eligibility and apply online.')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/10">
              {myApplications.map((app) => (
                <div key={app._id} className="p-6 hover:bg-[#0F4B70]/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black font-mono bg-[#0F4B70]/40 text-[#C4F8FF]/80 px-2.5 py-1 rounded-md border border-[#C4F8FF]/15">
                        {app.applicationId || 'SCH-N/A'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        app.status === 'Approved' ? 'bg-[#C4F8FF]/10 text-green-400 border border-green-400/30' :
                        app.status === 'Rejected' ? 'bg-[#C4F8FF]/10 text-red-400 border border-red-400/30' :
                        'bg-[#C4F8FF]/10 text-[#C4F8FF] border border-orange-400/30'
                      }`}>
                        {app.status === 'Application Submitted' ? t('Submitted') : t(app.status)}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#C4F8FF]">{t(app.schemeName)}</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs text-[#C4F8FF]/70 pt-1">
                      <div>
                        <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">{t('Applicant')}</span>
                        <span className="font-bold text-[#C4F8FF]">{app.applicantName}</span>
                      </div>
                      <div>
                        <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">{t('Relationship')}</span>
                        <span className="font-bold text-[#C4F8FF] capitalize">{t(app.relationship)}</span>
                      </div>
                      <div>
                        <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">{t('Submitted On')}</span>
                        <span className="font-bold text-[#C4F8FF]">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : t('N/A')}
                        </span>
                      </div>
                      {app.availableFrom && (
                        <div>
                          <span className="text-green-400 block text-[9px] font-bold uppercase">{t('Benefits Start')}</span>
                          <span className="font-black text-green-400">
                            {new Date(app.availableFrom).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setSelectedReceipt(app)}
                      className="px-4 py-2 border border-primary/20 bg-[#0F4B70]/80/5 hover:bg-[#C4F8FF]/10/10 text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Printer size={14} /> {t('Print Receipt')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Scheme Application Form Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#061926]/95 backdrop-blur-md border border-[#C4F8FF]/20 rounded-2xl shadow-xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedScheme(null)} 
              className="absolute top-4 right-4 text-[#C4F8FF]/60 hover:text-[#C4F8FF]/80 text-2xl font-bold focus:outline-none"
            >
              &times;
            </button>
            
            {!submitSuccess ? (
              <>
                <h2 className="text-2xl font-extrabold text-[#C4F8FF] mb-1 pr-6">{t(selectedScheme.name)}</h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C4F8FF] bg-[#0F4B70]/80/5 w-fit px-3 py-1 rounded-lg mb-6">
                   <ShieldCheck size={14} /> {t('Instant Online Apply Eligible')}
                </div>
                
                <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-5 rounded-2xl mb-6">
                  <h4 className="font-bold text-[#C4F8FF] mb-2.5 text-sm">{t('Scheme Guideline & Documents')}</h4>
                  <div className="text-[#C4F8FF]/80 text-xs leading-relaxed space-y-2">
                    {(() => {
                      const lines = selectedScheme.fullDetails.split('\n');
                      const rendered = [];
                      let currentList = [];

                      const flushList = (key) => {
                        if (currentList.length > 0) {
                          rendered.push(
                            <ul key={`list-${key}`} className="list-disc pl-5 mb-2 space-y-1 text-[#C4F8FF]/80">
                              {currentList.map((item, i) => (
                                <li key={i}>{t(item)}</li>
                              ))}
                            </ul>
                          );
                          currentList = [];
                        }
                      };

                      lines.forEach((line, idx) => {
                        if (line.startsWith('•')) {
                          currentList.push(line.replace('•', '').trim());
                        } else {
                          flushList(idx);
                          const trimmed = line.trim();
                          if (trimmed === '') return;

                          if (trimmed.startsWith('**Overview**:')) {
                            rendered.push(<p key={idx} className="mb-2"><strong className="text-[#C4F8FF]">{t('Overview')}:</strong> {t(trimmed.replace('**Overview**:', '').trim())}</p>);
                          } else if (trimmed.startsWith('**Benefits**:')) {
                            rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 text-sm border-t border-[#C4F8FF]/15 mb-2">{t('Benefits:')}</p>);
                          } else if (trimmed.startsWith('**Eligibility Criteria**:')) {
                            rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 text-sm border-t border-[#C4F8FF]/15 mb-2">{t('Eligibility Criteria:')}</p>);
                          } else if (trimmed.startsWith('**Documents Required**:')) {
                            rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 text-sm border-t border-[#C4F8FF]/15 mb-2">{t('Documents Required:')}</p>);
                          } else {
                            rendered.push(<p key={idx} className="mb-2">{t(trimmed)}</p>);
                          }
                        }
                      });

                      flushList('end');
                      return rendered;
                    })()}
                  </div>
                </div>

                <div className="border-t border-[#C4F8FF]/20 pt-5">
                  <h3 className="font-bold text-base text-[#C4F8FF] mb-4">{t('Applicant Particulars Form')}</h3>
                  
                  {(() => {
                    const isAlreadyRegistered = selectedScheme && myApplications.some(app => 
                      app.schemeName === selectedScheme.name && 
                      (app.relationship || 'Self') === relationship
                    );

                    return (
                      <form onSubmit={handleApply} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Applying For')}</label>
                            <select 
                              required
                              className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-semibold"
                              value={relationship}
                              onChange={e => setRelationship(e.target.value)}
                            >
                              <option value="Self" className="bg-[#061926]">{t('Self (Default)')}</option>
                              <option value="Father" className="bg-[#061926]">{t('Father')}</option>
                              <option value="Mother" className="bg-[#061926]">{t('Mother')}</option>
                              <option value="Spouse" className="bg-[#061926]">{t('Spouse')}</option>
                              <option value="Sibling" className="bg-[#061926]">{t('Sibling')}</option>
                              <option value="Daughter" className="bg-[#061926]">{t('Daughter')}</option>
                              <option value="Son" className="bg-[#061926]">{t('Son')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Applicant Full Name')}</label>
                            <input 
                              type="text" 
                              required
                              className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-semibold"
                              placeholder={t('Enter full name')}
                              value={applicantName}
                              onChange={e => setApplicantName(e.target.value)}
                            />
                          </div>
                        </div>

                        {isAlreadyRegistered && (
                          <div className="bg-[#C4F8FF]/10 border border-orange-400/30 text-orange-400 p-3.5 rounded-xl flex items-start gap-2.5">
                            <ShieldCheck className="text-[#C4F8FF] flex-shrink-0 mt-0.5" size={16} />
                            <span className="text-xs font-semibold leading-relaxed">
                              {t('You have an active registration for this scheme for beneficiary relationship')} "{t(relationship)}". {t('Duplicate submissions are locked.')}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Age')}</label>
                            <input 
                              type="number" 
                              disabled
                              className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm bg-[#0F4B70]/30 text-[#C4F8FF]/60 font-bold"
                              value={age}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Government ID (Aadhaar / PAN)')}</label>
                            <input 
                              type="text" 
                              required
                              className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-semibold uppercase tracking-wider"
                              placeholder={t('e.g. 1234 5678 9012')}
                              value={idNumber}
                              onChange={e => setIdNumber(e.target.value.toUpperCase())}
                            />
                          </div>
                        </div>
                        
                        {requiredDocs.map((doc, idx) => (
                          <div key={idx} className="border border-[#C4F8FF]/15 p-3 rounded-xl bg-[#0F4B70]/20">
                            <label className="block text-[11px] font-bold text-[#C4F8FF]/80 uppercase mb-1.5">{t('Upload')} {t(doc)} {t('Proof')}</label>
                            <input 
                              type="file" 
                              name="documents"
                              required
                              accept="image/*,.pdf"
                              className="w-full text-xs text-[#C4F8FF]/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0F4B70]/80/10 file:text-[#C4F8FF] hover:file:bg-[#C4F8FF]/10 transition-all cursor-pointer"
                              onChange={e => setDocuments({ ...documents, [doc]: e.target.files[0] })}
                            />
                          </div>
                        ))}
                        
                        <button 
                          type="submit" 
                          disabled={isSubmitting || isAlreadyRegistered} 
                          className="w-full mt-4 py-3 bg-[#0F4B70]/80 hover:bg-[#C4F8FF]/10 text-white rounded-xl font-bold shadow-md shadow-primary/15 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? t('Submitting Application Documents...') : t('Submit Official Application')}
                        </button>
                      </form>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-[#C4F8FF]/10 border border-green-400/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-[#C4F8FF] mb-2">{t('Application Logged!')}</h3>
                <p className="text-[#C4F8FF]/70 text-sm max-w-sm mx-auto leading-relaxed">
                  {t('Your application is successfully stored with ID tracking code. Receipt generated in applications tab.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto border border-slate-200 text-slate-800 animate-fade-in">
            <button 
              onClick={() => setSelectedReceipt(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold focus:outline-none"
            >
              &times;
            </button>

            {/* Printable Frame */}
            <div ref={printRef} className="border-2 border-slate-350 rounded-xl p-6 bg-white relative">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] select-none pointer-events-none">
                <ShieldCheck size={280} className="text-slate-500 rotate-12" />
              </div>

              <div className="text-center border-b border-slate-200 pb-4 mb-4">
                <h2 className="text-lg font-black text-slate-900 tracking-wider">GRAM PANCHAYAT SEVA</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Government of India / local governance node</p>
                <div className="w-8 h-1 bg-slate-500 mx-auto mt-2 rounded"></div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span>Receipt Date: {new Date().toLocaleDateString('en-IN')}</span>
                <span className="font-mono font-bold text-slate-700">Ref: {selectedReceipt.applicationId}</span>
              </div>

              <h3 className="text-center text-sm font-bold text-slate-900 mb-4 bg-slate-100 border border-slate-200 py-1.5 rounded uppercase tracking-wider">
                Proof of Scheme Submission
              </h3>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-medium text-slate-500">Scheme Requested</span>
                  <span className="font-extrabold text-slate-900 text-right max-w-[240px]">{t(selectedReceipt.schemeName)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-medium text-slate-500">Beneficiary Name</span>
                  <span className="font-extrabold text-slate-900">{selectedReceipt.applicantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-medium text-slate-500">Relationship Type</span>
                  <span className="font-extrabold text-slate-900 capitalize">{t(selectedReceipt.relationship)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-medium text-slate-500">ID Verification Lock</span>
                  <span className="font-mono font-bold text-slate-900">
                    XXXX-XXXX-{selectedReceipt.idNumber ? selectedReceipt.idNumber.slice(-4) : 'XXXX'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-medium text-slate-500">Date Logged</span>
                  <span className="font-bold text-slate-900">
                    {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString('en-IN') : 'Just now'}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="font-medium text-slate-500">Status</span>
                  <span className="font-black text-slate-900 capitalize">{selectedReceipt.status === 'Application Submitted' ? 'Pending Audit' : t(selectedReceipt.status)}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-slate-300 flex justify-between items-end text-[9px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-600">Security Hash Identifier</p>
                  <p className="font-mono select-all">GS-APP-${selectedReceipt._id ? selectedReceipt._id.slice(-8) : 'HASH'}</p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-px bg-slate-400 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-800">Authorized Signatory</p>
                  <p>Gram Panchayat Officer</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
