import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ShieldAlert, Activity, Menu, X, PlusCircle, Clock, MapPin, Briefcase, Home, ChevronLeft, ChevronRight, CreditCard, DollarSign, Calendar, Megaphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const displayName = storedUser.name || (role === 'admin' ? t('sysAdmin') : t('citizen'));
  const displaySub = storedUser.village || storedUser.villageId || (role === 'admin' ? t('sysAdmin') : t('citizen'));

  const adminLinks = [
    { name: t('home'), path: '/admin/home', icon: <Home size={20} /> },
    { name: t('systemOverview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('fieldWorkers'), path: '/admin/workers', icon: <Users size={20} /> },
    { name: t('complaintsMgmt'), path: '/admin/complaints', icon: <FileText size={20} /> },
    { name: t('schemes'), path: '/admin/schemes', icon: <Briefcase size={20} /> },
    { name: t('taxes'), path: '/admin/taxes', icon: <CreditCard size={20} /> },
    { name: t('budget'), path: '/admin/budget', icon: <DollarSign size={20} /> },
    { name: t('meetings'), path: '/admin/meetings', icon: <Calendar size={20} /> },
    { name: t('broadcasts'), path: '/admin/broadcasts', icon: <Megaphone size={20} /> },
  ];

  const citizenLinks = [
    { name: t('home'), path: '/citizen/home', icon: <Home size={20} /> },
    { name: t('dashboard'), path: '/citizen/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('reportComplaint'), path: '/citizen/complaint', icon: <PlusCircle size={20} /> },
    { name: t('schemes'), path: '/citizen/schemes', icon: <Briefcase size={20} /> },
    { name: t('taxes'), path: '/citizen/taxes', icon: <CreditCard size={20} /> },
    { name: t('budget'), path: '/citizen/budget', icon: <DollarSign size={20} /> },
    { name: t('meetings'), path: '/citizen/meetings', icon: <Calendar size={20} /> },
    { name: t('broadcasts'), path: '/citizen/broadcasts', icon: <Megaphone size={20} /> },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-[#061926] border-r border-[#C4F8FF]/10 transform transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} lg:static ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-[#C4F8FF]/10 bg-[#0F4B70]/30 backdrop-blur-md`}>
          <div className="flex items-center gap-2 text-[#C4F8FF] font-bold text-xl tracking-wide font-display">
            <Activity className="text-[#C4F8FF] flex-shrink-0" />
            {!isCollapsed && <span className="animate-fade-in">GRAMSUVIDHA</span>}
          </div>
          {!isCollapsed && (
            <button className="lg:hidden text-[#C4F8FF]/70 hover:text-white" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);
            return (
              <NavLink
                key={link.name}
                to={link.path}
                title={isCollapsed ? link.name : ''}
                onClick={() => setIsOpen(false)}
                className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#0F4B70] text-[#C4F8FF] shadow-md shadow-[#C4F8FF]/10 border border-[#C4F8FF]/30' 
                    : 'text-[#C4F8FF]/70 hover:bg-[#C4F8FF]/10 hover:text-white border border-transparent'
                }`}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {!isCollapsed && <span className="font-medium animate-fade-in text-sm leading-tight max-w-[160px]">{link.name}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#C4F8FF]/10 flex flex-col gap-4 bg-[#0F4B70]/10">
          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-[#C4F8FF]/50 hover:text-[#C4F8FF] hover:bg-[#C4F8FF]/10 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
