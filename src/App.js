import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/DashboardPage';
import Login from './pages/LoginPage';
import Introduction from './pages/IntroductionPage';
import ScoringRules from './pages/ScoringRulesPage';
import Contact from './pages/ContactPage';
import DocumentList from './pages/DocumentListPage';
import MiniGame from './pages/MiniGamePage';
import PointHistory from './pages/PointHistoryPage';
import RewardSelection from './pages/RewardSelectionPage';

// Error Pages
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';

// Admin Pages
import AdminLogin from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminMiniGames from './pages/AdminMiniGames';
import AdminLoginPageConfig from './pages/AdminLoginPageConfig';
import AdminIntroductionConfig from './pages/AdminIntroductionConfig';
import AdminScoringRulesConfig from './pages/AdminScoringRulesConfig';
import AdminDashboardConfig from './pages/AdminDashboardConfig';
import AdminGeneralConfig from './pages/AdminGeneralConfig';
import AdminNotificationConfig from './pages/AdminNotificationConfig';
import SurveyListPage from './pages/admin/SurveyListPage';
import SurveyFormPage from './pages/admin/SurveyFormPage';
import SurveyResponsesPage from './pages/admin/SurveyResponsesPage';

// Admin Layout
import AdminLayout from './layouts/AdminLayout';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';
import APIErrorBoundary from './components/APIErrorBoundary';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';

import './App.css';

// Import mock helpers for testing (DISABLED for production)
// import './utils/mockRewardData';
// import './utils/mockActivityData';

// Import Google Sheets service for page view tracking
import { googleSheetsService } from './services/googleSheetsService';

// Import API Monitor for automatic error detection
import apiMonitor from './services/apiMonitor';

// 🔇 Disable all console logs for clean UI
if (false) { // Set to false to enable console for debugging - ENABLED FOR API DEBUG
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// 🆕 Preload admin configs on app start for faster load
function preloadAdminConfigs() {
  // Preload most common configs
  const configsToPreload = [
    'admin_login_page_config',
    'admin_badges_config',
    'admin_introduction_config',
    'admin_scoring_rules_config',
    'admin_notification_config'
  ];

  configsToPreload.forEach(async (configName) => {
    try {
      const config = await googleSheetsService.loadAdminConfig(configName);
      if (config) {
        // Cache in localStorage for instant access
        localStorage.setItem(configName, JSON.stringify(config));
        console.log(`✅ Preloaded: ${configName}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${configName}:`, error);
    }
  });
}

// 🆕 Scroll to Top on Route Change (Fix iPhone scroll issue)
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo(0, 0);
    // Also try with smooth behavior for iOS
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (e) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}

// 🆕 Page View Tracker Component with Debounce
// Only tracks if user stays on page > X seconds (prevent spam)
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Check if page view tracking is enabled
    const trackPageView = process.env.REACT_APP_TRACK_PAGE_VIEW !== 'false';
    if (!trackPageView) return;

    // Only track if user is logged in (has phoneNumber)
    const phoneNumber = localStorage.getItem('phoneNumber');
    if (!phoneNumber) return;

    // Skip tracking admin pages and login page
    if (location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/') {
      return;
    }

    // Get delay from env or default to 5 seconds
    const delay = parseInt(process.env.REACT_APP_PAGE_VIEW_DELAY || '5000', 10);

    // 🔥 DEBOUNCE: Only track if user stays on page > X seconds
    const timer = setTimeout(() => {
      const durationSeconds = Math.floor(delay / 1000);
      googleSheetsService.trackPageView(
        location.pathname,
        durationSeconds, // User stayed X seconds
        {
          timestamp: new Date().toISOString()
        }
      ).catch(err => console.warn('Failed to track page view:', err));
    }, delay);

    // Cleanup: Cancel tracking if user leaves page quickly
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}

function App() {
  // 🆕 Preload configs on app mount
  useEffect(() => {
    preloadAdminConfigs();
  }, []);

  return (
    <ErrorBoundary>
      <APIErrorBoundary>
        <Router 
          future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
          }}
        >
          <div className="App">
            {/* 🆕 Scroll to top on route change (iPhone fix) */}
            <ScrollToTop />
            {/* 🆕 Global Page View Tracker */}
            <PageViewTracker />
          
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Public Routes - No login required */}
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/scoring-rules" element={<ScoringRules />} />
            
            {/* Protected User Routes - Login required */}
            <Route path="/dashboard" element={
              <UserProtectedRoute>
                <Dashboard />
              </UserProtectedRoute>
            } />
            <Route path="/contact" element={
              <UserProtectedRoute>
                <Contact />
              </UserProtectedRoute>
            } />
            <Route path="/documents/:category" element={
              <UserProtectedRoute>
                <DocumentList />
              </UserProtectedRoute>
            } />
            <Route path="/mini-games" element={
              <UserProtectedRoute>
                <MiniGame />
              </UserProtectedRoute>
            } />
            <Route path="/point-history" element={
              <UserProtectedRoute>
                <PointHistory />
              </UserProtectedRoute>
            } />
            <Route path="/reward-selection" element={
              <UserProtectedRoute>
                <RewardSelection />
              </UserProtectedRoute>
            } />
            
            {/* Error Pages */}
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/503" element={<ServerErrorPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="minigames" element={<AdminMiniGames />} />
              <Route path="login-page" element={<AdminLoginPageConfig />} />
              <Route path="introduction" element={<AdminIntroductionConfig />} />
              <Route path="scoring-rules" element={<AdminScoringRulesConfig />} />
              <Route path="dashboard-config" element={<AdminDashboardConfig />} />
              <Route path="general-config" element={<AdminGeneralConfig />} />
              <Route path="notification" element={<AdminNotificationConfig />} />
              <Route path="surveys" element={<SurveyListPage />} />
              <Route path="surveys/create" element={<SurveyFormPage />} />
              <Route path="surveys/:id/edit" element={<SurveyFormPage />} />
              <Route path="surveys/:id/responses" element={<SurveyResponsesPage />} />
            </Route>

            {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </div>
        </Router>
      </APIErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;