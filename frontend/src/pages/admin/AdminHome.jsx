import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, FileText, Users, CreditCard, ArrowRight, ShieldAlert, PlusCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminHome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const adminName = storedUser.name || 'Panchayat Administrator';

  const [stats, setStats] = useState({
    pendingComplaints: 0,
    activeWorkers: 0,
    totalMeetings: 0,
    unpaidTaxes: 0,
    citizenCount: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [compRes, workRes, meetRes, taxRes, citizenRes] = await Promise.all([
          fetch('/api/complaints', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/auth/workers', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/meetings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/taxes', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/citizen-count', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        let pendingCount = 0;
        let recentComps = [];
        if (compRes.ok) {
          const comps = await compRes.json();
          const unresolved = comps.filter(c => c.status === 'Pending' || c.status === 'In Progress');
          pendingCount = unresolved.length;
          recentComps = unresolved.slice(0, 4); // Take top 4 unresolved complaints
        }

        let workerCount = 0;
        if (workRes.ok) {
          const workers = await workRes.json();
          workerCount = workers.length;
        }

        let meetingCount = 0;
        if (meetRes.ok) {
          const meetings = await meetRes.json();
          meetingCount = meetings.length;
        }

        let unpaidCount = 0;
        if (taxRes.ok) {
          const taxes = await taxRes.json();
          unpaidCount = taxes.filter(t => t.paymentStatus === 'Unpaid').length;
        }

        let citizenCount = 0;
        if (citizenRes.ok) {
          const citizenData = await citizenRes.json();
          citizenCount = citizenData.count;
        }

        setStats({
          pendingComplaints: pendingCount,
          activeWorkers: workerCount,
          totalMeetings: meetingCount,
          unpaidTaxes: unpaidCount,
          citizenCount: citizenCount
        });
        setRecentComplaints(recentComps);
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDetails();
  }, []);

  const quickActions = [
    {
      title: t('Log Council Meeting'),
      desc: t('Log dates, topics discussed, citizen queries, solutions, and email minutes.'),
      icon: <Calendar className="text-[#C4F8FF]" size={22} />,
      path: '/admin/meetings',
      actionText: t('Open Logger')
    },
    {
      title: t('Configure Annual Budget'),
      desc: t('Set total budget, allocate itemized sector funds, and trigger citizen email notifications.'),
      icon: <DollarSign className="text-[#C4F8FF]" size={22} />,
      path: '/admin/budget',
      actionText: t('Allocate Budget')
    },
    {
      title: t('Manage Complaints'),
      desc: t('Dispatch field workers, audit resolution status, and manage resolution ledgers.'),
      icon: <FileText className="text-[#C4F8FF]" size={22} />,
      path: '/admin/complaints',
      actionText: t('Review Queue')
    },
    {
      title: t('Property Tax Assessments'),
      desc: t('Calculate local property taxes, register assessments, and audit ledger balances.'),
      icon: <CreditCard className="text-[#C4F8FF]" size={22} />,
      path: '/admin/taxes',
      actionText: t('Assign Assessment')
    }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Administrative Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F4B70]/30 backdrop-blur-md text-white p-8 md:p-10 shadow-xl border border-[#C4F8FF]/20">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C4F8FF]/10 text-[#C4F8FF] border border-[#C4F8FF]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4F8FF] animate-pulse"></span>
            {t('Administrative Command Portal')}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('Gram Panchayat Administrator Dashboard')}
          </h1>
          <p className="text-xs md:text-sm text-[#C4F8FF]/70 leading-relaxed">
            {t('Hello, ')}<strong className="text-white font-bold">{adminName}</strong>{t('. Use this board to track pending grievances, assign public works, configure annual budgets, and publish minutes.')}
          </p>
        </div>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-5 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">{t('Pending Grievances')}</span>
            <span className="text-2xl font-black text-[#C4F8FF]">{stats.pendingComplaints}</span>
          </div>
        </div>

        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-5 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">{t('Active Field Force')}</span>
            <span className="text-2xl font-black text-[#C4F8FF]">{stats.activeWorkers} {t('Workers')}</span>
          </div>
        </div>

        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-5 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">{t('Registered Citizens')}</span>
            <span className="text-2xl font-black text-[#C4F8FF]">{stats.citizenCount}</span>
            <span className="text-[9px] text-[#C4F8FF]/50 font-bold block mt-0.5 uppercase">{t('ID:')} {storedUser.villageId || t('N/A')}</span>
          </div>
        </div>

        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-5 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">{t('Meetings Concluded')}</span>
            <span className="text-2xl font-black text-[#C4F8FF]">{stats.totalMeetings} {t('sessions')}</span>
          </div>
        </div>

        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-5 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wider block">{t('Unpaid Taxes Ledger')}</span>
            <span className="text-2xl font-black text-[#C4F8FF]">{stats.unpaidTaxes} {t('Properties')}</span>
          </div>
        </div>
      </div>

      {/* Main content columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-extrabold text-lg text-[#C4F8FF] mb-2">{t('Administrative Shortcuts')}</h3>
            <p className="text-xs text-[#C4F8FF]/60 mb-6">{t('Quick links to perform administrative operations across the Panchayat modules.')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <div key={idx} className="p-4 border border-[#C4F8FF]/15 rounded-2xl hover:border-[#C4F8FF]/40 hover:shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-2 bg-[#0F4B70]/30 rounded-xl border border-[#C4F8FF]/20 flex-shrink-0">
                        {action.icon}
                      </div>
                      <h4 className="font-extrabold text-sm text-[#C4F8FF]">{action.title}</h4>
                    </div>
                    <p className="text-xs text-[#C4F8FF]/70 leading-relaxed mb-4">{action.desc}</p>
                  </div>
                  <button 
                    onClick={() => navigate(action.path)}
                    className="w-full py-2 bg-[#0F4B70]/20 hover:bg-[#0F4B70]/40 border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/30 text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    {action.actionText} <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Unresolved Grievances (1 Col) */}
        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#C4F8FF] mb-1 flex items-center gap-2">
              <ShieldAlert className="text-[#C4F8FF]" size={18} /> {t('Active Grievances Queue')}
            </h3>
            <p className="text-[11px] text-[#C4F8FF]/60 mb-4">{t('Latest unresolved citizen complaints requiring worker assignment.')}</p>

            <div className="space-y-3">
              {loading ? (
                <div className="py-6 text-center text-xs text-[#C4F8FF]/60 font-semibold">{t('Checking queue...')}</div>
              ) : recentComplaints.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#C4F8FF]/60 italic">{t('No unresolved complaints. Good job!')}</div>
              ) : (
                recentComplaints.map(c => (
                  <div key={c._id} className="p-3 border border-[#C4F8FF]/20 bg-[#0F4B70]/20 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#C4F8FF]/60 font-mono uppercase bg-[#0F4B70]/40 px-2 py-0.5 rounded">
                        {c.id || c.complaintId}
                      </span>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#C4F8FF]/20 text-[#C4F8FF]`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-[#C4F8FF] line-clamp-1">{c.category}</p>
                    <p className="text-[11px] text-[#C4F8FF]/70 line-clamp-2 leading-normal">{c.description || c.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/complaints')}
            className="w-full mt-4 py-2 border border-[#C4F8FF]/15 hover:bg-[#0F4B70]/30 text-[#C4F8FF]/80 hover:text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
          >
            {t('Open Full Ledger')} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
