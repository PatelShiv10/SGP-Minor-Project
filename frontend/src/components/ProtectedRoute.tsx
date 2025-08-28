import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'lawyer' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, authReady } = useAuth();

  // Wait until auth state has been hydrated before deciding
  if (!authReady) {
    return null; // or a small loader, but returning null avoids layout shift
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // If role is required and user doesn't have the correct role
  if (requiredRole && user?.userType !== requiredRole) {
    // Redirect based on user's actual role
    if (user?.userType === 'lawyer') {
      return <Navigate to="/lawyer-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}; 