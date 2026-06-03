import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, Users, Droplets, Lightbulb, Trash2, FileSpreadsheet, Activity, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import GramSuvidhaAnimatedLogo from '../components/GramSuvidhaAnimatedLogo';

// React wrapper component to animate sections on mount
const AnimateSection = ({ children, delay = 0, className = "" }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-1000 ease-out transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// React component to animate buttons dynamically (Strictly using #C4F8FF and #0F4B70)
const AnimatedButton = ({ onClick, children, className = "", secondary = false }) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={`relative overflow-hidden px-8 py-4 font-black rounded-2xl transition-all duration-300 transform border flex items-center justify-center gap-2.5 text-xs uppercase tracking-widest ${
        secondary
          ? 'bg-transparent border-[#C4F8FF]/40 text-[#C4F8FF] hover:bg-[#0F4B70]/40 hover:border-[#C4F8FF]'
          : 'bg-[#0F4B70] border-[#0F4B70] text-[#C4F8FF] hover:bg-[#0a344f] hover:border-[#0a344f]'
      } ${hovered ? 'scale-105 -translate-y-0.5' : 'scale-100'} ${pressed ? 'scale-95' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isCitizen = token && role === 'citizen';

  useEffect(() => {
    if (token) {
      if (role === 'admin') {
        navigate('/admin/home');
      } else if (role === 'citizen') {
        navigate('/citizen/home');
      }
    }
  }, [token, role, navigate]);

  const handleDashboardRedirect = () => {
    if (isCitizen) {
      navigate('/citizen/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleReportRedirect = () => {
    if (isCitizen) {
      navigate('/citizen/complaint');
    } else {
      navigate('/login');
    }
  };

  const handleCategoryClick = (categoryKey) => {
    if (categoryKey === 'scheme') {
      if (token) {
        navigate('/citizen/schemes');
      } else {
        navigate('/login', { state: { redirect: '/citizen/schemes' } });
      }
      return;
    }

    let mappedCategory = 'water_leakage';
    if (categoryKey === 'power') {
      mappedCategory = 'electricity_issue';
    } else if (categoryKey === 'road') {
      mappedCategory = 'road_damage';
    }

    if (token) {
      navigate('/citizen/complaint', { state: { category: mappedCategory } });
    } else {
      navigate('/login', { state: { redirect: '/citizen/complaint', category: mappedCategory } });
    }
  };

  return (
    <div className="min-h-screen relative text-[#C4F8FF] font-sans overflow-x-hidden bg-gradient-to-br from-[#061926] via-[#0F4B70] to-[#061926] flex flex-col justify-between selection:bg-[#C4F8FF] selection:text-[#0F4B70]">
      
      {/* Decorative Interactive Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-bl-full bg-gradient-to-bl from-[#C4F8FF]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-tr-full bg-gradient-to-tr from-[#0F4B70]/40 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C4F8FF]/10 rounded-xl flex items-center justify-center border border-[#C4F8FF]/25">
              <Activity className="text-[#C4F8FF]" size={20} />
            </div>
            <span className="font-display font-black text-xl text-[#C4F8FF] tracking-wide">GRAMSUVIDHA</span>
          </div>

          <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-[#C4F8FF]/70">
            {!isCitizen ? (
              <>
                <a href="#features" className="hover:text-white transition-colors">{t('features')}</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">{t('howItWorks')}</a>
                <a href="#community" className="hover:text-white transition-colors">{t('community')}</a>
              </>
            ) : (
              <>
                <Link to="/citizen/complaint" className="hover:text-white transition-colors">{t('reportComplaint')}</Link>
                <Link to="/citizen/schemes" className="hover:text-white transition-colors">{t('schemes')}</Link>
                <Link to="/citizen/profile" className="hover:text-white transition-colors">{t('profile')}</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden lg:inline-flex items-center gap-2 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 bg-[#C4F8FF]/10 text-[#C4F8FF] rounded-full border border-[#C4F8FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4F8FF] animate-pulse"></span> {t('activeStatus')}
            </span>
            {token && (
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-[#C4F8FF]/75 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors mr-2"
              >
                {t('logout')}
              </button>
            )}
            <button 
              onClick={handleDashboardRedirect}
              className="bg-[#0F4B70] hover:bg-[#0a344f] text-[#C4F8FF] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-[#C4F8FF] hover:border-[#0a344f]"
            >
              {isCitizen ? t('dashboard') : t('login')} <ArrowRight size={14} />
            </button>
          </div>
        </header>

        {/* Hero Area */}
        <section className="container mx-auto px-6 pt-12 pb-16 text-center relative flex flex-col items-center justify-center">
          
          {/* Animated Logo (Hero Focus) */}
          <AnimateSection delay={150} className="w-full">
            <GramSuvidhaAnimatedLogo />
          </AnimateSection>

          {/* Tagline */}
          <AnimateSection delay={3100} className="max-w-2xl mt-6">
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#C4F8FF]/20 bg-[#0F4B70]/30 backdrop-blur-sm text-xs font-black uppercase tracking-widest text-[#C4F8FF] mb-4">
              {t('smartPortal')}
            </div>
            <p className="text-[#C4F8FF]/90 text-sm md:text-base leading-relaxed font-medium">
              {t("Empowering Indian villages through automated AI complaint routing, secure tax calculation simulators, and digital scheme catalog audits.")}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <AnimatedButton onClick={handleReportRedirect}>
                {t('btnReport')} <ArrowRight size={18} />
              </AnimatedButton>
              <AnimatedButton onClick={handleDashboardRedirect} secondary>
                {t("Access Dashboard")}
              </AnimatedButton>
            </div>
          </AnimateSection>
        </section>

        {/* Quick Portal Gateway (Citizen vs Admin) */}
        <section className="container mx-auto px-6 py-12 max-w-5xl">
          <AnimateSection delay={3400} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Citizen Gateway */}
            <div 
              onClick={() => handleCategoryClick('scheme')}
              className="bg-[#0F4B70]/30 p-8 rounded-3xl border border-[#C4F8FF]/20 shadow-lg hover:border-[#C4F8FF]/60 hover:bg-[#0F4B70]/50 hover:-translate-y-1 transform transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center mb-6">
                  <Globe size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#C4F8FF] mb-2">{t("Citizen Services")}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">
                  {t("Apply for state welfare schemes, register complaints with maps coordinates, track status timeline, and pay local property taxes online.")}
                </p>
              </div>
              <span className="text-xs font-bold text-[#C4F8FF] flex items-center gap-1.5 mt-6 group hover:text-white transition-colors">
                {t("Enter Citizen Portal")} &rarr;
              </span>
            </div>

            {/* Admin Gateway */}
            <div 
              onClick={() => navigate('/login')}
              className="bg-[#0F4B70]/30 p-8 rounded-3xl border border-[#C4F8FF]/20 shadow-lg hover:border-[#C4F8FF]/60 hover:bg-[#0F4B70]/50 hover:-translate-y-1 transform transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center mb-6">
                  <Lock size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#C4F8FF] mb-2">{t("Panchayat Administration")}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">
                  {t("Log in as Sarpanch or Panchayat Officer to review budgets, monitor community notices, orchestrate field forces, and resolve reports.")}
                </p>
              </div>
              <span className="text-xs font-bold text-[#C4F8FF] flex items-center gap-1.5 mt-6 hover:text-white transition-colors">
                {t("Officer Login Panel")} &rarr;
              </span>
            </div>
          </AnimateSection>
        </section>

        {/* Categories Section */}
        <section className="bg-[#0F4B70]/20 py-20 border-t border-[#C4F8FF]/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#C4F8FF] tracking-tight mb-2">{t("Explore Portal Services")}</h2>
            <p className="text-[#C4F8FF]/65 max-w-md mx-auto mb-12 text-xs font-semibold uppercase tracking-wider">{t('categoriesDesc')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category cards */}
              <div 
                onClick={() => handleCategoryClick('water')}
                className="bg-[#0f2a3f] p-8 rounded-2xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 hover:shadow-xl transition-all duration-300 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C4F8FF]/10 flex items-center justify-center text-[#C4F8FF] mb-6 group-hover:scale-110 transition-transform">
                  <Droplets size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2 group-hover:text-white transition-colors">{t('waterTitle')}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t('waterDesc')}</p>
              </div>

              <div 
                onClick={() => handleCategoryClick('power')}
                className="bg-[#0f2a3f] p-8 rounded-2xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 hover:shadow-xl transition-all duration-300 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C4F8FF]/10 flex items-center justify-center text-[#C4F8FF] mb-6 group-hover:scale-110 transition-transform">
                  <Lightbulb size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2 group-hover:text-white transition-colors">{t('lightTitle')}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t('lightDesc')}</p>
              </div>

              <div 
                onClick={() => handleCategoryClick('road')}
                className="bg-[#0f2a3f] p-8 rounded-2xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 hover:shadow-xl transition-all duration-300 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C4F8FF]/10 flex items-center justify-center text-[#C4F8FF] mb-6 group-hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2 group-hover:text-white transition-colors">{t('roadTitle')}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t('roadDesc')}</p>
              </div>

              <div 
                onClick={() => handleCategoryClick('scheme')}
                className="bg-[#0f2a3f] p-8 rounded-2xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 hover:shadow-xl transition-all duration-300 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C4F8FF]/10 flex items-center justify-center text-[#C4F8FF] mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2 group-hover:text-white transition-colors">{t('schemeTitle')}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t('schemeDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section id="features" className="bg-[#0F4B70]/10 py-20 border-t border-[#C4F8FF]/10 relative z-10 scroll-mt-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[10px] font-extrabold text-[#C4F8FF] tracking-widest uppercase bg-[#C4F8FF]/10 px-3 py-1 rounded-full border border-[#C4F8FF]/20">{t("System Features")}</span>
              <h2 className="text-3xl font-display font-bold text-[#C4F8FF] mt-4">{t("Panchayat Empowerment Through Innovation")}</h2>
              <p className="text-[#C4F8FF]/70 max-w-md mx-auto mt-4 text-xs font-semibold uppercase tracking-wider">{t("Automated operations for seamless administration.")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#0f2a3f] p-8 rounded-3xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center mb-6">
                  <Activity size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#C4F8FF] mb-3">{t("AI Departmental Routing")}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Incoming grievances are analyzed by our local Natural Language Processing (NLP) microservice. The text is parsed to determine category validity, auto-detect severity, and allocate to respective local departments instantly.")}</p>
              </div>

              <div className="bg-[#0f2a3f] p-8 rounded-3xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center mb-6">
                  <MapPin size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#C4F8FF] mb-3">{t("Precision Geocoding Maps")}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Integrated with OpenStreetMap and reverse geocoding APIs. Citizens pin issue spots directly on village maps, converting coordinates to verified address strings so workers locate them with zero confusion.")}</p>
              </div>

              <div className="bg-[#0f2a3f] p-8 rounded-3xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center mb-6">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-[#C4F8FF] mb-3">{t("Secure Digital Tax Portal")}</h3>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Brings local revenue collection into the digital age. Allows self-assessment of properties and implements legal Gram Panchayat tax calculations based on construction types, area, and official cess components.")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed How It Works Section */}
        <section id="how-it-works" className="py-20 border-t border-[#C4F8FF]/10 relative z-10 scroll-mt-16 bg-[#0F4B70]/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[10px] font-extrabold text-[#C4F8FF] tracking-widest uppercase bg-[#C4F8FF]/10 px-3 py-1 rounded-full border border-[#C4F8FF]/20">{t("Operational Flow")}</span>
              <h2 className="text-3xl font-display font-bold text-[#C4F8FF] mt-4">{t("Simple, Transparent Lifecycle")}</h2>
              <p className="text-[#C4F8FF]/70 max-w-md mx-auto mt-4 text-xs font-semibold uppercase tracking-wider">{t("Four simple steps connecting citizens and sarpanch.")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
              <div className="flex flex-col items-center text-center p-6 bg-[#0f2a3f] rounded-3xl border border-[#C4F8FF]/15 shadow-sm hover:border-[#C4F8FF]/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C4F8FF] text-[#0F4B70] font-bold text-sm flex items-center justify-center mb-6 shadow-md shadow-[#C4F8FF]/15">1</div>
                <h4 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("Onboard Securely")}</h4>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Sign up using your mobile number and email. Authenticate your registration through Nodemailer SMTP OTP verification to prevent fake spam accounts.")}</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-[#0f2a3f] rounded-3xl border border-[#C4F8FF]/15 shadow-sm hover:border-[#C4F8FF]/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C4F8FF] text-[#0F4B70] font-bold text-sm flex items-center justify-center mb-6 shadow-md shadow-[#C4F8FF]/15">2</div>
                <h4 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("File or Pay")}</h4>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Submit your complaints with photos, apply for welfare schemes, or calculate and pay annual property taxes instantly through our digital payment simulator.")}</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-[#0f2a3f] rounded-3xl border border-[#C4F8FF]/15 shadow-sm hover:border-[#C4F8FF]/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C4F8FF] text-[#0F4B70] font-bold text-sm flex items-center justify-center mb-6 shadow-md shadow-[#C4F8FF]/15">3</div>
                <h4 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("Orchestration")}</h4>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Admins review submissions, allocate budgets, and dispatch designated field workers. Real-time notifications keep citizens informed about changes.")}</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-[#0f2a3f] rounded-3xl border border-[#C4F8FF]/15 shadow-sm hover:border-[#C4F8FF]/40 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#C4F8FF] text-[#0F4B70] font-bold text-sm flex items-center justify-center mb-6 shadow-md shadow-[#C4F8FF]/15">4</div>
                <h4 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("Track & Audit")}</h4>
                <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Use your unique Complaint ID or Scheme ID to track progress stages live on your dashboard and download official receipts for your permanent records.")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Community Section */}
        <section id="community" className="bg-[#0F4B70]/10 py-20 border-t border-[#C4F8FF]/10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[10px] font-extrabold text-[#C4F8FF] tracking-widest uppercase bg-[#C4F8FF]/10 px-3 py-1 rounded-full border border-[#C4F8FF]/20">{t("Panchayat Community")}</span>
              <h2 className="text-3xl font-display font-bold text-[#C4F8FF] mt-4">{t("Participatory Rural Governance")}</h2>
              <p className="text-[#C4F8FF]/70 max-w-md mx-auto mt-4 text-xs font-semibold uppercase tracking-wider">{t("Fostering collaboration across village lines.")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#0f2a3f] p-8 rounded-3xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 transition-colors flex gap-6 items-start">
                <div className="w-10 h-10 rounded-2xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center flex-shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("Collaborative Action")}</h3>
                  <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Empower local village committees and youth associations by registering them as authorized field workers. Workers resolve community reports and provide digital photo proof of completed works.")}</p>
                </div>
              </div>

              <div className="bg-[#0f2a3f] p-8 rounded-3xl border border-[#C4F8FF]/15 hover:border-[#C4F8FF]/40 transition-colors flex gap-6 items-start">
                <div className="w-10 h-10 rounded-2xl bg-[#C4F8FF]/10 text-[#C4F8FF] flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#C4F8FF] mb-2">{t("Financial Transparency")}</h3>
                  <p className="text-[#C4F8FF]/70 text-xs leading-relaxed">{t("Tax payments made by citizens directly fund local development. We enable citizens to review the Gram Panchayat's annual budget allocation on demand, assuring public funds are spent correctly.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#061926]/40 backdrop-blur-sm border-t border-[#C4F8FF]/10 py-10 text-center text-[#C4F8FF]/40 text-[10px] font-extrabold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} GRAMSUVIDHA - SMART GRAM PANCHAYAT INITIATIVE. ALL RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
