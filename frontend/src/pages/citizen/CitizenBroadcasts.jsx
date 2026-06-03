import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Megaphone, Calendar, Clock, List } from 'lucide-react';

const CitizenBroadcasts = () => {
  const { t, language } = useLanguage();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/broadcasts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data);
      }
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Election': return 'border-green-500/30 bg-green-500/10 text-green-400';
      case 'Electricity Cutoff': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'Water Cutoff': return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      case 'Water Supplying': return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
      case 'Road Construction': return 'border-purple-500/30 bg-purple-500/10 text-purple-400';
      case 'Road Blockage': return 'border-red-500/30 bg-red-500/10 text-red-400';
      default: return 'border-[#C4F8FF]/20 bg-[#0F4B70]/20 text-[#C4F8FF]';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4F8FF]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in text-[#C4F8FF]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Megaphone className="text-[#C4F8FF] animate-bounce" size={32} />
          {t('broadcastTitle') || t('Panchayat Broadcast Alerts')}
        </h1>
        <p className="text-[#C4F8FF]/70 mt-1 text-sm">
          {t('Stay updated with important announcements regarding local elections, water supply schedules, power cutoffs, and road constructions in our village.')}
        </p>
      </div>

      {/* Announcements Board */}
      <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm">
        <h3 className="font-bold text-[#C4F8FF] text-base border-b border-[#C4F8FF]/10 pb-3 mb-6 flex items-center gap-2">
          <List size={18} /> {t('broadcastListTitle') || t('Active Announcements Board')}
        </h3>

        {broadcasts.length === 0 ? (
          <div className="text-center py-20 bg-[#0F4B70]/10 rounded-xl border border-dashed border-[#C4F8FF]/20">
            <Megaphone className="mx-auto text-[#C4F8FF]/30 mb-3" size={44} />
            <p className="text-sm text-[#C4F8FF]/50 font-bold">{t('No announcements or alerts are currently active.')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {broadcasts.map((b) => {
              // Determine localized text based on context
              let titleText = b.title;
              let descText = b.description;
              let timingsText = b.timings;

              if (language === 'kn' && b.translations?.kn?.title) {
                titleText = b.translations.kn.title;
                descText = b.translations.kn.description;
                timingsText = b.translations.kn.timings;
              } else if (language === 'hi' && b.translations?.hi?.title) {
                titleText = b.translations.hi.title;
                descText = b.translations.hi.description;
                timingsText = b.translations.hi.timings;
              }

              return (
                <div
                  key={b._id}
                  className="p-5 border border-[#C4F8FF]/15 bg-[#0F4B70]/30 hover:bg-[#0F4B70]/40 rounded-2xl space-y-3 transition-all duration-300 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(b.category)}`}>
                      {t(b.category)}
                    </span>
                    <span className="text-[10px] text-[#C4F8FF]/50 font-bold flex items-center gap-1">
                      <Calendar size={12} /> {new Date(b.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-[#C4F8FF] leading-tight">{titleText}</h4>
                  <p className="text-xs text-[#C4F8FF]/80 leading-relaxed font-medium whitespace-pre-line">{descText}</p>

                  {timingsText && (
                    <div className="pt-2 border-t border-[#C4F8FF]/10 flex items-center gap-2 text-[10px] text-[#C4F8FF]/70 font-semibold">
                      <Clock size={12} className="text-[#C4F8FF]" />
                      <span>{t('Timings:')} <strong className="text-[#C4F8FF]">{timingsText}</strong></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CitizenBroadcasts;
