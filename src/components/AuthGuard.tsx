'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';
import { isEmailAdmin } from '@/lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'cliente' | 'profesional' | 'admin';
}

function checkIsAdmin(user: any, profile: any): boolean {
  const email = (user?.email || profile?.email || '').trim().toLowerCase();
  if (email && isEmailAdmin(email)) return true;
  if (profile && profile.rol === 'admin') return true;
  if (user && user.user_metadata?.rol === 'admin') return true;
  return false;
}

/**
 * AuthGuard component that protects routes with REAL Supabase Auth.
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
      if (!checkIsAdmin(user, profile)) {
        router.replace('/');
        return;
      }
    } else if (requiredRole && profile) {
      if (profile.rol !== requiredRole && !checkIsAdmin(user, profile)) {
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
          <p className="text-sm font-bold text-gray-500">Verificando sesión real...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Role check for admin
  if (requiredRole === 'admin' && !checkIsAdmin(user, profile)) {
    return null;
  }

  // Role check for client/professional (if user is not admin)
  if (requiredRole && requiredRole !== 'admin' && !checkIsAdmin(user, profile)) {
    if (!profile) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
            <p className="text-sm font-bold text-gray-500">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    if (profile.rol !== requiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
