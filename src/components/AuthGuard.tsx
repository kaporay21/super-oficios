'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'cliente' | 'profesional' | 'admin';
}

const ADMIN_EMAIL = 'gonzalohumacata1992@gmail.com';

/**
 * AuthGuard component that protects routes.
 * - If no user session → redirects to /login
 * - If requiredRole is specified, validates the user has the correct role
 * - If requiredRole is 'admin', checks against admin email whitelist
 */
export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Check role-based access
    if (requiredRole === 'admin') {
      if (user.email !== ADMIN_EMAIL) {
        router.replace('/');
        return;
      }
    } else if (requiredRole && profile) {
      if (profile.rol !== requiredRole) {
        // Redirect to the correct panel
        if (profile.rol === 'profesional') {
          router.replace('/panel-profesional');
        } else {
          router.replace('/cliente');
        }
        return;
      }
    }
  }, [user, profile, loading, requiredRole, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
          <p className="text-sm font-bold text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Role check for admin
  if (requiredRole === 'admin' && user.email !== ADMIN_EMAIL) {
    return null;
  }

  // Role check for client/professional (profile might still be loading)
  if (requiredRole && requiredRole !== 'admin' && profile && profile.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
