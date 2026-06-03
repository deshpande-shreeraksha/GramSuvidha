import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardPlus, FileText, DollarSign, CreditCard, Calendar, Clock, Bell, Info, ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CitizenHome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const citizenName = storedUser.name || 'Citizen';

  const [latestMeeting, setLatestMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestMeeting = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('/api/meetings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLatestMeeting(data[0]); // Take the most recent meeting minutes
          }
        }
      } catch (err) {
        console.error('Error fetching latest meeting minutes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMeeting();
  }, []);

  const citizenActions = [
    {
      title: t('Report Civic Grievance'),
      desc: t('Report water supply leaks, broken streetlights, or road potholes with photo uploads and automatic GPS lock.'),
      icon: <ClipboardPlus className="text-[#C4F8FF]" size={20} />,
      path: '/citizen/complaint'
    },
    {
      title: t("Government Scheme's"),
      desc: t('Explore, check eligibility, and apply for national welfare programs (PMAY, MGNREGA) with digital receipts.'),
      icon: <FileText className="text-[#C4F8FF]" size={20} />,
      path: '/citizen/schemes'
    },
    {
      title: t('Panchayat Budget'),
      desc: t('Inspect annual development budgets, funds reserves, and itemized sector allocations visually.'),
      icon: <DollarSign className="text-[#C4F8FF]" size={20} />,
      path: '/citizen/budget'
    },
    {
      title: t('Property Taxes'),
      desc: t('Calculate annual property taxes using official government rules, pay dues online, and download receipts.'),
      icon: <CreditCard className="text-[#C4F8FF]" size={20} />,
      path: '/citizen/taxes'
    }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in text-[#C4F8FF]">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F4B70]/30 backdrop-blur-md text-white p-8 md:p-10 shadow-xl border border-[#C4F8FF]/20">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C4F8FF]/10 text-[#C4F8FF] border border-[#C4F8FF]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4F8FF] animate-pulse"></span>
            {t('Citizen Portal Dashboard')}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('Welcome to GramSuvidha Digital Panchayat')}
          </h1>
          <p className="text-xs md:text-sm text-[#C4F8FF]/70 leading-relaxed">
            {t('Hello, ')}<strong className="text-white font-bold">{citizenName}</strong>{t('. Access Panchayat services, track status of grievances, apply for welfare benefits, and check public council decisions online.')}
          </p>
        </div>
      </div>

      {/* Main Grid: Notice Board vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Notice Board & Agendas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-[#C4F8FF] flex items-center gap-2 border-b border-[#C4F8FF]/20 pb-3">
              <Bell className="text-[#C4F8FF] animate-bounce" size={20} />
              {t('Panchayat Digital Notice Board')}
            </h3>

            {/* General Council Announcements */}
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-l-[#C4F8FF] bg-[#0F4B70]/30 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#C4F8FF]/60">
                  <span className="uppercase text-[#C4F8FF] font-black">{t('IMPORTANT ANNOUNCEMENT')}</span>
                  <span>{t('June 2026')}</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#C4F8FF]">{t('Property Tax Assessment Deadline')}</h4>
                <p className="text-xs text-[#C4F8FF]/85 leading-relaxed">
                  {t('Citizens are requested to compute and settle their property tax bills for the current assessment cycle. Late filings will attract standard municipal cesses. Pay directly under the "Property Taxes" path in the sidebar.')}
                </p>
              </div>

              <div className="p-4 border-l-4 border-l-[#C4F8FF] bg-[#0F4B70]/30 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#C4F8FF]/60">
                  <span className="uppercase text-[#C4F8FF] font-black">{t('HEALTH DRIVE')}</span>
                  <span>{t('June 2026')}</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#C4F8FF]">{t('Universal Vaccination Camp')}</h4>
                <p className="text-xs text-[#C4F8FF]/85 leading-relaxed">
                  {t('A free village health audit and child immunization camp will be organized at the local Panchayat community building next Monday at 09:00 AM.')}
                </p>
              </div>
            </div>

            {/* Latest Council Assembly Minutes */}
            <div className="border-t border-[#C4F8FF]/20 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-[#C4F8FF] flex items-center gap-2">
                  <BookOpen size={16} className="text-[#C4F8FF]/60" />
                  {t('Recent Council Assembly Minutes')}
                </h4>
                <button 
                  onClick={() => navigate('/citizen/meetings')}
                  className="text-xs font-bold text-[#C4F8FF] hover:underline flex items-center gap-1"
                >
                  {t('View All Minutes')} &rarr;
                </button>
              </div>

              {loading ? (
                <div className="text-center py-6 text-[#C4F8FF]/60 text-xs font-bold">{t('Checking minutes log...')}</div>
              ) : !latestMeeting ? (
                <div className="text-center py-6 text-[#C4F8FF]/60 text-xs italic bg-[#0F4B70]/30 rounded-xl">
                  {t('No council meeting minutes recorded yet.')}
                </div>
              ) : (
                <div className="p-4 bg-[#0F4B70]/30 border border-[#C4F8FF]/20 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-[#C4F8FF]/70 border-b border-[#C4F8FF]/15 pb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#C4F8FF]" />
                      {t('Held:')} {new Date(latestMeeting.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {t('Time:')} {latestMeeting.time}
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <strong className="text-[#C4F8FF] font-extrabold block">{t('Primary Topics Discussed:')}</strong>
                      <p className="text-[#C4F8FF]/80 leading-relaxed mt-0.5 text-[11px] line-clamp-2">{latestMeeting.detailsDiscussed}</p>
                    </div>
                    <div>
                      <strong className="text-[#C4F8FF] font-extrabold block">{t('Target Civil Infrastructures before next cycle:')}</strong>
                      <p className="text-[#C4F8FF] font-bold leading-relaxed mt-0.5 text-[11px] line-clamp-1">{latestMeeting.developmentBeforeNext}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Action Grid */}
        <div className="space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#C4F8FF]">{t('Quick Citizen Actions')}</h3>
            <p className="text-xs text-[#C4F8FF]/70">{t('Instant shortcuts to direct services.')}</p>

            <div className="space-y-3">
              {citizenActions.map((action, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(action.path)}
                  className="p-4 border border-[#C4F8FF]/20 hover:border-[#C4F8FF]/40 hover:shadow-sm bg-[#0F4B70]/10 hover:bg-[#0F4B70]/30 backdrop-blur-sm rounded-xl transition-all flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="p-2.5 bg-[#0F4B70]/20 backdrop-blur-sm rounded-xl border border-[#C4F8FF]/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-[#C4F8FF] group-hover:text-[#C4F8FF] transition-colors flex items-center gap-1">
                      {action.title} <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-[10px] text-[#C4F8FF]/70 leading-normal">{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-[#C4F8FF]/10 border border-[#C4F8FF]/20 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#C4F8FF]">
              <Info size={16} />
              <h4 className="font-bold text-xs">{t('Need Assistance?')}</h4>
            </div>
            <p className="text-[11px] text-[#C4F8FF]/80 leading-relaxed">
              {t('If you have questions regarding land records, scheme requirements, or tax values, try querying our AI chatbot helper in the bottom-right corner. It supports Hindi translations too!')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenHome;
