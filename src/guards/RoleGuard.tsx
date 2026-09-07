import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { currentUser, isLoading, getRoleDashboardPath } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Checking role permissions..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Super-admin has universal platform oversight
  if (currentUser.role === 'PLATFORM_ADMIN') {
    return <Outlet />;
  }

  // Check if role is allowed
  if (!allowedRoles.includes(currentUser.role)) {
    const fallbackPath = getRoleDashboardPath(currentUser.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
