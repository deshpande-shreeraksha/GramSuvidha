import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Activity, UserCircle, ShieldCheck, Key, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SignUp = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    gender: '',
    village: '',
    villageId: '',
  });
  const [villages, setVillages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('fill_form'); // 'fill_form' | 'verify_otp'
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await fetch('/api/auth/villages');
        if (res.ok) {
          const data = await res.json();
          setVillages(data);
          if (data.length > 0 && !formData.village) {
            setFormData(prev => ({
              ...prev,
              village: data[0].name,
              villageId: data[0].id
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching villages:', err);
      }
    };
    fetchVillages();
  }, []);

  const validatePassword = (password) => {
    // > 6 characters, numbers, special characters, underscore, one capital letter
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+_]).{7,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.phone.length !== 10 || isNaN(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be >6 chars, include a number, special character, underscore, and one capital letter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep('verify_otp');
        setOtpMessage('Verification OTP sent successfully!');
      } else {
        setError(data.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6 || isNaN(otp)) {
      setError('OTP must be a 6-digit number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          age: Number(formData.age),
          role: formData.role,
          gender: formData.gender,
          village: formData.village,
          villageId: formData.villageId,
          otp: otp,
        }),
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
        } else {
          navigate('/citizen/home');
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setOtpMessage('');
    setResending(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOtpMessage('A new verification code has been sent!');
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Network error. Failed to resend.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061926] flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden">
      
      {/* House Structure */}
      <div className="w-full max-w-4xl flex flex-col items-center mt-4">
        
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
        <div className="w-full max-w-3xl bg-[#0F4B70] border-x-[12px] border-b-[16px] border-[#0a344f] relative px-4 md:px-12 pt-12 pb-0 shadow-2xl rounded-b-xl flex gap-6 md:gap-12 justify-center items-end min-h-[500px]">
           
           {/* Left Window (Decorative) */}
           <div className="hidden md:flex flex-col w-32 h-48 bg-[#061926] border-[6px] border-[#0a344f] rounded-t-full shadow-inner relative overflow-hidden justify-center items-center group">
              <div className="absolute inset-0 border-t-[6px] border-b-[6px] border-[#0a344f] top-1/2 -translate-y-1/2 z-10" />
              <div className="absolute inset-0 border-l-[6px] border-r-[6px] border-[#0a344f] left-1/2 -translate-x-1/2 z-10" />
              <div className="absolute inset-0 bg-[#C4F8FF]/5 group-hover:bg-[#C4F8FF]/20 transition-colors duration-700" />
              <UserPlus className="text-[#C4F8FF]/30 z-0" size={40} />
           </div>

           {/* The Door (Registration Form / OTP verification) */}
           <div className="w-full max-w-md bg-[#061926] border-t-[12px] border-x-[12px] border-b-0 border-[#0a344f] rounded-t-[40px] relative z-20 p-6 md:p-8 shadow-2xl flex flex-col justify-end min-h-[520px]">
              {/* Doorknob */}
              <div className="absolute right-4 top-1/2 w-4 h-4 rounded-full bg-[#0F4B70] border-2 border-[#C4F8FF]/50 shadow-sm shadow-[#C4F8FF]/20" />

              {error && (
                <div className="bg-[#C4F8FF]/10 border border-orange-400/30 text-orange-400 px-3 py-2 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                  {error}
                </div>
              )}
              {otpMessage && (
                <div className="bg-[#C4F8FF]/10 border border-green-400/30 text-green-400 px-3 py-2 rounded-lg mb-4 text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  {otpMessage}
                </div>
              )}

              {step === 'verify_otp' ? (
                <div>
                  <div className="text-center mb-6 mt-4">
                    <div className="inline-flex items-center justify-center p-3 bg-[#0F4B70]/50 rounded-full border border-[#C4F8FF]/20 mb-3 shadow-[0_0_20px_rgba(196,248,255,0.15)]">
                      <Mail className="text-[#C4F8FF]" size={20} />
                    </div>
                    <h2 className="text-[#C4F8FF] font-black text-xl mb-1">Verify Your Key</h2>
                    <p className="text-[#C4F8FF]/60 text-xs">Unlock your newly built digital key</p>
                    <p className="text-[11px] text-[#C4F8FF]/50 mt-3 break-all px-2 text-center">
                      A verification code has been sent to:<br/>
                      <strong className="text-[#C4F8FF] font-bold">{formData.email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-2 text-center">
                        Enter 6-Digit OTP
                      </label>
                      <input 
                        type="text" 
                        maxLength="6"
                        required 
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-2xl font-bold border border-[#C4F8FF]/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/20 placeholder:tracking-normal placeholder:font-normal placeholder:text-center placeholder:text-xs" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-lg shadow-black/20 flex justify-center items-center gap-2 mt-6 transition-all disabled:opacity-50 group"
                    >
                      <Key size={18} className="group-hover:rotate-12 transition-transform" />
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col items-center gap-3 text-xs font-semibold">
                    <button 
                      onClick={handleResendOTP} 
                      disabled={resending}
                      className="text-[#C4F8FF] hover:underline disabled:opacity-50"
                    >
                      {resending ? 'Resending Key...' : 'Resend Verification Code'}
                    </button>
                    <button 
                      onClick={() => {
                        setStep('fill_form');
                        setError('');
                        setOtpMessage('');
                      }}
                      className="text-[#C4F8FF]/50 hover:text-[#C4F8FF] transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      Back to registration
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6 mt-4">
                    <div className="inline-flex items-center justify-center p-3 bg-[#0F4B70]/50 rounded-full border border-[#C4F8FF]/20 mb-3 shadow-[0_0_20px_rgba(196,248,255,0.15)]">
                      <UserPlus className="text-[#C4F8FF]" size={20} />
                    </div>
                    <h2 className="text-[#C4F8FF] font-black text-xl mb-1">{t('signupTitle') || 'Create Account'}</h2>
                    <p className="text-[#C4F8FF]/60 text-xs">Build your digital connection</p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3">
                    
                    {/* Role Selection Toggle */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1.5">
                        {t('regType') || 'Registration Type'}
                      </label>
                      <div className="flex bg-[#0F4B70]/30 rounded-xl p-1 border border-[#C4F8FF]/15">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'citizen' }))}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
                            formData.role === 'citizen'
                              ? 'bg-[#C4F8FF]/10 text-[#C4F8FF] shadow-sm border border-[#C4F8FF]/20'
                              : 'text-[#C4F8FF]/50 hover:text-[#C4F8FF]/80'
                          }`}
                        >
                          <UserCircle size={15} />
                          Citizen
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
                            formData.role === 'admin'
                              ? 'bg-[#C4F8FF]/10 text-[#C4F8FF] shadow-sm border border-[#C4F8FF]/20'
                              : 'text-[#C4F8FF]/50 hover:text-[#C4F8FF]/80'
                          }`}
                        >
                          <ShieldCheck size={15} />
                          Admin
                        </button>
                      </div>
                    </div>

                    {formData.role === 'admin' && (
                      <div className="bg-orange-400/10 border border-orange-400/30 p-3 rounded-xl">
                        <label className="block text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-1">
                          {t('villageId') || 'Official Panchayat / Village ID'}
                        </label>
                        <input 
                          type="text" 
                          name="villageId" 
                          required 
                          value={formData.villageId}
                          onChange={handleChange}
                          className="w-full border border-orange-400/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-[#0F4B70]/15 text-orange-400 placeholder:text-orange-400/30 transition-all font-bold" 
                          placeholder="e.g. VIL-10293" 
                        />
                        <p className="text-[9px] text-orange-400/70 font-bold mt-1">Required for admin verification.</p>
                      </div>
                    )}

                    {/* First & Last Name */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('firstName') || 'First Name'}
                        </label>
                        <input 
                          type="text" 
                          name="firstName" 
                          required 
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="Raj" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('lastName') || 'Last Name'}
                        </label>
                        <input 
                          type="text" 
                          name="lastName" 
                          required 
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="Kumar" 
                        />
                      </div>
                    </div>

                    {/* Age & Mobile */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('age') || 'Age'}
                        </label>
                        <input 
                          type="number" 
                          name="age" 
                          required 
                          min="1"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="30" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('phone') || 'Mobile Number'}
                        </label>
                        <input 
                          type="tel" 
                          name="phone" 
                          required 
                          maxLength="10"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="10 digits" 
                        />
                      </div>
                    </div>

                    {/* Village Name (if citizen) */}
                    {formData.role === 'citizen' && (
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('village') || 'Village'}
                        </label>
                        <select
                          name="village"
                          required
                          value={formData.village}
                          onChange={(e) => {
                            const selectedName = e.target.value;
                            const selectedObj = villages.find(v => v.name === selectedName);
                            setFormData(prev => ({
                              ...prev,
                              village: selectedName,
                              villageId: selectedObj ? selectedObj.id : ''
                            }));
                          }}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all [&>option]:bg-[#061926] [&>option]:text-[#C4F8FF]"
                        >
                          <option value="" disabled>Select Village</option>
                          {villages.map((v, i) => (
                            <option key={i} value={v.name}>{v.name} ({v.id})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Email & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('email') || 'Email Address'}
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all font-sans" 
                          placeholder="raj.kumar@example.com" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('gender') || 'Gender'}
                        </label>
                        <select 
                          name="gender" 
                          required 
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all [&>option]:bg-[#061926] [&>option]:text-[#C4F8FF]" 
                        >
                          <option value="" disabled>Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('password') || 'Password'}
                        </label>
                        <input 
                          type="password" 
                          name="password" 
                          required 
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="Create password" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#C4F8FF]/70 uppercase tracking-widest mb-1">
                          {t('confirmPass') || 'Confirm Password'}
                        </label>
                        <input 
                          type="password" 
                          name="confirmPassword" 
                          required 
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full border border-[#C4F8FF]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C4F8FF] focus:ring-1 focus:ring-[#C4F8FF] bg-[#0F4B70]/20 text-[#C4F8FF] placeholder:text-[#C4F8FF]/30 transition-all" 
                          placeholder="Confirm password" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3 bg-[#0F4B70] text-[#C4F8FF] border border-[#C4F8FF]/30 rounded-xl font-bold hover:bg-[#C4F8FF]/10 shadow-lg shadow-black/20 flex justify-center items-center gap-2 mt-4 transition-all disabled:opacity-50 group"
                    >
                      <UserPlus size={16} className="group-hover:translate-x-1 transition-transform" />
                      {loading ? 'Sending Code...' : 'Register Now'}
                    </button>
                  </form>
                </div>
              )}
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

        {/* Footer info & Link back to login */}
        <div className="w-full max-w-2xl mt-10 mb-8 text-center text-xs text-[#C4F8FF]/60 font-medium">
          {t('alreadyReg') || 'Already registered?'} {' '}
          <Link to="/login" className="font-extrabold text-[#C4F8FF] hover:underline tracking-wide">
            {t('loginHere') || 'Login Here'}
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default SignUp;
