import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, LogOut, Check, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const notificationsRef = useRef(null);
  const bellRef = useRef(null);

  // Close sidebars and notifications on route change
  useEffect(() => {
    setShowNotifications(false);
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // ✅ FIXED: fetchNotifications defined before useEffect using useCallback
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching live notifications:', err);
    }
  }, [token, navigate]);

  // ✅ FIXED: useEffect is now at top level, BEFORE any conditional returns
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 8000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (noteId) => {
    try {
      const response = await fetch(`/api/notifications/${noteId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n._id === noteId ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error reading notification:', err);
    }
  };

  // ✅ FIXED: Conditional returns now come AFTER all hooks
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'citizen') {
      return <Navigate to="/citizen/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-[#061926] font-sans text-[#C4F8FF]">
      <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0F4B70]/30 backdrop-blur-md border-b border-[#C4F8FF]/10 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[#C4F8FF]/70 hover:text-white"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open Sidebar"
            >
              <Menu size={24} />
            </button>
            
            {/* Live Panchayat Clock */}
            <div className="hidden md:flex flex-col text-xs text-[#C4F8FF]/70 font-bold bg-[#0F4B70]/50 border border-[#C4F8FF]/20 rounded-xl px-3.5 py-1.5 shadow-sm">
              <span className="text-[#C4F8FF] flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 bg-[#C4F8FF] rounded-full animate-ping" />
                {(() => {
                  const getLocale = (lang) => {
                    if (lang === 'kn') return 'kn-IN';
                    if (lang === 'hi') return 'hi-IN';
                    return 'en-IN';
                  };
                  const activeLocale = getLocale(language);
                  const formatArabicNumberString = (str) => {
                    if (typeof str !== 'string') return str;
                    const mapping = {
                      '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
                      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
                    };
                    return str.split('').map(char => mapping[char] || char).join('');
                  };
                  const timeStr = currentTime.toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return formatArabicNumberString(timeStr);
                })()}
              </span>
              <span className="text-[9px] text-[#C4F8FF]/50 font-semibold mt-0.5">
                {(() => {
                  const getLocale = (lang) => {
                    if (lang === 'kn') return 'kn-IN';
                    if (lang === 'hi') return 'hi-IN';
                    return 'en-IN';
                  };
                  const activeLocale = getLocale(language);
                  const formatArabicNumberString = (str) => {
                    if (typeof str !== 'string') return str;
                    const mapping = {
                      '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
                      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
                    };
                    return str.split('').map(char => mapping[char] || char).join('');
                  };
                  const dateStr = currentTime.toLocaleDateString(activeLocale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                  return formatArabicNumberString(dateStr);
                })()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              ref={bellRef}
              className="relative p-2 text-[#C4F8FF]/70 hover:bg-[#C4F8FF]/10 rounded-full transition-colors"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white font-bold text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                ref={notificationsRef}
                className="fixed top-16 left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 sm:w-80 bg-[#07253b]/95 backdrop-blur-md border border-[#C4F8FF]/20 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden text-[#C4F8FF]">
                <div className="px-4 py-3 border-b border-[#C4F8FF]/20 bg-[#0F4B70]/40">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#C4F8FF] tracking-wide">{t('Live Community Alerts')}</h3>
                    <button
                      className="text-xs text-[#C4F8FF]/60 hover:text-white font-bold transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      {t('Close')}
                    </button>
                  </div>
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y divide-[#C4F8FF]/10 bg-[#061926]/30">
                  {notifications.length > 0 ? (
                    notifications.map((note) => (
                      <div 
                        key={note._id} 
                        className={`px-4 py-3 hover:bg-[#0F4B70]/30 transition-colors relative flex flex-col justify-between gap-2 ${
                          !note.read ? 'bg-[#0F4B70]/15 border-l-2 border-[#C4F8FF]' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-[#C4F8FF] leading-tight">{note.title}</p>
                            {!note.read && (
                              <button 
                                onClick={() => handleMarkAsRead(note._id)}
                                className="text-[10px] text-[#C4F8FF] hover:text-white font-extrabold flex items-center gap-0.5 border border-[#C4F8FF]/30 bg-[#0F4B70]/40 hover:bg-[#0F4B70]/60 rounded px-1.5 py-0.5 transition-colors"
                                title={t('Mark as read')}
                              >
                                <Check size={10} /> {t('Read')}
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-[#C4F8FF]/80 mt-1 leading-normal">{note.message}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-[#C4F8FF]/50 font-bold uppercase">
                            {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : t('Just now')}
                          </span>
                          {note.read && (
                            <span className="text-[8px] text-green-400 font-extrabold flex items-center gap-0.5 uppercase">
                              <CheckCircle2 size={10} /> {t('Acknowledged')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-[#C4F8FF]/50 font-semibold bg-[#061926]/10">
                      {t('No notifications yet')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-[#C4F8FF]/20"></div>
            <button 
              className="flex items-center gap-2 text-sm font-bold text-[#C4F8FF]/70 hover:text-red-400 transition-colors"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('Logout')}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#061926] via-[#0F4B70]/20 to-[#061926] p-4 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
