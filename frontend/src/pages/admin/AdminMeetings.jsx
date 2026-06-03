import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminMeetings = () => {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [detailsDiscussed, setDetailsDiscussed] = useState('');
  const [questionsRaised, setQuestionsRaised] = useState('');
  const [solutionsProvided, setSolutionsProvided] = useState('');
  const [actionsNeeded, setActionsNeeded] = useState('');
  const [developmentBeforeNext, setDevelopmentBeforeNext] = useState('');

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data || []);
      } else {
        setError(t('Failed to fetch meeting records.'));
      }
    } catch (err) {
      console.error(err);
      setError(t('Network error loading meetings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !detailsDiscussed || !questionsRaised || !solutionsProvided || !actionsNeeded || !developmentBeforeNext) {
      alert(t('Please fill in all meeting log fields.'));
      return;
    }

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          time,
          detailsDiscussed,
          questionsRaised,
          solutionsProvided,
          actionsNeeded,
          developmentBeforeNext
        })
      });

      if (res.ok) {
        alert(t('Meeting minutes registered successfully! Citizens are being notified via email.'));
        // Reset Form
        setDate('');
        setTime('');
        setDetailsDiscussed('');
        setQuestionsRaised('');
        setSolutionsProvided('');
        setActionsNeeded('');
        setDevelopmentBeforeNext('');
        // Refresh List
        fetchMeetings();
      } else {
        const errData = await res.json();
        alert(t('Failed to register meeting: ') + errData.message);
      }
    } catch (err) {
      console.error(err);
      alert(t('Error registering meeting.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
          <Calendar className="text-[#C4F8FF] animate-pulse" size={32} />
          {t('Meetings & Minutes Console')}
        </h1>
        <p className="text-[#C4F8FF]/70 mt-1 text-sm">
          {t('Log Gram Panchayat general body minutes, citizen grievances, resolutions, and next target timelines.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting logger form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-extrabold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
              <PlusCircle size={20} className="text-[#C4F8FF]" /> {t('Log New Meeting Minutes')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/60 mb-6">{t('Submitted minutes are officially logged and automatically broadcasted to all citizens.')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Meeting Date')}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Meeting Time')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm text-[#C4F8FF] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('1. Topics & Details Discussed')}</label>
                <textarea
                  rows="3"
                  required
                  placeholder={t('Record summary details of key topics addressed in the general body...')}
                  value={detailsDiscussed}
                  onChange={(e) => setDetailsDiscussed(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('2. Questions & Grievances Raised by Citizens')}</label>
                <textarea
                  rows="3"
                  required
                  placeholder={t('Log specific queries, complaints, or feedback brought up by the resident body...')}
                  value={questionsRaised}
                  onChange={(e) => setQuestionsRaised(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('3. Solutions & Resolutions Provided')}</label>
                <textarea
                  rows="3"
                  required
                  placeholder={t('Summarize the answers, options, or formal resolutions agreed by the board...')}
                  value={solutionsProvided}
                  onChange={(e) => setSolutionsProvided(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('4. Immediate Actions Needed')}</label>
                <textarea
                  rows="2"
                  required
                  placeholder={t('Outline immediate tasks, assigned officers, or fast-track steps...')}
                  value={actionsNeeded}
                  onChange={(e) => setActionsNeeded(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('5. Infrastructure Targets Before Next Meeting')}</label>
                <textarea
                  rows="2"
                  required
                  placeholder={t('Specific civil/development goals (e.g. Completing school paving, setting up solar cells)...')}
                  value={developmentBeforeNext}
                  onChange={(e) => setDevelopmentBeforeNext(e.target.value)}
                  className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-[#0F4B70]/20 backdrop-blur-sm font-medium text-[#C4F8FF]"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-[#0F4B70]/80 hover:bg-[#C4F8FF]/10-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> {submitLoading ? t('Publishing & Broadcasting Minutes...') : t('Save & Publish Meeting Minutes')}
              </button>
            </form>
          </div>
        </div>

        {/* Historical Logs Sidebar */}
        <div className="space-y-6">
          <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-6 rounded-2xl border border-[#C4F8FF]/15 shadow-sm">
            <h3 className="font-extrabold text-lg text-[#C4F8FF] mb-2 flex items-center gap-2">
              <FileText size={18} className="text-[#C4F8FF]" /> {t('Meeting History List')}
            </h3>
            <p className="text-xs text-[#C4F8FF]/70 mb-4">{t('Historical record of Panchayat minutes logged.')}</p>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#C4F8FF]/60 font-semibold">{t('Loading records...')}</div>
              ) : error ? (
                <div className="p-4 bg-[#C4F8FF]/10 text-red-400 rounded-xl text-xs font-semibold">{error}</div>
              ) : meetings.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#C4F8FF]/60 italic">{t('No meetings recorded yet.')}</div>
              ) : (
                meetings.map(m => (
                  <div key={m._id} className="p-4 rounded-xl border border-[#C4F8FF]/15 bg-[#0F4B70]/20 hover:bg-[#0F4B70]/30 transition-all space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#C4F8FF]">
                        <Calendar size={14} className="text-[#C4F8FF]" />
                        {new Date(m.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}
                      </div>
                      <div className="text-[10px] font-bold text-[#C4F8FF]/60 flex items-center gap-1">
                        <Clock size={12} /> {m.time}
                      </div>
                    </div>

                    <div className="border-t border-[#C4F8FF]/15 pt-2 text-xs space-y-1 text-[#C4F8FF]/80">
                      <div>
                        <strong className="text-[#C4F8FF] font-bold block">{t('Discussion:')}</strong>
                        <p className="line-clamp-2 leading-relaxed text-[11px] mt-0.5">{m.detailsDiscussed}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.sentToCitizens ? 'bg-green-100 text-green-400' : 'bg-[#C4F8FF]/20 text-[#C4F8FF]'}`}>
                          {m.sentToCitizens ? t('Emailed to Citizens') : t('Local copy only')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMeetings;
