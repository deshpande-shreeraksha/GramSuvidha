import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';

const mockSubmissions = [
  {
    id: 'INC-001',
    title: 'WATER SUPPLY',
    desc: 'Major pipeline burst causing heavy water leakage on s...',
    location: 'S V Road, Bandra West, Mumbai',
    status: 'Under Review',
    statusColor: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
    stage: 'STAGE: REGISTRATION PHASE',
    progress: 25,
    date: '4/25/2026',
    icon: <LucideIcons.Droplets className="text-[#C4F8FF]" size={24} />
  },
  {
    id: 'INC-002',
    title: 'ROADS',
    desc: 'Extremely deep pothole in the middle of the road...',
    location: 'SV Road, Bandra West, Mumbai',
    status: 'In Progress',
    statusColor: 'text-[#C4F8FF] bg-[#C4F8FF]/10 border border-[#C4F8FF]/20',
    stage: 'STAGE: IMPLEMENTATION PHASE',
    progress: 75,
    date: '4/24/2026',
    icon: <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />
  },
  {
    id: 'INC-003',
    title: 'DRAINAGE',
    desc: 'Open manhole near the school entrance. Very...',
    location: 'Sanjay Gandhi National Park Rd',
    status: 'Under Review',
    statusColor: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20',
    stage: 'STAGE: VERIFICATION',
    progress: 50,
    date: '4/23/2026',
    icon: <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />
  },
  {
    id: 'INC-004',
    title: 'GARBAGE',
    desc: 'Animal carcass on the road needs immediate...',
    location: 'Chembur Naka, Mumbai',
    status: 'Resolved',
    statusColor: 'text-green-400 bg-green-500/10 border border-green-500/20',
    stage: 'STAGE: RESOLUTION REACHED',
    progress: 100,
    date: '4/22/2026',
    icon: <LucideIcons.Trash2 className="text-stone-400" size={24} />
  }
];

const RELATED_SCHEMES_MAP = {
  'WATER SUPPLY': {
    name: 'Jal Jeevan Mission (Har Ghar Jal)',
    icon: <LucideIcons.Droplets className="text-[#C4F8FF]" size={24} />,
    relation: 'Provides safe and adequate drinking water through individual household tap connections to improve sanitation in your region.',
    eligibility: 'All rural land-holding and household residents with inadequate or unclean tap access.',
    benefits: 'Subsidized or free tap pipeline connection installation, water quality testing kits, and community water supply networks.',
    details: 'Jal Jeevan Mission is envisioned to provide safe and adequate drinking water through individual household tap connections by 2024 to all households in rural India. The programme will also implement source sustainability measures.'
  },
  'ROADS': {
    name: 'MGNREGA Road Construction Initiative',
    icon: <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />,
    relation: 'Links local rural infrastructure improvements to direct guaranteed wage employment for local citizens.',
    eligibility: 'All rural adult household citizens willing to do volunteer or paid public works development.',
    benefits: 'Guaranteed 100 days of manual wage employment per year, improving local road networks, connectivity, and drainage canals.',
    details: 'Mahatma Gandhi National Rural Employment Guarantee Act guarantees livelihood security by building robust community assets like paved all-weather village roads, water harvesting dykes, and check dams.'
  },
  'DRAINAGE': {
    name: 'Swachh Bharat Mission (Grameen) - Phase II',
    icon: <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />,
    relation: 'Addresses solid and liquid waste management and open drainage issues in the community.',
    eligibility: 'All rural citizens living in villages facing community drainage blockages or waste dumps.',
    benefits: 'Funding for private toilets, construction of community soak pits, greywater management channels, and garbage collection centers.',
    details: 'Aims to support the transition of rural villages from Open Defecation Free (ODF) to ODF Plus, focusing on solid waste management, graywater management, and community sanitation channels.'
  },
  'GARBAGE': {
    name: 'Swachh Bharat Mission (Grameen) - Waste Management',
    icon: <LucideIcons.Trash2 className="text-stone-500" size={24} />,
    relation: 'Helps organize community-level compost pits and municipal garbage collection for waste-free villages.',
    eligibility: 'Panchayat clusters needing centralized dry/wet waste segregation units.',
    benefits: 'Community collection bins, composting infrastructure grants, and regular volunteer clearing campaigns.',
    details: 'Focuses on maintaining the cleanliness of rural communities by providing waste collection resources, organic waste compost facilities, and organizing regular clean-up drives.'
  },
  'GENERAL': {
    name: 'PM Kisan Samman Nidhi',
    icon: <LucideIcons.Activity className="text-[#C4F8FF]" size={24} />,
    relation: 'Provides direct financial assistance to support rural livelihoods and agricultural investments.',
    eligibility: 'All land-holding farmer families in Panchayat zones.',
    benefits: 'Direct bank transfer of ₹6,000 per year in three equal installments of ₹2,000.',
    details: 'An central sector scheme which provides income support of ₹6,000 per year in three equal installments to all land holding farmer families across the country to secure agricultural operations.'
  }
};

const getCategoryIcon = (category) => {
  const normalized = (category || '').toUpperCase();
  if (normalized.includes('WATER')) {
    return <LucideIcons.Droplets className="text-[#C4F8FF]" size={24} />;
  } else if (normalized.includes('ROAD')) {
    return <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />;
  } else if (normalized.includes('GARBAGE')) {
    return <LucideIcons.Trash2 className="text-stone-400" size={24} />;
  } else if (normalized.includes('ELECT')) {
    return <LucideIcons.Zap className="text-yellow-400" size={24} />;
  }
  return <LucideIcons.AlertTriangle className="text-[#C4F8FF]" size={24} />;
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'Resolved':
      return { statusColor: 'text-green-400 bg-green-500/10 border border-green-500/20', stage: 'STAGE: RESOLUTION REACHED', progress: 100 };
    case 'In Progress':
      return { statusColor: 'text-[#C4F8FF] bg-[#C4F8FF]/10 border border-[#C4F8FF]/20', stage: 'STAGE: IMPLEMENTATION PHASE', progress: 75 };
    default:
      return { statusColor: 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20', stage: 'STAGE: REGISTRATION PHASE', progress: 25 };
  }
};

const formatIndianCurrency = (num) => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Crore`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

import { useLanguage } from '../../context/LanguageContext';

const CitizenDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('John Doe');
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Dynamic tracking & status states
  const [trackingId, setTrackingId] = useState('');
  const [trackedItem, setTrackedItem] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [showTrackedReceipt, setShowTrackedReceipt] = useState(false);
  const [selectedComplaintStatus, setSelectedComplaintStatus] = useState('All');

  const handleTrackItem = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackedItem(null);
    try {
      const cleanId = trackingId.trim();
      let res;
      if (cleanId.startsWith('COMP-') || cleanId.startsWith('CMP-')) {
        res = await fetch(`/api/complaints/track/${cleanId}`);
      } else if (cleanId.startsWith('SCH-')) {
        res = await fetch(`/api/schemes/track/${cleanId}`);
      } else {
        setTrackingError('Invalid ID format. Must start with COMP- or SCH-');
        setTrackingLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTrackedItem({
          type: cleanId.startsWith('COMP-') || cleanId.startsWith('CMP-') ? 'complaint' : 'scheme',
          ...data
        });
      } else {
        setTrackingError('Tracking ID not found in database');
      }
    } catch (err) {
      console.error(err);
      setTrackingError('Failed to track. Server connection issue.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const [stats, setStats] = useState({
    total: 4,
    review: 2,
    progress: 1,
    resolved: 1
  });

  const [barData, setBarData] = useState([
    { name: 'Water Supply', value: 1 },
    { name: 'Roads', value: 1 },
    { name: 'Drainage', value: 1 },
    { name: 'Garbage', value: 1 },
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Under Review', value: 2, color: '#f59e0b' },
    { name: 'In Progress', value: 1, color: '#3b82f6' },
    { name: 'Resolved', value: 1, color: '#10b981' },
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let loggedInUserId = '';
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.name || 'John Doe');
        loggedInUserId = userObj._id;
      } catch (e) {
        console.error(e);
      }
    }

    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/complaints');
        if (response.ok) {
          const data = await response.json();
          const filteredData = loggedInUserId 
            ? data.filter(c => c.user && (c.user._id === loggedInUserId || c.user === loggedInUserId))
            : data;
          
          if (filteredData && filteredData.length > 0) {
            const formatted = filteredData.map((c, i) => {
              const statusInfo = getStatusStyles(c.status);
              return {
                id: c._id ? `INC-${c._id.slice(-3).toUpperCase()}` : `INC-00${i + 1}`,
                title: c.category ? c.category.replace('_', ' ').toUpperCase() : 'GENERAL',
                desc: c.description ? c.description.slice(0, 50) + '...' : 'No description',
                location: c.location || 'Unknown Location',
                status: c.status,
                date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
                icon: getCategoryIcon(c.category),
                ...statusInfo
              };
            });
            setSubmissions(formatted);

            const total = formatted.length;
            const review = formatted.filter(s => s.status === 'Pending' || s.status === 'Under Review' || s.status === 'Awaiting Review').length;
            const progress = formatted.filter(s => s.status === 'In Progress').length;
            const resolved = formatted.filter(s => s.status === 'Resolved').length;
            setStats({ total, review, progress, resolved });

            const categories = {};
            formatted.forEach(s => {
              categories[s.title] = (categories[s.title] || 0) + 1;
            });
            const newBarData = Object.keys(categories).map(cat => ({
              name: cat,
              value: categories[cat]
            }));
            if (newBarData.length > 0) {
              setBarData(newBarData);
            }

            setPieData([
              { name: 'Under Review', value: review, color: '#f59e0b' },
              { name: 'In Progress', value: progress, color: '#3b82f6' },
              { name: 'Resolved', value: resolved, color: '#10b981' },
            ]);
          } else {
            setSubmissions(mockSubmissions);
          }
        } else {
          setSubmissions(mockSubmissions);
        }
      } catch (err) {
        console.error("Error fetching user submissions, falling back to mock:", err);
        setSubmissions(mockSubmissions);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Compute government schemes related to user's registered complaints
  const relatedSchemes = React.useMemo(() => {
    if (submissions.length === 0) return [];
    
    // Extract unique titles from complaints
    const uniqueTitles = [...new Set(submissions.map(s => s.title))];
    const schemesList = [];

    uniqueTitles.forEach(title => {
      if (RELATED_SCHEMES_MAP[title]) {
        schemesList.push({
          complaintCategory: title,
          ...RELATED_SCHEMES_MAP[title]
        });
      }
    });

    // Add a default backup scheme if citizen has filed very few issues
    if (schemesList.length < 2) {
      schemesList.push({
        complaintCategory: 'GENERAL',
        ...RELATED_SCHEMES_MAP['GENERAL']
      });
    }

    return schemesList;
  }, [submissions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#C4F8FF]">{t('Citizen Dashboard')}</h1>
          <p className="text-[#C4F8FF]/70 mt-1">{t('Welcome back')}, <span className="font-bold text-[#C4F8FF]">{userName}</span>. {t('Track and manage your reported issues.')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/citizen/budget')}
            className="bg-[#0F4B70]/20 backdrop-blur-sm hover:bg-[#0F4B70]/30 text-[#C4F8FF] border border-[#C4F8FF]/15 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <LucideIcons.DollarSign size={18} className="text-[#C4F8FF]" /> {t('Panchayat Budget')}
          </button>
          <button 
            onClick={() => navigate('/citizen/complaint')}
            className="bg-[#0F4B70] hover:bg-[#0a344f] border border-[#C4F8FF]/20 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <LucideIcons.PlusCircle size={18} /> {t('New Complaint')}
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-6 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <LucideIcons.FileText className="mx-auto mb-2 text-[#C4F8FF]/60" size={24} />
          <div className="text-3xl font-bold text-[#C4F8FF]">{stats.total}</div>
          <div className="text-xs font-bold text-[#C4F8FF]/70 uppercase mt-1">{t('Total')}</div>
        </div>
        <div className="card text-center py-6 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <LucideIcons.Clock className="mx-auto mb-2 text-yellow-500" size={24} />
          <div className="text-3xl font-bold text-[#C4F8FF]">{stats.review}</div>
          <div className="text-xs font-bold text-[#C4F8FF]/70 uppercase mt-1">{t('Under Review')}</div>
        </div>
        <div className="card text-center py-6 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <LucideIcons.Activity className="mx-auto mb-2 text-[#C4F8FF]" size={24} />
          <div className="text-3xl font-bold text-[#C4F8FF]">{stats.progress}</div>
          <div className="text-xs font-bold text-[#C4F8FF]/70 uppercase mt-1">{t('In Progress')}</div>
        </div>
        <div className="card text-center py-6 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <LucideIcons.CheckCircle className="mx-auto mb-2 text-green-550" size={24} />
          <div className="text-3xl font-bold text-[#C4F8FF]">{stats.resolved}</div>
          <div className="text-xs font-bold text-[#C4F8FF]/70 uppercase mt-1">{t('Resolved')}</div>
        </div>
      </div>

      {/* Tracking and Budget Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
            <LucideIcons.Search size={20} className="text-[#C4F8FF]" /> {t('Track Complaint or Scheme')}
          </h3>
          <p className="text-xs text-[#C4F8FF]/70 mb-4">{t('Enter your unique tracking ID (COMP-XXXXXXXX or SCH-XXXXXXXX) to check its status and download the receipt.')}</p>
          
          <form onSubmit={handleTrackItem} className="flex gap-2">
            <input 
              type="text" 
              placeholder={t('e.g. COMP-10293847')} 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 rounded-xl border border-[#C4F8FF]/30 px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-semibold text-[#C4F8FF]"
            />
            <button 
              type="submit"
              disabled={trackingLoading}
              className="bg-[#0F4B70] hover:bg-[#0a344f] border border-[#C4F8FF]/20 text-white px-6 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-2"
            >
              {trackingLoading ? t('Searching...') : t('Track Status')}
            </button>
          </form>

          {trackingError && (
            <p className="text-xs font-bold text-red-500 mt-2">{t(trackingError)}</p>
          )}

          {trackedItem && (
            <div className="mt-4 p-4 bg-[#0F4B70]/30 border border-[#C4F8FF]/15 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-scale-in">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#C4F8FF] text-sm">
                    {trackedItem.type === 'complaint' ? t('Civic Complaint') : t('Scheme Application')}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#0F4B70]/30 text-[#C4F8FF]/80 rounded font-mono">
                    {trackedItem.type === 'complaint' ? trackedItem.complaintId : trackedItem.applicationId}
                  </span>
                </div>
                <p className="text-xs text-[#C4F8FF]/80 mt-1">
                  {trackedItem.type === 'complaint' ? t(trackedItem.category) : t(trackedItem.schemeName)} — {trackedItem.description || trackedItem.applicantName}
                </p>
                <div className="mt-2 text-xs font-bold text-[#C4F8FF]/70">
                  {t('Status')}: 
                  <span className={`ml-1 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] border ${
                    trackedItem.status === 'Resolved' || trackedItem.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    trackedItem.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {t(trackedItem.status)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTrackedReceipt(true)}
                className="text-xs font-bold bg-[#0F4B70]/20 backdrop-blur-sm hover:bg-[#0F4B70]/40 text-[#C4F8FF] border border-[#C4F8FF]/15 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 align-self-start sm:align-self-auto"
              >
                <LucideIcons.FileText size={14} className="text-[#C4F8FF]" /> {t('View Receipt')}
              </button>
            </div>
          )}
        </div>

        {/* Quick Information Panel */}
        <div className="card bg-gradient-to-br from-[#0F4B70]/40 to-[#061926] text-[#C4F8FF] border border-[#C4F8FF]/15 p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-base mb-1 text-[#C4F8FF]">{t('Participatory Budgeting')}</h4>
            <p className="text-xs text-[#C4F8FF]/70 leading-relaxed">
              {t('Every tax rupee paid by citizens is funneled back directly into village development budgets. Click below to inspect our annual Panchayat allocation values.')}
            </p>
          </div>
          <button 
            onClick={() => navigate('/citizen/budget')}
            className="w-full py-2.5 mt-4 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/20 font-extrabold rounded-xl text-xs hover:bg-[#0a344f] shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <LucideIcons.DollarSign size={14} className="text-[#C4F8FF]" /> {t('View Panchayat Budget')}
          </button>
        </div>
      </div>

      {/* My Submissions */}
      <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-[#C4F8FF]">{t('My Submissions')}</h3>
            <p className="text-xs text-[#C4F8FF]/70">{t('Track the live progress of your reported issues.')}</p>
          </div>
          {/* Status Tabs */}
          <div className="flex bg-[#0F4B70]/40 p-1 rounded-xl border border-[#C4F8FF]/15 text-xs">
            {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedComplaintStatus(status)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  selectedComplaintStatus === status 
                    ? 'bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] shadow-sm' 
                    : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
                }`}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-[#C4F8FF]/70">{t('Loading submissions...')}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider border-b border-[#C4F8FF]/15">
                  <th className="pb-3 pl-4">{t('Incident')}</th>
                  <th className="pb-3">{t('Current Status')}</th>
                  <th className="pb-3">{t('Incident Location')}</th>
                  <th className="pb-3">{t('Progress Stage')}</th>
                  <th className="pb-3">{t('Registered')}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = submissions.filter(sub => {
                    if (selectedComplaintStatus === 'All') return true;
                    if (selectedComplaintStatus === 'Pending') {
                      return sub.status === 'Pending' || sub.status === 'Under Review' || sub.status === 'Awaiting Review' || sub.status === 'Application Submitted';
                    }
                    return sub.status === selectedComplaintStatus;
                  });
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-[#C4F8FF]/60 font-medium">
                          {t('No submissions found.')}
                        </td>
                      </tr>
                    );
                  }
                  return filtered.map((sub, i) => (
                    <tr key={i} className="border-b border-[#C4F8FF]/20 last:border-0 hover:bg-[#0F4B70]/30">
                      <td className="py-4 pl-4 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-[#0F4B70]/40 flex items-center justify-center flex-shrink-0">
                          {sub.icon}
                        </div>
                        <div>
                          <div className="font-bold text-[#C4F8FF] text-sm mb-0.5">{t(sub.title)}</div>
                          <div className="text-xs text-[#C4F8FF]/70 line-clamp-1 w-48">{sub.desc}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md lowercase ${sub.statusColor}`}>
                          {t(sub.status)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-8 bg-[#0F4B70]/40 rounded flex items-center justify-center text-red-500">
                            <LucideIcons.MapPin size={14} />
                          </div>
                          <div className="text-xs text-[#C4F8FF]/70 w-32 line-clamp-2">{sub.location}</div>
                        </div>
                      </td>
                      <td className="py-4 w-48">
                        <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase mb-1.5">{t(sub.stage)}</div>
                        <div className="w-full h-1.5 bg-[#0F4B70]/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${sub.progress === 100 ? 'bg-[#C4F8FF]/100' : 'bg-[#C4F8FF]/100'}`} 
                            style={{width: `${sub.progress}%`}}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-sm text-[#C4F8FF]">{sub.date}</div>
                        <div className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Verified Entry')}</div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* NEW FEATURE: Government Schemes Related to Your Issues */}
      <div className="card border-[#C4F8FF]/20 bg-[#0F4B70]/10 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-[#C4F8FF] flex items-center gap-2">
              <LucideIcons.ShieldAlert className="text-[#C4F8FF] animate-pulse" size={20} />
              {t('Government Schemes Tailored to Your Reports')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/80">{t('Based on your village reports, you might be eligible for these development & welfare programs.')}</p>
          </div>
          <span className="text-[10px] font-bold text-[#C4F8FF] tracking-wider uppercase bg-[#0F4B70]/10 px-3 py-1 rounded-full border border-[#C4F8FF]/20">
            {t('INTELLIGENT COMPLIANCE')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relatedSchemes.map((scheme, idx) => (
            <div key={idx} className="bg-[#0F4B70]/20 backdrop-blur-sm border border-[#C4F8FF]/15 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F4B70]/40 flex items-center justify-center">
                    {scheme.icon}
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded border border-[#C4F8FF]/20 tracking-wider">
                    {scheme.complaintCategory === 'GENERAL' ? t('RECOMMENDED') : `${t('REMEDY FOR')}: ${t(scheme.complaintCategory)}`}
                  </span>
                </div>
                <h4 className="font-bold text-[#C4F8FF] text-base mb-2">{t(scheme.name)}</h4>
                <p className="text-xs text-[#C4F8FF]/70 leading-relaxed mb-4">{t(scheme.relation)}</p>
              </div>
              <button 
                onClick={() => setSelectedScheme(scheme)}
                className="w-full py-2 bg-[#0F4B70]/40 hover:bg-[#C4F8FF]/20 hover:text-[#C4F8FF] hover:border-[#C4F8FF]/30 border border-[#C4F8FF]/15 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <LucideIcons.Eye size={14} /> {t('View Expanded Details')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-1">{t('Complaint Analytics')}</h3>
          <p className="text-xs text-[#C4F8FF]/70 mb-6">{t('Visual overview of your reporting activity.')}</p>
          
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
              <BarChart data={barData} margin={{top: 10, right: 10, left: -20, bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196, 248, 255, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#C4F8FF', opacity: 0.7, fontSize: 10}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#C4F8FF', opacity: 0.7, fontSize: 10}} tickCount={5} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#07253b', borderRadius: '12px', border: '1px solid rgba(196, 248, 255, 0.2)', color: '#C4F8FF'}}
                  cursor={{fill: 'rgba(196, 248, 255, 0.05)'}}
                />
                <Bar dataKey="value" fill="#C4F8FF" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-widest mt-2">{t('Issues By Category')}</div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-6">&nbsp;</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#07253b', borderRadius: '12px', border: '1px solid rgba(196, 248, 255, 0.2)', color: '#C4F8FF'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-[#C4F8FF]/70">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                {t(item.name)}
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-widest mt-4">{t('Resolution Status')}</div>
        </div>
      </div>

      {/* Expanded Scheme Details Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-3xl shadow-xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto border border-[#C4F8FF]/20">
            <button 
              onClick={() => setSelectedScheme(null)} 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0F4B70]/30 hover:bg-[#0F4B70]/40 text-[#C4F8FF]/70 hover:text-[#C4F8FF] flex items-center justify-center font-semibold text-lg transition-colors"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0F4B70]/10 text-[#C4F8FF] flex items-center justify-center">
                {selectedScheme.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#C4F8FF]">{t(selectedScheme.name)}</h3>
                <span className="text-[10px] font-bold text-[#C4F8FF] tracking-wider uppercase bg-[#0F4B70]/10 px-2.5 py-0.5 rounded-full border border-[#C4F8FF]/20 mt-1 inline-block">
                  {t('RECONCILED WELFARE')}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#C4F8FF]/10 border border-[#C4F8FF]/20 p-4 rounded-2xl">
                <h4 className="font-bold text-[#C4F8FF] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <LucideIcons.ShieldCheck size={14} className="text-[#C4F8FF]" /> {t('Why this is recommended')}
                </h4>
                <p className="text-[#C4F8FF]/80 text-sm leading-relaxed">{t(selectedScheme.relation)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0F4B70]/30 p-4 rounded-2xl border border-[#C4F8FF]/20">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#C4F8FF]/60 mb-1">{t('ELIGIBILITY RULES')}</h5>
                  <p className="text-xs text-[#C4F8FF] font-semibold leading-relaxed">{t(selectedScheme.eligibility)}</p>
                </div>
                <div className="bg-[#0F4B70]/30 p-4 rounded-2xl border border-[#C4F8FF]/20">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#C4F8FF]/60 mb-1">{t('SCHEME BENEFITS')}</h5>
                  <p className="text-xs text-[#C4F8FF] font-semibold leading-relaxed">{t(selectedScheme.benefits)}</p>
                </div>
              </div>

              <div className="border-t border-[#C4F8FF]/20 pt-4">
                <h4 className="font-bold text-[#C4F8FF] text-sm uppercase tracking-wider mb-2">{t('FULL PROGRAM DETAILS')}</h4>
                <p className="text-[#C4F8FF]/80 text-sm leading-relaxed">{t(selectedScheme.details)}</p>
              </div>

              <div className="pt-6 border-t border-[#C4F8FF]/20 flex gap-4">
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="flex-1 py-3 border border-[#C4F8FF]/15 rounded-xl text-sm font-bold text-[#C4F8FF]/70 hover:bg-[#0F4B70]/30 transition-colors"
                >
                  {t('Close')}
                </button>
                <button 
                  onClick={() => {
                    setSelectedScheme(null);
                    navigate('/citizen/schemes');
                  }}
                  className="flex-2 py-3 bg-[#0F4B70] border border-[#C4F8FF]/20 text-white rounded-xl text-sm font-bold hover:bg-[#0a344f] shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <LucideIcons.ArrowRightCircle size={18} /> {t('Check Eligibility & Apply Now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Tracked Receipt Modal */}
      {showTrackedReceipt && trackedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-200 relative flex flex-col max-h-[90vh] text-slate-800 animate-fade-in">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('Official Receipt Preview')}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <LucideIcons.FileText size={14} /> {t('Print Receipt')}
                </button>
                <button 
                  onClick={() => setShowTrackedReceipt(false)}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  {t('Close')}
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white printable-receipt text-slate-850">
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-6">
                <div>
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">{t('Gram Panchayat Portal')}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('Government of India / Local Administration Board')}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{t('Village Ward')}: {trackedItem.user?.village || t('Panchayat Area')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded border border-slate-250 uppercase tracking-widest font-mono">
                    {trackedItem.type === 'complaint' ? t('REGISTRATION') : t('SUBMISSION')}
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-2">{t('Date')}: {trackedItem.createdAt ? new Date(trackedItem.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {trackedItem.type === 'complaint' ? (
                // Complaint Receipt
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-2 text-slate-700">
                    <p className="font-bold text-slate-900">{t('Complaint ID')}: <span className="font-mono text-slate-900 font-bold">{trackedItem.complaintId}</span></p>
                    <p className="text-slate-700">{t('Category')}: <span className="font-bold text-slate-800">{t(trackedItem.category)}</span></p>
                    <p className="text-slate-700">{t('Location')}: <span className="font-bold text-slate-800">{trackedItem.location}</span></p>
                    <p className="text-slate-700">{t('Priority')}: <span className="font-bold text-slate-800">{t(trackedItem.priority || 'Medium')}</span></p>
                    <p className="text-slate-700">{t('Reporter')}: <span className="font-bold text-slate-800">{trackedItem.user?.name || userName}</span></p>
                    <p className="text-slate-700">{t('Status')}: <span className="font-bold text-slate-900 uppercase">{t(trackedItem.status)}</span></p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">{t('Grievance Description')}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-205 whitespace-pre-wrap">
                      {trackedItem.description}
                    </p>
                  </div>
                </div>
              ) : (
                // Scheme Receipt
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs space-y-2 text-slate-700">
                    <p className="font-bold text-slate-900">{t('Application ID')}: <span className="font-mono text-slate-900 font-bold">{trackedItem.applicationId}</span></p>
                    <p className="text-slate-700">{t('Scheme Applied')}: <span className="font-bold text-slate-800">{t(trackedItem.schemeName)}</span></p>
                    <p className="text-slate-700">{t('Applicant')}: <span className="font-bold text-slate-800">{trackedItem.applicantName}</span></p>
                    <p className="text-slate-700">{t('Age')}: <span className="font-bold text-slate-800">{trackedItem.age}</span></p>
                    <p className="text-slate-700">{t('Masked ID Number')}: <span className="font-bold text-slate-800">XXXX-XXXX-{trackedItem.idNumber?.slice(-4) || 'XXXX'}</span></p>
                    <p className="text-slate-700">{t('Relationship')}: <span className="font-bold text-slate-800">{t(trackedItem.relationship || 'Self')}</span></p>
                    <p className="text-slate-700">{t('Status')}: <span className="font-bold text-slate-900 uppercase">{t(trackedItem.status)}</span></p>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-300 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase">{t('Verification')}</p>
                  <p className="font-bold text-slate-800 mt-1">{t('Gram Panchayat Comptroller Office')}</p>
                  <p className="text-slate-500 mt-0.5">{t('Digitally signed & cataloged through GramSuvidha node registry.')}</p>
                </div>
                
                <div className="text-center relative">
                  <div className="border-4 border-dashed border-slate-400 text-slate-600 rounded-full w-24 h-24 flex items-center justify-center font-black text-xs uppercase transform rotate-12 flex-shrink-0">
                    <div className="text-center">
                      <p>{t('SUBMITTED')}</p>
                      <p className="text-[8px] font-bold">{t('DIGITAL NODE')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
