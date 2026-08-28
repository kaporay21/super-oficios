'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
const RUTA_COMPLETAR_PERFIL = '/completar-perfil-profesional';

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const effectiveRole = profile?.rol || (user.user_metadata?.rol) || 'profesional';

    // Perfil de profesional sin oficio o provincia: puede haber quedado así
    // por un registro que falló a mitad de camino (el auto-heal de
    // getCurrentProfile crea un perfil vacío para no dejar a nadie afuera).
    // Se lo manda a completar esos datos antes de dejarlo usar el resto de
    // la app, en vez de dejarlo pasar con un perfil incompleto.
    if (
      effectiveRole === 'profesional' &&
      !checkIsAdmin(user, profile) &&
      pathname !== RUTA_COMPLETAR_PERFIL &&
      (!profile?.oficios || profile.oficios.length === 0 || !profile?.provincia)
    ) {
      router.replace(`${RUTA_COMPLETAR_PERFIL}?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role-based access
    if (requiredRole === 'admin') {
      if (!checkIsAdmin(user, profile)) {
        router.replace('/');
        return;
      }
    } else if (requiredRole) {
      if (effectiveRole !== requiredRole && !checkIsAdmin(user, profile)) {
        if (effectiveRole === 'profesional') {
          router.replace('/panel-profesional');
        } else {
          router.replace('/cliente');
        }
        return;
      }
    }
  }, [user, profile, loading, requiredRole, router, pathname]);

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

  // Perfil de profesional incompleto: se está redirigiendo a completarlo.
  {
    const effectiveRole = profile?.rol || (user.user_metadata?.rol) || 'profesional';
    if (
      effectiveRole === 'profesional' &&
      !checkIsAdmin(user, profile) &&
      pathname !== RUTA_COMPLETAR_PERFIL &&
      (!profile?.oficios || profile.oficios.length === 0 || !profile?.provincia)
    ) {
      return null;
    }
  }

  // Role check for admin
  if (requiredRole === 'admin' && !checkIsAdmin(user, profile)) {
    return null;
  }

  // Role check for client/professional (if user is not admin)
  if (requiredRole && requiredRole !== 'admin' && !checkIsAdmin(user, profile)) {
    const effectiveRole = profile?.rol || (user.user_metadata?.rol) || 'profesional';
    if (effectiveRole !== requiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
