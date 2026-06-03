import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { LanguageProvider } from './context/LanguageContext';

// Lazy load route pages to improve initial load and render speed
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const FieldWorkers = lazy(() => import('./pages/admin/FieldWorkers'));
const ComplaintsManagement = lazy(() => import('./pages/admin/ComplaintsManagement'));
const SchemeApplications = lazy(() => import('./pages/admin/SchemeApplications'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const CitizenHome = lazy(() => import('./pages/citizen/CitizenHome'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const RegisterComplaint = lazy(() => import('./pages/citizen/RegisterComplaint'));
const Schemes = lazy(() => import('./pages/citizen/Schemes'));
const Profile = lazy(() => import('./pages/citizen/Profile'));
const Taxes = lazy(() => import('./pages/citizen/Taxes'));
const AdminTaxes = lazy(() => import('./pages/admin/AdminTaxes'));
const AdminBudget = lazy(() => import('./pages/admin/AdminBudget'));
const CitizenBudget = lazy(() => import('./pages/citizen/CitizenBudget'));
const AdminMeetings = lazy(() => import('./pages/admin/AdminMeetings'));
const CitizenMeetings = lazy(() => import('./pages/citizen/CitizenMeetings'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const SelectLanguage = lazy(() => import('./pages/SelectLanguage'));
const AdminBroadcasts = lazy(() => import('./pages/admin/AdminBroadcasts'));
const CitizenBroadcasts = lazy(() => import('./pages/citizen/CitizenBroadcasts'));

// Premium glassmorphic fallback loader
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-[#061926] text-[#C4F8FF]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C4F8FF]"></div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/select-language" element={<SelectLanguage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<AdminHome />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="workers" element={<FieldWorkers />} />
              <Route path="complaints" element={<ComplaintsManagement />} />
              <Route path="schemes" element={<SchemeApplications />} />
              <Route path="taxes" element={<AdminTaxes />} />
              <Route path="budget" element={<AdminBudget />} />
              <Route path="meetings" element={<AdminMeetings />} />
              <Route path="broadcasts" element={<AdminBroadcasts />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Citizen Routes */}
            <Route path="/citizen" element={<DashboardLayout role="citizen" />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<CitizenHome />} />
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="complaint" element={<RegisterComplaint />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="profile" element={<Profile />} />
              <Route path="taxes" element={<Taxes />} />
              <Route path="budget" element={<CitizenBudget />} />
              <Route path="meetings" element={<CitizenMeetings />} />
              <Route path="broadcasts" element={<CitizenBroadcasts />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Chatbot />
        </Suspense>
      </Router>
    </LanguageProvider>
  );
}

export default App;
