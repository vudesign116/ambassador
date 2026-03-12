import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * UserProtectedRoute Component
 * Protects user routes from unauthorized access
 * Redirects to login page if user is not authenticated
 * Preserves the intended destination via ?redirect= param
 */
const UserProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user is authenticated
  const phoneNumber = localStorage.getItem('phoneNumber');
  const authToken = localStorage.getItem('authToken');

  // If not authenticated, redirect to login with ?redirect= param
  if (!phoneNumber || !authToken) {
    console.log('⚠️ Unauthorized user access attempt - redirecting to login');
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  // If authenticated, render the protected content
  console.log('✅ User authenticated - access granted:', phoneNumber);
  return children;
};

export default UserProtectedRoute;
