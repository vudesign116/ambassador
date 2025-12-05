import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * UserProtectedRoute Component
 * Protects user routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */
const UserProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const phoneNumber = localStorage.getItem('phoneNumber');
  const authToken = localStorage.getItem('authToken');

  // If not authenticated, redirect to login
  if (!phoneNumber || !authToken) {
    console.log('⚠️ Unauthorized user access attempt - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  console.log('✅ User authenticated - access granted:', phoneNumber);
  return children;
};

export default UserProtectedRoute;
