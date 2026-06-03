import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit3, CheckCircle, Info, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AdminProfile = () => {
  const { setLanguage, t } = useLanguage();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    pincode: '',
    language: 'en'
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        if (data.user) {
          setForm({
            name: data.user.name || '',
            phone: data.user.phone || '',
            age: data.user.age || '',
            village: data.user.village || '',
            taluk: data.user.taluk || '',
            district: data.user.district || '',
            state: data.user.state || '',
            pincode: data.user.pincode || '',
            language: data.user.language || 'en'
          });
        }
      } else {
        setError('Failed to fetch profile data. Please log in again.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const result = await res.json();
      if (res.ok) {
        setProfileData(prev => ({ ...prev, user: result.user }));
        setLanguage(result.user.language); // Update context language
        setIsEditing(false);
        setSaveStatus('Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 4000);
      } else {
        setSaveStatus(result.message || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      setSaveStatus('Update failed due to network error.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#C4F8FF]/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const { user } = profileData || { user: {} };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#C4F8FF] tracking-tight flex items-center gap-3">
            <User className="text-[#C4F8FF] animate-pulse" size={32} />
            {t('Admin Profile')}
          </h1>
          <p className="text-[#C4F8FF]/70 mt-1 text-sm">
            {t('View or edit your administrative details and check system info.')}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 border border-primary/20 bg-[#0F4B70]/80/5 hover:bg-[#C4F8FF]/10/10 text-[#C4F8FF] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
        >
          <Edit3 size={14} /> {isEditing ? t('Cancel Edit') : t('Edit Profile')}
        </button>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          saveStatus.includes('successfully') 
            ? 'bg-[#C4F8FF]/10 text-green-400 border-green-400/30' 
            : 'bg-[#C4F8FF]/10 text-[#C4F8FF] border-[#C4F8FF]/30'
        }`}>
          <CheckCircle size={16} />
          {t(saveStatus)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Basic Meta */}
        <div className="bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 text-center h-fit shadow-sm space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <div className="w-32 h-32 bg-[#0F4B70]/80 rounded-full flex items-center justify-center text-white text-4xl font-extrabold border-4 border-blue-50 overflow-hidden shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#C4F8FF]">{user.name || t('Panchayat Admin')}</h2>
            <p className="text-[#C4F8FF]/70 text-xs font-bold uppercase tracking-wider mt-1">{t(user.role || 'Administrator')}</p>
          </div>

          <div className="border-t border-[#C4F8FF]/20 pt-4 text-left space-y-2 text-xs text-[#C4F8FF]/70">
            <div>
              <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">{t('Account ID')}</span>
              <span className="font-mono text-[#C4F8FF] font-bold">{user._id}</span>
            </div>
            <div>
              <span className="text-[#C4F8FF]/60 block text-[9px] font-bold uppercase">{t('Role Verification')}</span>
              <span className="font-bold text-[#C4F8FF]">{t('Official Panchayat Officer')}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Display / Edit Form */}
        <div className="lg:col-span-2 bg-[#0F4B70]/20 backdrop-blur-sm rounded-2xl border border-[#C4F8FF]/15 p-6 shadow-sm">
          {!isEditing ? (
            /* DISPLAY MODE */
            <div className="space-y-6">
              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 flex items-center gap-2">
                <Info size={18} className="text-[#C4F8FF]" /> {t('Profile Credentials')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Mail size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Email Address')}</p>
                    <p className="font-bold text-[#C4F8FF]">{user.email || t('Not set')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Phone size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Contact Number')}</p>
                    <p className="font-bold text-[#C4F8FF]">{user.phone || t('Not set')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Calendar size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Age (Years)')}</p>
                    <p className="font-bold text-[#C4F8FF]">{user.age || t('Not set')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <MapPin size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Registered Village')}</p>
                    <p className="font-bold text-[#C4F8FF]">{user.village || t('Not set')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#C4F8FF]/80">
                  <Languages size={18} className="text-[#C4F8FF]" />
                  <div>
                    <p className="text-[10px] text-[#C4F8FF]/60 font-bold uppercase tracking-wider">{t('Application Language')}</p>
                    <p className="font-bold text-[#C4F8FF] uppercase">
                      {user.language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : user.language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 pt-4">{t('Regional Jurisdiction Details')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0F4B70]/30 p-3.5 border border-[#C4F8FF]/20 rounded-xl">
                  <span className="text-[9px] text-[#C4F8FF]/60 font-bold block uppercase tracking-wider">{t('Taluk')}</span>
                  <span className="font-bold text-[#C4F8FF] text-xs">{user.taluk || t('Not set')}</span>
                </div>
                <div className="bg-[#0F4B70]/30 p-3.5 border border-[#C4F8FF]/20 rounded-xl">
                  <span className="text-[9px] text-[#C4F8FF]/60 font-bold block uppercase tracking-wider">{t('District')}</span>
                  <span className="font-bold text-[#C4F8FF] text-xs">{user.district || t('Not set')}</span>
                </div>
                <div className="bg-[#0F4B70]/30 p-3.5 border border-[#C4F8FF]/20 rounded-xl">
                  <span className="text-[9px] text-[#C4F8FF]/60 font-bold block uppercase tracking-wider">{t('State')}</span>
                  <span className="font-bold text-[#C4F8FF] text-xs">{user.state || t('Not set')}</span>
                </div>
                <div className="bg-[#0F4B70]/30 p-3.5 border border-[#C4F8FF]/20 rounded-xl">
                  <span className="text-[9px] text-[#C4F8FF]/60 font-bold block uppercase tracking-wider">{t('Pincode')}</span>
                  <span className="font-mono font-bold text-[#C4F8FF] text-xs">{user.pincode || t('Not set')}</span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={handleSave} className="space-y-6">
              <h3 className="font-bold text-[#C4F8FF] text-base border-b pb-3 flex items-center gap-2">
                <Edit3 size={18} className="text-[#C4F8FF]" /> {t('Update Particulars')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Phone Number')}</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Age')}</label>
                  <input
                    type="number"
                    required
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Assigned Village')}</label>
                  <input
                    type="text"
                    required
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Application Language')}</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF] bg-[#0F4B70]/20 [&>option]:bg-[#061926] [&>option]:text-[#C4F8FF]"
                  >
                    <option value="en">English</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Taluk')}</label>
                  <input
                    type="text"
                    value={form.taluk}
                    onChange={(e) => setForm({ ...form, taluk: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('District')}</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('State')}</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C4F8FF]/70 uppercase mb-1.5">{t('Pincode')}</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full border border-[#C4F8FF]/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary text-[#C4F8FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F4B70]/80 hover:bg-[#C4F8FF]/10-dark text-white rounded-xl font-bold shadow-md shadow-primary/25 transition-all text-xs"
              >
                {t('Save Changes')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
