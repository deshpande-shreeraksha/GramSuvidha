import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Header & Landing
    features: "Features",
    howItWorks: "How it Works",
    community: "Community",
    reportComplaint: "Register Complaint",
    schemes: "Schemes",
    profile: "Profile",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    heroTitleLight: "Empowering",
    heroTitleMiddle: " Gram Panchayats.",
    heroTitleBlue: "Revitalizing",
    heroTitleEnd: " Villages.",
    heroDesc: "A dedicated digital workspace for rural communities to report civic issues like broken streetlights, water supply shortages, and sanitation problems, enabling smooth Gram Panchayat workflows.",
    btnReport: "File Village Complaint",
    activeStatus: "LIVE",
    precisionTitle: "Smarter Governance for",
    precisionField: "Our Villages.",
    precisionDesc: "Our platform maps rural civic grievances using exact GPS coordinate tags and photo uploads, routing tasks directly to Gram Panchayat field workers for transparent and fast resolutions.",
    evidenceLabel: "Verifiable Public Works",
    accuracyLabel: "Panchayat Response Time",
    monitoringLabel: "PANCHAYAT WORKFLOW",
    smartPortal: "Smart Gram Panchayat Portal",
    unifiedEco: "Unified Rural",
    ecosystem: "Ecosystem.",
    reportingTitle: "VILLAGE REPORTING",
    reportingDesc: "Submit localized water leaks, road damages, power cuts, or waste dump issues with live photo proof.",
    adminTitle: "PANCHAYAT ORCHESTRATION",
    adminDesc: "Panchayat admins and Sarpanch approve complaints, allocate budgets, and dispatch workers.",
    volunteerTitle: "FIELD-WORK RESOLUTION",
    volunteerDesc: "Field personnel receive tasks, resolve infrastructure issues, and upload validation reports.",

    // Sidebar
    home: "Home",
    systemOverview: "System Overview",
    fieldWorkers: "Field Workers",
    complaintsMgmt: "Complaints",
    settings: "Settings",
    sysAdmin: "System Admin",
    citizen: "Citizen",

    // Login & Signup
    loginTitle: "Citizen & Civic Administration Portal",
    signupTitle: "Register a new citizen or admin account",
    registerHere: "Register Here",
    newToGram: "New to GramSuvidha?",
    loginBtn: "Sign In",
    registerBtn: "Register Now",
    email: "Email Address",
    password: "Password",
    rememberMe: "Remember me",
    forgotPass: "Forgot password?",
    alreadyReg: "Already registered?",
    loginHere: "Login Here",
    regType: "Registration Type",
    pAdmin: "Panchayat Admin",
    firstName: "First Name",
    lastName: "Last Name",
    age: "Age",
    phone: "Mobile Number",
    gender: "Gender",
    selectGender: "Select Gender",
    confirmPass: "Confirm Password",
    villageId: "Official Panchayat / Village ID",
    categoriesTitle: "Select Category to Report",
    categoriesDesc: "Issues will be routed to corresponding Gram Panchayat department",
    waterTitle: "Water & Sanitation",
    waterDesc: "Pipeline leakage, drainage blocks, public toilets",
    lightTitle: "Electricity & Lights",
    lightDesc: "Streetlights not working, loose power lines",
    roadTitle: "Roads & Cleanliness",
    roadDesc: "Potholes, garbage disposal, road obstruction",
    schemeTitle: "Welfare Schemes",
    schemeDesc: "Apply for housing, agricultural, and drinking water schemes"
  }
};

export const LanguageProvider = ({ children }) => {
  const language = 'en';

  const t = (key) => {
    return translations.en[key] || key;
  };

  const toggleLanguage = () => {
    // Hindi translation and toggle completely removed
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
