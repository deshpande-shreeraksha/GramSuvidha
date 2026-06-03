import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Languages, Check } from 'lucide-react';

const SelectLanguage = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languagesList = [
    { code: 'en', label: 'ENGLISH', description: 'Navigate in English' },
    { code: 'kn', label: 'ಕನ್ನಡ (KANNADA)', description: 'ಕನ್ನಡದಲ್ಲಿ ಬ್ರೌಸ್ ಮಾಡಿ' },
    { code: 'hi', label: 'हिन्दी (HINDI)', description: 'हिन्दी में ब्राउज़ करें' }
  ];

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback locally if no token is found
        setLanguage(selected);
        const role = localStorage.getItem('role') || 'citizen';
        navigate(`/${role}/home`);
        return;
      }

      // Save to database profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language: selected })
      });

      if (response.ok) {
        setLanguage(selected);
        const role = localStorage.getItem('role') || 'citizen';
        navigate(`/${role}/home`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save language preference.');
      }
    } catch (err) {
      setError('Network error. Failed to save preference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061926] flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
      <div className="w-full max-w-4xl flex flex-col items-center mt-4">
        
        {/* Roof Geometry */}
        <div className="relative w-full max-w-[800px] flex flex-col items-center justify-end z-10 -mb-1">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-24 md:h-32 fill-[#0F4B70] drop-shadow-2xl">
            <polygon points="50,0 100,30 0,30" />
            <polygon points="50,2 98,30 2,30" className="fill-[#0a344f]" />
          </svg>
          
          <div className="absolute bottom-2 md:bottom-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-[#061926]/80 rounded-full flex items-center justify-center border-2 border-[#C4F8FF]/40 mb-1">
              <Activity className="text-[#C4F8FF]" size={20} />
            </div>
            <h1 className="text-lg md:text-xl font-black text-[#C4F8FF] tracking-widest uppercase">
              GramSuvidha
            </h1>
          </div>
        </div>
        
        {/* House Body */}
        <div className="w-full max-w-2xl bg-[#0F4B70] border-x-[12px] border-b-[16px] border-[#0a344f] relative px-4 md:px-12 pt-8 pb-4 shadow-2xl rounded-b-xl flex justify-center items-end min-h-[400px]">
          <div className="w-full max-w-md bg-[#061926] border-t-[12px] border-x-[12px] border-b-0 border-[#0a344f] rounded-t-[40px] relative z-20 p-6 md:p-8 shadow-2xl flex flex-col justify-between min-h-[380px]">
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-[#0F4B70]/50 rounded-full border border-[#C4F8FF]/20 mb-3">
                <Languages className="text-[#C4F8FF]" size={24} />
              </div>
              <h2 className="text-[#C4F8FF] font-black text-xl mb-1">{t('selectLangTitle') || 'Select Your Language'}</h2>
              <p className="text-[#C4F8FF]/60 text-xs">{t('selectLangDesc') || 'Choose your application language'}</p>
            </div>

            {error && (
              <div className="bg-[#C4F8FF]/10 border border-orange-400/30 text-orange-400 px-3 py-2 rounded-lg mb-4 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {/* Language Options List */}
            <div className="space-y-3 flex-1 mb-6">
              {languagesList.map((lang) => {
                const isSelected = selected === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setSelected(lang.code)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#0F4B70]/40 border-[#C4F8FF] shadow-lg shadow-[#C4F8FF]/5'
                        : 'bg-[#0F4B70]/10 border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[#C4F8FF]">{lang.label}</h4>
                      <p className="text-[10px] text-[#C4F8FF]/60 mt-0.5">{lang.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-[#C4F8FF] rounded-full flex items-center justify-center text-[#061926]">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3.5 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (t('langSaveBtn') || 'Save and Continue')}
            </button>
            
          </div>
        </div>

        {/* Porch Base */}
        <div className="w-full max-w-3xl h-4 bg-[#0a344f] rounded-b-xl shadow-lg"></div>
      </div>
    </div>
  );
};

export default SelectLanguage;
