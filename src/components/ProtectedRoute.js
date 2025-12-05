import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Protects admin routes from unauthorized access
 * Redirects to admin login if not authenticated or session expired
 */
const ProtectedRoute = ({ children }) => {
  // Check if admin is authenticated (matching AdminLoginPage.js)
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminUsername = localStorage.getItem('adminUsername');
  const adminLoginTime = localStorage.getItem('adminLoginTime');

  // Session expiry: 8 hours (8 * 60 * 60 * 1000 ms)
  const SESSION_DURATION = 8 * 60 * 60 * 1000;
  
  // Check if session has expired
  let sessionExpired = false;
  if (adminLoginTime) {
    const loginTimestamp = parseInt(adminLoginTime, 10);
    const currentTime = Date.now();
    sessionExpired = (currentTime - loginTimestamp) > SESSION_DURATION;
  }

  // If not authenticated or session expired, redirect to admin login
  if (!isAdminLoggedIn || !adminUsername || sessionExpired) {
    if (sessionExpired) {
      console.log('⚠️ Admin session expired - redirecting to login');
      // Clear expired session
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminLoginTime');
    } else {
      console.log('⚠️ Unauthorized admin access attempt - redirecting to login');
    }
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the protected content
  console.log('✅ Admin authenticated - access granted to:', adminUsername);
  return children;
};

export default ProtectedRoute;
