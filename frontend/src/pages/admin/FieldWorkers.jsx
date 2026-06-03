import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, MapPin, Loader2, CheckCircle, XCircle, Briefcase, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FieldWorkers = () => {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [village, setVillage] = useState('Bandra West');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workerStats, setWorkerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Available');

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/worker-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkerStats(data);
      }
    } catch (err) {
      console.error('Error fetching worker stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setStatsLoading(true);
    setError('');
    await Promise.all([fetchWorkers(), fetchWorkerStats()]);
  };

  useEffect(() => {
    fetchWorkers();
    fetchWorkerStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !phone || !age) {
      setError(t('Please fill in all fields'));
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email: name.toLowerCase().replace(/\s+/g, '') + '@panchayat.gov.in',
          phone,
          age: Number(age),
          gender,
          village
        })
      });
      if (response.ok) {
        setSuccess(t('Worker registered successfully!'));
        setName('');
        setPhone('');
        setAge('');
        fetchWorkers();
        fetchWorkerStats();
      } else {
        const errData = await response.json();
        setError(t(errData.message || 'Failed to register worker'));
      }
    } catch (err) {
      setError(t('Network error'));
    }
  };

  const toggleWorkerStatus = async (workerId, currentStatus) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/workers/${workerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setWorkers(prev => prev.map(w => w._id === workerId ? { ...w, isActive: !currentStatus } : w));
        setSuccess(t('Worker marked as') + ' ' + (!currentStatus ? t('Active') : t('Inactive')) + '!');
        setTimeout(() => setSuccess(''), 3000);
        fetchWorkerStats(); // refresh stats after toggle
      } else {
        const errData = await response.json();
        setError(t(errData.message || 'Failed to toggle status'));
      }
    } catch (err) {
      setError(t('Network error updating status'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#C4F8FF]">{t('Field Workers')}</h1>
          <p className="text-[#C4F8FF]/70 mt-1">{t('Manage and track the active GramSuvidha workforce.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#C4F8FF]/80 border border-slate-250 rounded-xl hover:bg-[#0F4B70]/30 hover:text-[#C4F8FF] transition-colors shadow-sm bg-[#0F4B70]/20 backdrop-blur-sm"
          >
            <RefreshCw size={13} className={(loading || statsLoading) ? 'animate-spin' : ''} /> {t('Refresh List')}
          </button>
        </div>
      </div>

      {/* Clickable Profile/Picture and Stats Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Clickable Picture Card to Toggle Add Worker Registry */}
        <div 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`card p-4 flex flex-col items-center justify-center text-center cursor-pointer border border-dashed transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-full lg:w-44 ${
            showAddForm 
              ? 'border-primary bg-[#0F4B70]/10 shadow-sm' 
              : 'border-[#C4F8FF]/30 hover:border-primary hover:bg-[#0F4B70]/20'
          }`}
        >
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-[#0F4B70]/30 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/50 transition-colors">
              <svg className="w-10 h-10 text-[#C4F8FF]/60 group-hover:text-[#C4F8FF] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 bg-[#0F4B70]/80 text-white p-1 rounded-full border border-white shadow flex items-center justify-center">
              <UserPlus size={12} />
            </div>
          </div>
          <span className="text-[10px] font-black text-[#C4F8FF]/80 mt-3 uppercase tracking-wider group-hover:text-[#C4F8FF] transition-colors">
            {showAddForm ? t('Close Registry') : t('Click Photo to Add')}
          </span>
        </div>

        {/* Live Worker Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <div className="card p-4 flex items-center gap-3 border-l-4 border-blue-400 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="w-9 h-9 rounded-xl bg-[#C4F8FF]/20 text-[#C4F8FF] flex items-center justify-center flex-shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#C4F8FF]">
                {statsLoading ? <span className="inline-block w-8 h-5 bg-[#0F4B70]/40 rounded animate-pulse" /> : (workerStats?.total ?? workers.length)}
              </div>
              <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wide">{t('Total Workers')}</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 border-l-4 border-green-500 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#C4F8FF]">
                {statsLoading ? <span className="inline-block w-8 h-5 bg-[#0F4B70]/40 rounded animate-pulse" /> : (workerStats?.active ?? workers.filter(w => w.isActive).length)}
              </div>
              <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wide">{t('Active')}</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 border-l-4 border-rose-500 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#C4F8FF]">
                {statsLoading ? <span className="inline-block w-8 h-5 bg-[#0F4B70]/40 rounded animate-pulse" /> : (workerStats?.inactive ?? workers.filter(w => !w.isActive).length)}
              </div>
              <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wide">{t('Inactive')}</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 border-l-4 border-amber-500 hover:scale-[1.02] transition-transform duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#C4F8FF]">
                {statsLoading ? <span className="inline-block w-8 h-5 bg-[#0F4B70]/40 rounded animate-pulse" /> : (workerStats?.assignedComplaints ?? '—')}
              </div>
              <div className="text-[10px] font-bold text-[#C4F8FF]/60 uppercase tracking-wide">{t('Assigned Cases')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Force Overview Table */}
        <div className={`card ${showAddForm ? 'xl:col-span-2' : 'xl:col-span-3'} overflow-hidden flex flex-col`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <h3 className="font-bold text-lg">{t('Force Overview')}</h3>
              {/* Available Workers Filter Tab */}
              <div className="flex bg-[#0F4B70]/40 p-1 rounded-xl border border-[#C4F8FF]/15 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('Available')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                    statusFilter === 'Available'
                      ? 'bg-[#0F4B70] text-[#C4F8FF] shadow-sm'
                      : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
                  }`}
                >
                  {t('Available Workers')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                    statusFilter === 'All'
                      ? 'bg-[#0F4B70] text-[#C4F8FF] shadow-sm'
                      : 'text-[#C4F8FF]/70 hover:text-[#C4F8FF]'
                  }`}
                >
                  {t('All Workers')}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#0F4B70]/30 px-3 py-1.5 rounded-lg border border-[#C4F8FF]/15 w-full sm:w-auto">
              <Search size={16} className="text-[#C4F8FF]/60" />
              <input 
                type="text" 
                placeholder={t('Search workers...')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full sm:w-48 text-[#C4F8FF]" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="py-12 text-center text-[#C4F8FF]/70">{t('Loading workers...')}</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-[#C4F8FF]/60 uppercase tracking-wider border-b border-[#C4F8FF]/15">
                    <th className="pb-3 pl-4">{t('Photo')}</th>
                    <th className="pb-3">{t('Worker Identity')}</th>
                    <th className="pb-3">{t('Area / Village')}</th>
                    <th className="pb-3">{t('Contact')}</th>
                    <th className="pb-3">{t('Demographics')}</th>
                    <th className="pb-3 text-center">{t('Active Status Toggle')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(() => {
                    const filteredWorkers = workers.filter(worker => {
                      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            (worker.village || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (worker.phone || '').includes(searchQuery);
                      const matchesStatus = statusFilter === 'All' || worker.isActive === true;
                      return matchesSearch && matchesStatus;
                    });
                    if (filteredWorkers.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-[#C4F8FF]/60">{t('No field workers found matching search.')}</td>
                        </tr>
                      );
                    }
                    return filteredWorkers.map((worker, i) => (
                      <tr key={worker._id || i} className="border-b border-[#C4F8FF]/20 hover:bg-[#0F4B70]/30 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="w-10 h-10 rounded-full bg-[#0F4B70]/30 flex items-center justify-center text-[#C4F8FF] font-bold">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-bold text-[#C4F8FF]">{worker.name}</div>
                          <div className="text-xs text-[#C4F8FF]/60">{t('ID:')} {worker._id ? `WRK-${worker._id.slice(-4).toUpperCase()}` : t('N/A')}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-[#C4F8FF]/80">
                            <MapPin size={14} /> {worker.village || t('Panchayat Area')}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-[#C4F8FF]/80">
                            <Phone size={14} /> {worker.phone}
                          </div>
                        </td>
                        <td className="py-4 text-[#C4F8FF]/80 text-xs">
                          {worker.age} {t('Y/O')} • {t(worker.gender ? (worker.gender.charAt(0).toUpperCase() + worker.gender.slice(1).toLowerCase()) : 'Male')}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded transition-colors ${worker.isActive ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 'text-[#C4F8FF]/70 bg-[#0F4B70]/40 border border-[#C4F8FF]/10'}`}>
                              {worker.isActive ? t('ACTIVE') : t('INACTIVE')}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleWorkerStatus(worker._id, worker.isActive)}
                              aria-label={t('Toggle active status')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${worker.isActive ? 'bg-[#0F4B70]' : 'bg-slate-800 border border-[#C4F8FF]/20'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-[#C4F8FF] transition-transform ${worker.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add New Worker Form */}
        {showAddForm && (
          <div className="card h-fit sticky top-6">
            <div className="mb-6">
              <h3 className="font-bold text-lg">{t('Add New Worker')}</h3>
              <p className="text-xs text-[#C4F8FF]/70 mt-1">{t('Register a new field worker for the GramSuvidha force.')}</p>
            </div>

            {error && <div className="bg-[#C4F8FF]/10 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-xs font-semibold">{error}</div>}
            {success && <div className="bg-[#C4F8FF]/10 border border-green-400/30 text-green-400 px-4 py-2 rounded-lg mb-4 text-xs font-semibold">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Phone Number')}</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Age')}</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Gender')}</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm"
                    >
                      <option value="Male">{t('Male')}</option>
                      <option value="Female">{t('Female')}</option>
                      <option value="Other">{t('Other')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4F8FF]/70 uppercase tracking-wider mb-2">{t('Assigned Village / Ward')}</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur Panchayat"
                    className="w-full border border-[#C4F8FF]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-[#0F4B70]/20 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C4F8FF]/20">
                <button
                  type="button"
                  onClick={() => { setName(''); setPhone(''); setAge(''); setError(''); setSuccess(''); }}
                  className="px-4 py-2 text-sm font-bold text-[#C4F8FF]/70 hover:text-[#C4F8FF]"
                >
                  {t('Clear')}
                </button>
                <button type="submit" className="btn-primary bg-[#0F4B70] hover:bg-[#0a344f] text-[#C4F8FF] border border-[#C4F8FF]/20">{t('Register Worker')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldWorkers;
