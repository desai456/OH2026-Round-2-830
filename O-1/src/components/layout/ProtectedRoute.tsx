import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, authUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4A1C] to-[#E03A0E] text-white font-black text-xl flex items-center justify-center animate-pulse">
            DF
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#FF4A1C] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-[#A6A39C]">Loading DealFlow360...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && authUser && !allowedRoles.includes(authUser.role)) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#F5F1EA] flex items-center justify-center p-6">
        <div className="bg-[#151517] border border-white/10 rounded-[20px] p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 text-3xl flex items-center justify-center mx-auto">
            🔒
          </div>
          <h2 className="text-xl font-serif font-bold text-[#F5F1EA]">Access Restricted</h2>
          <p className="text-sm text-[#A6A39C]">
            Your role ({authUser?.role}) does not have permission to access this page.
          </p>
          <p className="text-xs text-[#6E6C68]">
            Required: {allowedRoles.join(', ')}
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
