"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, ClipboardList, MessageSquare, User } from 'lucide-react';
import { useNotification } from '@/providers/NotificationProvider';
import { getCurrentProfile } from '@/lib/supabase';

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadMessagesCount } = useNotification();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    getCurrentProfile().then(setUserProfile).catch(() => null);
  }, [pathname]);

  // Si estamos en la vista individual de un chat (/chat/[id]), ocultar la barra inferior
  // para dar el 100% del espacio al teclado y al chat activo estilo WhatsApp.
  const isIndividualChat = pathname.startsWith('/chat/') && pathname !== '/chat';
  if (isIndividualChat) return null;

  const handlePerfilClick = () => {
    if (!userProfile) {
      router.push('/login');
      return;
    }
    if (userProfile.rol === 'profesional') {
      router.push('/panel-profesional');
    } else if (userProfile.rol === 'admin') {
      router.push('/admin');
    } else {
      router.push('/panel-cliente');
    }
  };

  const navItems = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      path: '/',
      isActive: pathname === '/',
    },
    {
      id: 'buscar',
      label: 'Buscar',
      icon: Search,
      path: '/buscar-profesionales',
      isActive: pathname.startsWith('/buscar-profesionales'),
    },
    {
      id: 'muro',
      label: 'Muro',
      icon: ClipboardList,
      path: '/muro-servicios',
      isActive: pathname.startsWith('/muro-servicios'),
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      path: '/chat',
      isActive: pathname.startsWith('/chat'),
      badge: unreadMessagesCount,
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      action: handlePerfilClick,
      isActive: pathname.includes('/panel-') || pathname.includes('/login') || pathname.includes('/admin'),
    },
  ];

  return (
    <nav aria-label="Navegación Móvil" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={() => (item.action ? item.action() : router.push(item.path!))}
              className={`flex-1 flex flex-col items-center justify-center h-full relative py-1 transition-all active:scale-95 ${
                active ? 'text-[#00355f]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 text-[#fc8127]' : ''}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight ${active ? 'text-[#00355f] font-extrabold' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 w-8 h-1 bg-[#fc8127] rounded-b-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
