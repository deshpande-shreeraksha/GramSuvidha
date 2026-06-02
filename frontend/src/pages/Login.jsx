import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserCircle, ShieldCheck, Activity, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }), // Assuming email is used as identifier
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          _id: data._id,
          villageId: data.villageId || '',
          village: data.village || ''
        }));
        
        if (data.role === 'admin') {
          navigate('/admin/home');
        } else if (data.role === 'citizen') {
          navigate('/citizen/home');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#061926] flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
      
      {/* House Structure */}
      <div className="w-full max-w-4xl flex flex-col items-center mt-8">
        
        {/* The Roof */}
        <div className="relative w-full max-w-[800px] flex flex-col items-center justify-end z-10 -mb-1">
          {/* SVG Roof Geometry */}
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-32 md:h-48 fill-[#0F4B70] drop-shadow-2xl">
            <polygon points="50,0 100,30 0,30" />
            <polygon points="50,2 98,30 2,30" className="fill-[#0a344f]" />
          </svg>
          
          {/* Branding on the roof facade */}
          <div className="absolute bottom-4 md:bottom-8 flex flex-col items-center cursor-default hover:scale-105 transition-transform duration-500">
            <div className="w-12 h-12 bg-[#061926]/80 rounded-full flex items-center justify-center border-2 border-[#C4F8FF]/40 mb-2 shadow-[0_0_15px_rgba(196,248,255,0.3)]">
              <Activity className="text-[#C4F8FF]" size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#C4F8FF] tracking-widest uppercase drop-shadow-lg">
              GramSuvidha
            </h1>
            <p className="text-[10px] md:text-xs text-[#C4F8FF]/70 tracking-widest uppercase font-bold mt-1">
              Digital Panchayat
            </p>
          </div>
        </div>
        
        {/* The House Body */}
        <div className="w-full max-w-3xl bg-[#0F4B70] border-x-[12px] border-b-[16px] border-[#0a344f] relative px-4 md:px-12 pt-12 pb-0 shadow-2xl rounded-b-xl flex gap-6 md:gap-12 justify-center items-end min-h-[450px]">
           
           {/* Left Window (Decorative) */}
           <div className="hidden md:flex flex-col w-32 h-48 bg-[#061926] border-[6px] border-[#0a344f] rounded-t-full shadow-inner relative overflow-hidden justify-center items-center group">
              <div className="absolute inset-0 border-t-[6px] border-b-[6px] border-[#0a344f] top-1/2 -translate-y-1/2 z-10" />
              <div className="absolute inset-0 border-l-[6px] border-r-[6px] border-[#0a344f] left-1/2 -translate-x-1/2 z-10" />
              <div className="absolute inset-0 bg-[#C4F8FF]/5 group-hover:bg-[#C4F8FF]/20 transition-colors duration-700" />
              <ShieldCheck className="text-[#C4F8FF]/30 z-0" size={40} />
           </div>

           {/* The Door (Login Form) */}
           <div className="w-full max-w-sm bg-[#061926] border-t-[12px] border-x-[12px] border-b-0 border-[#0a344f] rounded-t-[40px] relative z-20 p-6 md:p-8 shadow-2xl flex flex-col justify-end min-h-[480px]">
              {/* Doorknob */}
              <div className="absolute right-4 top-1/2 w-4 h-4 rounded-full bg-[#0F4B70] border-2 border-[#C4F8FF]/50 shadow-sm shadow-[#C4F8FF]/20" />

              <div className="text-center mb-6 mt-4">
                <div className="inline-flex items-center justify-center p-3 bg-[#0F4B70]/50 rounded-full border border-[#C4F8FF]/20 mb-3 shadow-[0_0_20px_rgba(196,248,255,0.15)]">
                  <Key className="text-[#C4F8FF]" size={20} />
                </div>
                <h2 className="text-[#C4F8FF] font-black text-xl mb-1">{t('loginTitle') || 'Welcome Home'}</h2>
                <p className="text-[#C4F8FF]/60 text-xs">Unlock your digital portal</p>
              </div>

              {/* Role Toggle inside the door */}
              <div className="flex bg-[#0F4B70]/30 rounded-xl p-1 mb-6 border border-[#C4F8FF]/15">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    role === 'citizen'
                      ? 'bg-[#C4F8FF]/10 text-[#C4F8FF] shadow-sm border border-[#C4F8FF]/20'
                      : 'text-[#C4F8FF]/50 hover:text-[#C4F8FF]/80'
                  }`}
                >
                  <UserCircle size={16} />
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    role === 'admin'
                      ? 'bg-[#C4F8FF]/10 text-[#C4F8FF] shadow-sm border border-[#C4F8FF]/20'
                      : 'text-[#C4F8FF]/50 hover:text-[#C4F8FF]/80'
                  }`}
                >
                  <ShieldCheck size={16} />
                  Admin
                </button>
              </div>
              
              {error && (
                <div className="bg-[#C4F8FF]/10 border border-orange-400/30 text-orange-400 px-3 py-2 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 flex-1">
                <div>
                  <label htmlFor="identifier" className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1.5">
                    {t('email') || 'Email Address'}
                  </label>
                  <input
                    id="identifier"
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full border border-[#C4F8FF]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1.5">
                    {t('password') || 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-[#C4F8FF]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all pr-10"
                      placeholder="Enter your key"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#C4F8FF]/50 hover:text-[#C4F8FF] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-[#C4F8FF]/30 bg-[#0F4B70]/40 text-[#C4F8FF] focus:ring-[#C4F8FF]/50"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-[#C4F8FF]/70 font-medium">
                      {t('rememberMe') || 'Remember Key'}
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-lg shadow-black/20 flex justify-center items-center gap-2 mt-2 transition-all disabled:opacity-50 group"
                >
                  <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                  {loading ? 'Unlocking...' : 'Unlock Portal'}
                </button>
              </form>
           </div>

           {/* Right Window (Decorative) */}
           <div className="hidden md:flex flex-col w-32 h-48 bg-[#061926] border-[6px] border-[#0a344f] rounded-t-full shadow-inner relative overflow-hidden justify-center items-center group">
              <div className="absolute inset-0 border-t-[6px] border-b-[6px] border-[#0a344f] top-1/2 -translate-y-1/2 z-10" />
              <div className="absolute inset-0 border-l-[6px] border-r-[6px] border-[#0a344f] left-1/2 -translate-x-1/2 z-10" />
              <div className="absolute inset-0 bg-[#C4F8FF]/5 group-hover:bg-[#C4F8FF]/20 transition-colors duration-700" />
              <UserCircle className="text-[#C4F8FF]/30 z-0" size={40} />
           </div>
        </div>
        
        {/* Base / Porch */}
        <div className="w-full max-w-4xl h-4 bg-[#0a344f] rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)]"></div>
        <div className="w-[90%] max-w-3xl h-3 bg-[#061926] mx-auto mt-1 rounded-b-xl border border-[#0a344f]"></div>

        {/* Footer info & Sandbox bypass outside the house */}
        <div className="w-full max-w-2xl mt-10 space-y-6">
          <div className="text-center text-xs text-[#C4F8FF]/60 font-medium">
            {t('newToGram') || 'Don\'t have a key?'} {' '}
            <Link to="/signup" className="font-extrabold text-[#C4F8FF] hover:underline tracking-wide">
              {t('registerHere') || 'Build yours here'}
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
