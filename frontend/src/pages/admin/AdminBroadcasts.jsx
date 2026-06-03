import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Megaphone, Calendar, Clock, AlertTriangle, List, CheckCircle2 } from 'lucide-react';

const AdminBroadcasts = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    category: 'Election',
    title: '',
    description: '',
    date: '',
    timings: ''
  });
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(t('successBroadcast') || 'Broadcast sent successfully!');
        setFormData({
          category: 'Election',
          title: '',
          description: '',
          date: '',
          timings: ''
        });
        fetchBroadcasts();
      } else {
        setError(data.message || 'Failed to send broadcast alert.');
      }
    } catch (err) {
      setError('Network error. Failed to publish broadcast.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in text-[#C4F8FF]">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Megaphone className="text-[#C4F8FF] animate-bounce" size={32} />
          {t('broadcastTitle') || 'Panchayat Broadcast Alerts'}
        </h1>
        <p className="text-[#C4F8FF]/70 mt-1 text-sm">
          Publish emergency alerts, utility schedules, election dates, or road blockage warnings. Broadcasts will translate auto-magically and trigger immediate emails to citizens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Publish Form */}
        <div className="lg:col-span-1 bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm h-fit">
          <h3 className="font-bold text-[#C4F8FF] text-base border-b border-[#C4F8FF]/10 pb-3 mb-4 flex items-center gap-2">
            <Megaphone size={18} /> {t('broadcastFormTitle') || 'Publish Alert'}
          </h3>

          {error && (
            <div className="bg-[#C4F8FF]/10 border border-red-400/30 text-red-400 p-3 rounded-lg mb-4 text-xs font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-[#C4F8FF]/10 border border-green-400/30 text-green-400 p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1">
                {t('categoryLabel') || 'Alert Category'}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 font-semibold bg-[#0F4B70]/20 text-[#C4F8FF] focus:outline-none focus:border-primary [&>option]:bg-[#061926] [&>option]:text-[#C4F8FF]"
              >
                <option value="Election">Election Date</option>
                <option value="Electricity Cutoff">Electricity Cutoff</option>
                <option value="Water Cutoff">Water Cutoff</option>
                <option value="Water Supplying">Water Supplying</option>
                <option value="Road Construction">Road Construction</option>
                <option value="Road Blockage">Road Blockage</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1">
                Alert Title (English)
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Schedule for Ward-4 Elections"
                className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 font-semibold bg-[#0F4B70]/20 text-[#C4F8FF] focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1">
                  {t('dateLabel') || 'Date'}
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 font-semibold bg-[#0F4B70]/20 text-[#C4F8FF] focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1">
                  {t('timingsLabel') || 'Timings'}
                </label>
                <input
                  type="text"
                  name="timings"
                  value={formData.timings}
                  onChange={handleChange}
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 font-semibold bg-[#0F4B70]/20 text-[#C4F8FF] focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-1">
                {t('descLabel') || 'Description'}
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Details of the blockage, cutoff areas, or voting booths..."
                className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2.5 font-semibold bg-[#0F4B70]/20 text-[#C4F8FF] focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-lg shadow-black/20 flex justify-center items-center gap-2 mt-4 transition-all disabled:opacity-50"
            >
              <Megaphone size={16} />
              {loading ? 'Publishing...' : (t('btnBroadcast') || 'Publish Broadcast')}
            </button>
          </form>
        </div>

        {/* Previous Alerts Board */}
        <div className="lg:col-span-2 bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm">
          <h3 className="font-bold text-[#C4F8FF] text-base border-b border-[#C4F8FF]/10 pb-3 mb-4 flex items-center gap-2">
            <List size={18} /> {t('broadcastListTitle') || 'Broadcast History'}
          </h3>

          {broadcasts.length === 0 ? (
            <div className="text-center py-16 bg-[#0F4B70]/10 rounded-xl border border-dashed border-[#C4F8FF]/20">
              <Megaphone className="mx-auto text-[#C4F8FF]/30 mb-3" size={40} />
              <p className="text-sm text-[#C4F8FF]/50 font-bold">No broadcasts have been published yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
                    className="p-5 border border-[#C4F8FF]/15 bg-[#0F4B70]/30 hover:bg-[#0F4B70]/40 rounded-2xl space-y-3 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(b.category)}`}>
                        {b.category}
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
                        <span>Timings: <strong className="text-[#C4F8FF]">{timingsText}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminBroadcasts;
