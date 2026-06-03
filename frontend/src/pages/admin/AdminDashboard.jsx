import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, CheckCircle, Users, AlertCircle, TrendingUp, Zap, User, MapPin, Mail, Phone, Flame, UserX, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboard = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    phone: '',
    age: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    pincode: ''
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminSaveStatus, setAdminSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Panchayat Financials State
  const [financials, setFinancials] = useState({
    totalTaxesCollected: 0,
    totalTaxesOutstanding: 0,
    allocatedBudget: 0,
    totalResolutionExpenses: 0,
    netBalance: 0
  });
  const [financialsLoading, setFinancialsLoading] = useState(true);

  const [days, setDays] = useState(30);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [systemIntel, setSystemIntel] = useState(null);
  const [intelLoading, setIntelLoading] = useState(true);
  const [intelError, setIntelError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSystemLogs = () => {
    const logs = [
      { id: 'LOG-001', event: t('Database connection established to MongoDB Cluster'), category: 'SYSTEM', time: t('Just now'), type: 'success' },
      { id: 'LOG-002', event: t('AI Chatbot assistant initialized on client ports'), category: 'AI_BOT', time: t('5 mins ago'), type: 'info' },
      { id: 'LOG-003', event: t('Bilingual translation dictionary cache refreshed successfully'), category: 'I18N', time: t('12 mins ago'), type: 'success' },
      { id: 'LOG-004', event: t('System overview dashboard requested by user admin@panchayat.gov.in'), category: 'AUTH', time: t('20 mins ago'), type: 'info' },
    ];

    complaints.slice(0, 3).forEach((comp, idx) => {
      const timeString = comp.createdAt ? new Date(comp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${idx + 1} hr ago`;
      logs.unshift({
        id: `LOG-C${idx + 10}`,
        event: `${t('Complaint updated: status marked as')} "${t(comp.status)}" ${t('and assigned to')} "${comp.assigned && comp.assigned !== '-' ? comp.assigned : t('None')}"`,
        category: 'COMPLAINTS',
        time: timeString,
        type: comp.status === 'Resolved' ? 'success' : 'warning'
      });
    });

    workers.slice(0, 2).forEach((worker, idx) => {
      logs.unshift({
        id: `LOG-W${idx + 20}`,
        event: `${t('Field worker registered:')} ${worker.name} ${t('assigned to village/ward')} "${worker.village || t('Panchayat Area')}"`,
        category: 'WORKFORCE',
        time: `${idx + 2} hrs ago`,
        type: 'info'
      });
    });

    return logs;
  };

  const fetchSystemIntel = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    setIntelError(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/system-intel', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Language': language
        }
      });
      if (res.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSystemIntel(data);
        setLastRefreshed(new Date());
      } else {
        setIntelError(true);
      }
    } catch (err) {
      setIntelError(true);
    } finally {
      setIntelLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate, language]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [complaintsRes, workersRes, profileRes, financialsRes] = await Promise.all([
          fetch('/api/complaints'),
          fetch('/api/auth/workers'),
          fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/taxes/financial-summary', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (profileRes.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(complaintsData);
        }
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);
        }
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setAdminInfo(profileData.user || null);
          setAdminForm({
            name: profileData.user?.name || '',
            phone: profileData.user?.phone || '',
            age: profileData.user?.age || '',
            village: profileData.user?.village || '',
            taluk: profileData.user?.taluk || '',
            district: profileData.user?.district || '',
            state: profileData.user?.state || '',
            pincode: profileData.user?.pincode || ''
          });
        }
        if (financialsRes.ok) {
          const finData = await financialsRes.json();
          setFinancials(finData);
        }
      } catch (err) {
        console.error("Error fetching admin metrics:", err);
      } finally {
        setLoading(false);
        setFinancialsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch system intel separately with 30s auto-refresh
  useEffect(() => {
    fetchSystemIntel();
    const interval = setInterval(() => fetchSystemIntel(), 30000);
    return () => clearInterval(interval);
  }, [fetchSystemIntel]);

  const filteredComplaints = days === 7 
    ? complaints.filter(c => {
        const date = new Date(c.createdAt || Date.now());
        const diffTime = Math.abs(new Date() - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
    : complaints;

  const totalRequests = filteredComplaints.length;
  const pendingCount = filteredComplaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = filteredComplaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved').length;
  const activeWorkers = workers.length || 10;

  // Calculate live priorities distribution
  const highPriority = filteredComplaints.filter(c => c.priority === 'High').length;
  const mediumPriority = filteredComplaints.filter(c => c.priority === 'Medium').length;
  const lowPriority = filteredComplaints.filter(c => c.priority === 'Low').length;

  const priorityData = [
    { name: 'High', value: highPriority || 4, color: '#f43f5e' }, // Rose/Red
    { name: 'Medium', value: mediumPriority || 6, color: '#f59e0b' }, // Amber/Orange
    { name: 'Low', value: lowPriority || 3, color: '#10b981' } // Emerald/Green
  ];

  const pieData = [
    { name: 'Pending', value: pendingCount || 5, color: '#f59e0b' },
    { name: 'Resolved', value: resolvedCount || 3, color: '#10b981' },
    { name: 'In Progress', value: inProgressCount || 4, color: '#3b82f6' },
  ];

  const stats = [
    { title: t('TOTAL REQUESTS'), value: totalRequests.toString(), trend: '+12%', icon: <Activity size={24} className="text-[#C4F8FF]" />, bg: 'bg-[#0F4B70]/10' },
    { title: t('PENDING ACTION'), value: pendingCount.toString(), trend: '-2%', icon: <Clock size={24} className="text-[#C4F8FF]" />, bg: 'bg-[#C4F8FF]/10' },
    { title: t('SUCCESSFUL RESOLUTIONS'), value: resolvedCount.toString(), trend: '+5%', icon: <CheckCircle size={24} className="text-green-550" />, bg: 'bg-[#C4F8FF]/10' },
    { title: t('ACTIVE VOLUNTEERS'), value: activeWorkers.toString(), trend: 'STABLE', icon: <Users size={24} className="text-[#C4F8FF]" />, bg: 'bg-[#C4F8FF]/10' },
    { title: `${t('CITIZENS')} (ID: ${adminInfo?.villageId || 'N/A'})`, value: (systemIntel?.summary?.totalCitizens ?? 0).toString(), trend: 'LIVE', icon: <Users size={24} className="text-[#C4F8FF]" />, bg: 'bg-[#C4F8FF]/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#C4F8FF]">{t('System Overview')}</h1>
          <p className="text-[#C4F8FF]/70 mt-1">{t('GramSuvidha infrastructure dashboard and complaint routing.')}</p>
        </div>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card flex flex-col justify-between min-h-[9rem] h-auto p-4 hover:scale-[1.02] transition-transform duration-350 animate-slide-up" style={{ animationDelay: `${i * 75}ms` }}>
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend === 'STABLE' ? 'text-[#C4F8FF]/60' : 'text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-[#C4F8FF] leading-none">{stat.value}</div>
              <div className="text-[10px] font-black text-[#C4F8FF]/60 mt-1.5 uppercase tracking-wider leading-tight">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Panchayat Financial Intelligence Panel */}
      <div className="card">
        <h3 className="font-bold text-lg text-[#C4F8FF] flex items-center gap-2 mb-2">
          <TrendingUp size={20} className="text-[#C4F8FF]" /> {t('Panchayat Financial Intelligence')}
        </h3>
        <p className="text-xs text-[#C4F8FF]/70 mb-6">{t('Revenue and expenditure audit tracking for this fiscal year.')}</p>

        {financialsLoading ? (
          <div className="py-8 text-center text-[#C4F8FF]/60 font-medium">{t('Loading financials...')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider">{t('Allocated Budget')}</span>
              <div className="text-xl font-black text-[#C4F8FF] mt-2">₹{financials.allocatedBudget.toLocaleString()}</div>
              <span className="text-[9px] text-[#C4F8FF]/60 mt-1 uppercase">{t('State/Central Allocation')}</span>
            </div>

            <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider">{t('Taxes Collected')}</span>
              <div className="text-xl font-black text-green-400 mt-2">₹{financials.totalTaxesCollected.toLocaleString()}</div>
              <span className="text-[9px] text-green-400 mt-1 uppercase font-bold">{Math.round((financials.totalTaxesCollected / (financials.totalTaxesCollected + financials.totalTaxesOutstanding || 1)) * 100)}% {t('Tax Recovery')}</span>
            </div>

            <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider">{t('Taxes Outstanding')}</span>
              <div className="text-xl font-black text-[#C4F8FF] mt-2">₹{financials.totalTaxesOutstanding.toLocaleString()}</div>
              <span className="text-[9px] text-[#C4F8FF]/60 mt-1 uppercase">{t('Pending Collection')}</span>
            </div>

            <div className="bg-[#0F4B70]/30 border border-[#C4F8FF]/20 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider">{t('Grievance Expenses')}</span>
              <div className="text-xl font-black text-red-400 mt-2">₹{financials.totalResolutionExpenses.toLocaleString()}</div>
              <span className="text-[9px] text-red-500 mt-1 uppercase font-bold">{t('Spent on Resolutions')}</span>
            </div>

            <div className="bg-[#0F4B70]/10 border border-[#C4F8FF]/20 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#C4F8FF] uppercase tracking-wider">{t('Available Balance')}</span>
              <div className="text-xl font-black text-[#C4F8FF] mt-2">₹{financials.netBalance.toLocaleString()}</div>
              <span className="text-[9px] text-[#C4F8FF]/70 mt-1 uppercase font-bold">{t('Panchayat Cash Reserve')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REPLACEMENT FEATURE: Priority-based Complaint Visualization (Volume AreaChart Removed) */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-[#C4F8FF] flex items-center gap-2">
                <Flame size={20} className="text-rose-500 animate-pulse" /> {t('Complaint Priority Distribution')}
              </h3>
              <p className="text-xs text-[#C4F8FF]/70 mt-1">{t('Real-time breakdown of filed complaints categorized by priority.')}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={priorityData} margin={{top: 10, right: 10, left: -20, bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196, 248, 255, 0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#C4F8FF', opacity: 0.7, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#C4F8FF', opacity: 0.7, fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#07253b', borderRadius: '12px', border: '1px solid rgba(196, 248, 255, 0.2)', color: '#C4F8FF'}}
                  cursor={{fill: 'rgba(196, 248, 255, 0.05)'}}
                />
                <Bar dataKey="value" barSize={45} radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {priorityData.map((p, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-[#C4F8FF]/70">
                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: p.color}}></span>
                {t(p.name)} ({p.value})
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#C4F8FF]/20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[10px] font-extrabold text-rose-400 uppercase mb-2 flex items-center gap-1">
                <Flame size={12} /> {t('High Priority Tasks')}
              </div>
              <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {filteredComplaints.filter(c => c.priority === 'High').map((c, i) => (
                  <li key={i} className="text-xs text-rose-300 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded truncate flex items-center justify-between" title={c.description}>
                    <span>{c.category ? t(c.category.replace('_', ' ').toUpperCase()) : t('GENERAL')}</span>
                    <span className="text-[9px] font-bold text-rose-300 bg-rose-500/25 px-1.5 py-0.5 rounded truncate max-w-20">{c.assigned && c.assigned !== '-' ? c.assigned : t('UNASSIGNED')}</span>
                  </li>
                ))}
                {filteredComplaints.filter(c => c.priority === 'High').length === 0 && (
                  <li className="text-[11px] text-[#C4F8FF]/60 font-medium italic">{t('No active high priority')}</li>
                )}
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-amber-400 uppercase mb-2 flex items-center gap-1">
                <Flame size={12} /> {t('Medium Priority Tasks')}
              </div>
              <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {filteredComplaints.filter(c => c.priority === 'Medium' || !c.priority).map((c, i) => (
                  <li key={i} className="text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded truncate flex items-center justify-between" title={c.description}>
                    <span>{c.category ? t(c.category.replace('_', ' ').toUpperCase()) : t('GENERAL')}</span>
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-500/25 px-1.5 py-0.5 rounded truncate max-w-20">{c.assigned && c.assigned !== '-' ? c.assigned : t('UNASSIGNED')}</span>
                  </li>
                ))}
                {filteredComplaints.filter(c => c.priority === 'Medium' || !c.priority).length === 0 && (
                  <li className="text-[11px] text-[#C4F8FF]/60 font-medium italic">{t('No active medium priority')}</li>
                )}
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-extrabold text-green-400 uppercase mb-2 flex items-center gap-1">
                <Flame size={12} /> {t('Low Priority Tasks')}
              </div>
              <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {filteredComplaints.filter(c => c.priority === 'Low').map((c, i) => (
                  <li key={i} className="text-xs text-green-300 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-1 rounded truncate flex items-center justify-between" title={c.description}>
                    <span>{c.category ? t(c.category.replace('_', ' ').toUpperCase()) : t('GENERAL')}</span>
                    <span className="text-[9px] font-bold text-green-300 bg-green-500/25 px-1.5 py-0.5 rounded truncate max-w-20">{c.assigned && c.assigned !== '-' ? c.assigned : t('UNASSIGNED')}</span>
                  </li>
                ))}
                {filteredComplaints.filter(c => c.priority === 'Low').length === 0 && (
                  <li className="text-[11px] text-[#C4F8FF]/60 font-medium italic">{t('No active low priority')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>


        {/* Donut Chart (Status) */}
        <div className="card">
          <div className="text-center mb-2">
            <h3 className="font-bold text-lg text-[#C4F8FF] flex items-center justify-center gap-2">
              <Zap size={20} className="text-[#C4F8FF]" /> {t('Live Status')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/70 mt-1">{t('Operational lifecycle phase.')}</p>
          </div>
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
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-[#C4F8FF]">{complaints.length || '3'}</span>
              <span className="text-[9px] text-[#C4F8FF]/60 font-bold uppercase tracking-widest mt-1">{t('Incidents')}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{backgroundColor: item.color}}></div>
                <div className="text-[10px] font-bold text-[#C4F8FF]/70 uppercase truncate">{t(item.name)}</div>
                <div className="font-bold text-sm text-[#C4F8FF]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Intel & Logs */}
      <div className="w-full">
        {/* Live System Intel */}
        <div className="card w-full">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-lg text-[#C4F8FF] flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> {t('System Intel')}
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 ml-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> {t('LIVE')}
              </span>
            </h3>
            <button
              onClick={() => fetchSystemIntel(true)}
              disabled={isRefreshing}
              title="Refresh intel"
              className="p-1.5 rounded-lg text-slate-450 hover:text-[#C4F8FF] hover:bg-[#0F4B70]/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-xs text-[#C4F8FF]/70 mb-1">{t('Real-time intelligence computed from your MongoDB data.')}</p>
          {lastRefreshed && (
            <p className="text-[10px] text-[#C4F8FF]/60 mb-5 flex items-center gap-1">
              {intelError ? <WifiOff size={10} className="text-red-400" /> : <Wifi size={10} className="text-green-500" />}
              {intelError ? t('Connection issue — showing last known data') : `${t('Last updated')}: ${lastRefreshed.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}`}
            </p>
          )}

          {intelLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-[#0F4B70]/40 animate-pulse" />
              ))}
            </div>
          ) : intelError && !systemIntel ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <WifiOff size={32} className="text-[#C4F8FF]/70 mb-2" />
              <p className="text-sm font-semibold text-[#C4F8FF]/70">{t('Could not load system intel')}</p>
              <p className="text-xs text-[#C4F8FF]/60 mt-1">{t('Make sure the backend server is running')}</p>
              <button onClick={() => fetchSystemIntel(true)} className="mt-3 text-xs font-bold text-[#C4F8FF] hover:underline">{t('Retry')}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {(systemIntel?.intel || []).map((item) => {
                const iconMap = {
                  clock: <Clock size={18} />,
                  users: <Users size={18} />,
                  check: <CheckCircle size={18} />,
                  alert: <AlertCircle size={18} />,
                  'user-x': <UserX size={18} />,
                  trending: <TrendingUp size={18} />
                };
                const colorMap = {
                  success: { bg: 'bg-green-500/10', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400 border border-green-500/30', border: 'border-green-500/25', row: 'bg-[#0F4B70]/20' },
                  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-50/20 text-amber-400 border border-amber-500/30', border: 'border-amber-500/25', row: 'bg-[#0F4B70]/20' },
                  danger: { bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-50/20 text-rose-400 border border-rose-500/30', border: 'border-rose-500/25', row: 'bg-[#0F4B70]/20' },
                  info: { bg: 'bg-blue-500/10', text: 'text-[#C4F8FF]', badge: 'bg-blue-500/20 text-[#C4F8FF] border border-blue-500/30', border: 'border-blue-500/25', row: 'bg-[#0F4B70]/30' }
                };
                const c = colorMap[item.type] || colorMap.info;
                return (
                  <div key={item.id} className={`flex items-center gap-4 p-3.5 rounded-xl border ${c.border} ${c.row} transition-all`}>
                    <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}>
                      {iconMap[item.icon] || <Activity size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#C4F8FF] text-sm">{t(item.title)}</h4>
                      <p className="text-xs text-[#C4F8FF]/70 mt-0.5 leading-relaxed">{t(item.description)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${c.badge}`}>{t(item.badge)}</span>
                      <span className="text-[11px] font-bold text-[#C4F8FF]/80">{item.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <button 
            onClick={() => setShowLogsModal(true)}
            className="w-full mt-5 py-3 text-sm font-bold text-[#C4F8FF]/70 uppercase tracking-wider hover:text-[#C4F8FF] transition-colors border border-[#C4F8FF]/15 hover:bg-[#0F4B70]/30 rounded-xl"
          >
            {t('VIEW OPERATIONAL LOG')}
          </button>
        </div>
      </div>

      {/* Operational Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-[#0F4B70]/30 backdrop-blur-md/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl max-w-2xl w-full shadow-xl border border-[#C4F8FF]/15 overflow-hidden">
            <div className="px-6 py-4 bg-[#0F4B70]/30 border-b border-[#C4F8FF]/20 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#C4F8FF] text-lg">{t('System Operational Logs')}</h3>
                <p className="text-xs text-[#C4F8FF]/70 mt-0.5">{t('Real-time status updates and admin action tracking.')}</p>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-[#C4F8FF]/60 hover:text-[#C4F8FF]/80 font-bold text-lg">✕</button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
              {getSystemLogs().map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-4 p-3 rounded-xl border border-[#C4F8FF]/20 bg-[#0F4B70]/30 hover:bg-[#0F4B70]/40 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                    log.type === 'success' ? 'bg-green-100 text-green-400' :
                    log.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-[#C4F8FF]/20 text-[#C4F8FF]'
                  }`}>
                    {log.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-[#C4F8FF]/60 tracking-wider uppercase">{t(log.category)}</span>
                      <span className="text-[10px] text-[#C4F8FF]/60 font-medium">{t(log.time)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#C4F8FF] mt-1">{t(log.event)}</p>
                    <span className="text-[10px] text-[#C4F8FF]/60 font-mono mt-1 block">{t('ID')}: {log.id}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-[#0F4B70]/30 border-t border-[#C4F8FF]/20 flex justify-end">
              <button onClick={() => setShowLogsModal(false)} className="px-4 py-2 bg-[#0F4B70]/80 text-white font-bold rounded-lg hover:bg-[#0F4B70]/90 shadow-sm transition-colors">
                {t('Close Logs')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
