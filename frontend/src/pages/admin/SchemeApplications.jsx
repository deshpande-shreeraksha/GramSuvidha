import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, ExternalLink, Briefcase, Eye, ShieldCheck } from 'lucide-react';

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
**Documents Required**:
• Aadhaar Card
• Bank Account Details
• Job Card (MGNREGA)` 
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
• Wages are paid directly into the bank accounts.
**Eligibility Criteria**:
• Must be a Citizen of India and 18 years of age or older.` 
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
• Income support of ₹6,000 per year.` 
  },
  { 
    id: 4, 
    name: 'National Social Assistance Programme (NSAP)', 
    desc: 'Pension scheme for elderly citizens.', 
    minAge: 60, 
    maxAge: 120, 
    maxIncome: 200000, 
    fullDetails: `**Overview**: Welfare program providing financial assistance to the elderly, widows, and persons with disabilities from BPL households.` 
  },
  { 
    id: 5, 
    name: 'Sukanya Samriddhi Yojana (SSY)', 
    desc: 'Savings scheme targeted at parents of girl children.', 
    minAge: 0, 
    maxAge: 10, 
    maxIncome: 1000000, 
    fullDetails: `**Overview**: Savings scheme for the girl child meant to meet her education and marriage expenses.` 
  },
  { 
    id: 6, 
    name: 'Jal Jeevan Mission (Har Ghar Jal)', 
    desc: 'Safe and adequate drinking water through individual household tap connections.', 
    minAge: 18, 
    maxAge: 100, 
    maxIncome: 10000000, 
    fullDetails: `**Overview**: The Jal Jeevan Mission aims to provide safe and adequate drinking water through tap connections.` 
  },
  { 
    id: 7, 
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)', 
    desc: 'Placement linked skill development program for rural youth.', 
    minAge: 15, 
    maxAge: 35, 
    maxIncome: 400000, 
    fullDetails: `**Overview**: DDU-GKY aims to transform rural youth into an economically independent workforce.` 
  },
];

const SchemeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schemes/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch applications.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schemes/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchApplications();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <Briefcase className="text-[#C4F8FF] animate-pulse" size={32} />
            Admin Scheme's Portal
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm">
            Manage scheme catalog listings and review submitted applications from citizens.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#C4F8FF]/10 text-red-400 p-4 rounded-xl text-sm font-semibold border border-red-100">
          {error}
        </div>
      )}

      {/* Available Schemes Catalog */}
      <div className="space-y-4">
        <h2 className="font-bold text-[#C4F8FF] text-lg flex items-center gap-2">
          <Briefcase size={20} className="text-[#C4F8FF]" /> Available Schemes Catalog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCHEMES_DB.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <h3 className="font-extrabold text-base text-[#C4F8FF] mb-2">{scheme.name}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed mb-4">{scheme.desc}</p>
                
                <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-3.5 rounded-xl space-y-1.5 text-[11px] text-[#C4F8FF]/80 mb-4">
                  <div>
                    <strong className="text-[#C4F8FF]">Eligible Age Range: </strong> 
                    {scheme.minAge} - {scheme.maxAge} years
                  </div>
                  <div>
                    <strong className="text-[#C4F8FF]">Income Cap Limit: </strong> 
                    ₹{scheme.maxIncome.toLocaleString('en-IN')} / year
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedScheme(scheme)}
                className="w-full py-2 bg-[#0F4B70]/30 border border-[#C4F8FF]/15 hover:bg-[#0F4B70]/40 text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Eye size={14} /> View Scheme Setup
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Applications Registry */}
      <div className="space-y-4 pt-6 border-t border-slate-150">
        <h2 className="font-bold text-[#C4F8FF] text-lg flex items-center gap-2">
          <FileText size={20} className="text-[#C4F8FF]" /> Submitted Applications Registry
          {applications.filter(a => a.status === 'Application Submitted').length > 0 && (
            <span className="bg-[#C4F8FF]/100 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black ml-2">
              {applications.filter(a => a.status === 'Application Submitted').length} Pending
            </span>
          )}
        </h2>
        {loading ? (
          <div className="p-12 text-center text-[#C4F8FF]/70">Loading scheme applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15">
            <FileText className="text-slate-350 mx-auto mb-3" size={36} />
            <p className="text-[#C4F8FF]/70 font-medium">No scheme applications have been submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map(app => (
              <div key={app._id} className="bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C4F8FF]/20 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[#C4F8FF]">{app.schemeName}</h3>
                      <span className="text-[10px] font-mono bg-[#0F4B70]/40 text-[#C4F8FF]/70 border border-[#C4F8FF]/15 px-2 py-0.5 rounded-md mt-1 inline-block">
                        ID: {app.applicationId || 'SCH-N/A'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${app.status === 'Approved' ? 'bg-[#C4F8FF]/10 text-green-400 border border-green-400/30' : 
                        app.status === 'Rejected' ? 'bg-[#C4F8FF]/10 text-red-400 border border-red-400/30' : 
                        'bg-[#C4F8FF]/10 text-[#C4F8FF] border border-orange-400/30'}`}
                    >
                      {app.status === 'Application Submitted' ? 'Pending Action' : app.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Applicant Name</span>
                      <span className="font-bold text-[#C4F8FF]">{app.applicantName}</span>
                    </div>
                    <div>
                      <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Relationship</span>
                      <span className="font-bold text-[#C4F8FF] capitalize">{app.relationship}</span>
                    </div>
                    <div>
                      <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Income Declared</span>
                      <span className="font-bold text-[#C4F8FF]">₹{app.incomeDeclared ? app.incomeDeclared.toLocaleString('en-IN') : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">Submitted On</span>
                      <span className="font-bold text-[#C4F8FF]">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#0F4B70]/30 p-3 rounded-xl border border-[#C4F8FF]/20 flex flex-wrap gap-4 items-center text-xs">
                    <div>
                      <span className="text-[#C4F8FF]/60 font-medium mr-1.5">ID Document:</span>
                      <span className="font-semibold text-[#C4F8FF]">{app.idNumber}</span>
                    </div>
                    {app.documentUrl && (
                      <div>
                        <span className="text-[#C4F8FF]/60 font-medium mr-1.5">Uploaded File:</span>
                        <a href={app.documentUrl} target="_blank" rel="noreferrer" className="text-[#C4F8FF] hover:underline font-bold">View Document</a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap xl:flex-col gap-2.5 w-full xl:w-auto self-stretch justify-end border-t xl:border-t-0 xl:border-l border-[#C4F8FF]/20 pt-4 xl:pt-0 xl:pl-6">
                  {app.status === 'Application Submitted' ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(app._id, 'Approved')}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 shadow-md shadow-green-600/20 transition-colors"
                      >
                        <CheckCircle size={14} /> Approve App
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-650 text-white font-bold text-xs rounded-xl hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors"
                      >
                        <XCircle size={14} /> Reject App
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(app._id, 'Application Submitted')}
                      className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F4B70]/30 text-[#C4F8FF] border border-[#C4F8FF]/15 font-bold text-xs rounded-xl hover:bg-[#0F4B70]/40 transition-colors"
                    >
                      <Clock size={14} /> Set Back to Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheme Detail Setup modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedScheme(null)} 
              className="absolute top-4 right-4 text-[#C4F8FF]/60 hover:text-[#C4F8FF]/80 text-2xl font-bold focus:outline-none"
            >
              &times;
            </button>
            
            <h2 className="text-xl font-extrabold text-[#C4F8FF] mb-4">{selectedScheme.name}</h2>
            
            <div className="bg-[#0F4B70]/30 border border-slate-250 p-4 rounded-xl space-y-3 text-xs leading-relaxed text-[#C4F8FF]/85">
              {(() => {
                const lines = selectedScheme.fullDetails.split('\n');
                const rendered = [];
                let currentList = [];

                const flushList = (key) => {
                  if (currentList.length > 0) {
                    rendered.push(
                      <ul key={`list-${key}`} className="list-disc pl-5 mb-2 space-y-1 text-[#C4F8FF]/80">
                        {currentList.map((item, i) => (
                          <li key={i}>{item}</li>
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
                      rendered.push(<p key={idx} className="mb-2"><strong className="text-[#C4F8FF]">Overview:</strong> {trimmed.replace('**Overview**:', '').trim()}</p>);
                    } else if (trimmed.startsWith('**Benefits**:')) {
                      rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 border-t mb-2">Benefits:</p>);
                    } else if (trimmed.startsWith('**Eligibility Criteria**:')) {
                      rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 border-t mb-2">Eligibility Criteria:</p>);
                    } else if (trimmed.startsWith('**Documents Required**:')) {
                      rendered.push(<p key={idx} className="font-bold text-[#C4F8FF] pt-2 border-t mb-2">Documents Required:</p>);
                    } else {
                      rendered.push(<p key={idx} className="mb-2">{trimmed}</p>);
                    }
                  }
                });

                flushList('end');
                return rendered;
              })()}
            </div>

            <button 
              onClick={() => setSelectedScheme(null)}
              className="w-full mt-6 py-2.5 bg-[#0F4B70]/80 text-white rounded-xl font-bold shadow-md hover:bg-[#C4F8FF]/10-dark transition-all"
            >
              Close Guidelines
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeApplications;
