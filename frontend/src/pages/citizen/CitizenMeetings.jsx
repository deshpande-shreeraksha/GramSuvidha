import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, ChevronDown, ChevronUp, UserCheck, ShieldAlert, Award } from 'lucide-react';

const CitizenMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);

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
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const toggleExpand = (id) => {
    if (expandedMeetingId === id) {
      setExpandedMeetingId(null);
    } else {
      setExpandedMeetingId(id);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
          <Calendar className="text-[#C4F8FF] animate-pulse" size={32} />
          Gram Sabha Meetings & Minutes
        </h1>
        <p className="text-[#C4F8FF]/70 mt-1 text-sm">
          Keep track of general body discussions, citizen questions, board resolutions, and ongoing infrastructure timelines.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#C4F8FF]/60 font-bold">Retrieving meeting logs...</div>
      ) : meetings.length === 0 ? (
        <div className="card bg-[#0F4B70]/20 backdrop-blur-sm p-12 text-center border border-[#C4F8FF]/15 rounded-2xl">
          <FileText size={40} className="text-slate-350 mx-auto mb-3" />
          <p className="text-[#C4F8FF]/85 font-bold">No meeting minutes registered by the Panchayat administration yet.</p>
          <p className="text-[#C4F8FF]/60 text-xs mt-1">Grievances and discussions are logged after each council assembly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => {
            const isExpanded = expandedMeetingId === m._id;
            return (
              <div 
                key={m._id} 
                className={`bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
                  isExpanded ? 'border-primary shadow-md' : 'border-[#C4F8FF]/15 hover:border-[#C4F8FF]/30 shadow-sm'
                }`}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleExpand(m._id)}
                  className="px-6 py-5 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5 text-[#C4F8FF] font-extrabold text-base">
                      <Calendar size={18} className="text-[#C4F8FF]" />
                      {new Date(m.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <span className="text-xs font-bold text-[#C4F8FF]/60 bg-[#0F4B70]/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock size={12} /> {m.time}
                    </span>
                  </div>

                  <button className="text-[#C4F8FF]/60 hover:text-[#C4F8FF] transition-colors focus:outline-none">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-[#C4F8FF]/20 pt-6 space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#C4F8FF]/60 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck size={14} className="text-[#C4F8FF]" /> 1. Topics & Details Discussed
                        </h4>
                        <p className="text-[#C4F8FF]/85 text-xs bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {m.detailsDiscussed}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#C4F8FF]/60 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert size={14} className="text-[#C4F8FF]" /> 2. Grievances Raised by Citizens
                        </h4>
                        <p className="text-[#C4F8FF]/85 text-xs bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {m.questionsRaised}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#C4F8FF]/60 uppercase tracking-wider flex items-center gap-1.5">
                          <Award size={14} className="text-green-400" /> 3. Solutions & Board Resolutions
                        </h4>
                        <p className="text-[#C4F8FF]/85 text-xs bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {m.solutionsProvided}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#C4F8FF]/60 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText size={14} className="text-[#C4F8FF]" /> 4. Immediate Actions Needed
                        </h4>
                        <p className="text-[#C4F8FF]/85 text-xs bg-[#0F4B70]/30 border border-[#C4F8FF]/20 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {m.actionsNeeded}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0F4B70]/80/5 rounded-2xl p-5 border border-primary/10 space-y-2">
                      <h4 className="text-xs font-black text-[#C4F8FF] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={14} /> 5. Target Developments Before Next council assembly
                      </h4>
                      <p className="text-[#C4F8FF] text-xs font-bold leading-relaxed whitespace-pre-wrap">
                        {m.developmentBeforeNext}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CitizenMeetings;
