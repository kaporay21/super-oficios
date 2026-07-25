"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, MessageSquare, Search, Home
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function ChatIndexPage() {
  return (
    <AuthGuard>
      <ChatIndexContent />
    </AuthGuard>
  );
}

function ChatIndexContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = profile?.rol || 'cliente';

  useEffect(() => {
    const loadConversaciones = async () => {
      if (!user) return;
      try {
        const convs = await dbHelper.getConversaciones(user.id);
        setConversaciones(convs);
      } catch (err) {
        console.error('Error al cargar conversaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConversaciones();
  }, [user]);

  const formatTiempo = (fecha: string) => {
    if (!fecha) return '';
    const now = new Date();
    const msgDate = new Date(fecha);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    return msgDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-24 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(userRole === 'profesional' ? '/panel-profesional' : '/cliente')}>
            <Logo size="md" theme="light" />
          </div>
          <Tooltip title="Notificaciones" text="Revisá avisos importantes." position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral Desktop */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        {userRole === 'profesional' ? (
          <>
            <Tooltip title="Panel" text="Panel principal." position="right">
              <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl text-gray-400 hover:text-[#00355f] hover:bg-gray-50 transition-all">
                <PanelIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold">Panel</span>
              </button>
            </Tooltip>
            <Tooltip title="Muro" text="Ver trabajos disponibles." position="right">
              <button onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl text-gray-400 hover:text-[#00355f] hover:bg-gray-50 transition-all">
                <MuroIcon className="w-5 h-5" />
                <span className="text-[9px] font-bold">Muro</span>
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Inicio" text="Volver al inicio." position="right">
              <button onClick={() => router.push('/cliente')} className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl text-gray-400 hover:text-[#00355f] hover:bg-gray-50 transition-all">
                <Home className="w-5 h-5" />
                <span className="text-[9px] font-bold">Inicio</span>
              </button>
            </Tooltip>
          </>
        )}
        <Tooltip title="Mensajes" text="Tus conversaciones." position="right">
          <button className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl bg-[#00355f] text-white transition-all">
            <MensajesIcon className="w-5 h-5" />
            <span className="text-[9px] font-bold">Mensajes</span>
          </button>
        </Tooltip>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 px-4 py-6 md:py-8 max-w-3xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f]">Mensajes</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#fc8127] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversaciones.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No tenés conversaciones aún</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {userRole === 'profesional' 
                ? 'Cuando un cliente te contacte, aparecerá acá.' 
                : 'Contactá a un profesional desde su perfil para iniciar una conversación.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversaciones.map((conv) => (
              <div
                key={conv.id}
                onClick={() => router.push(`/chat/${conv.id}`)}
                className="flex items-center gap-4 px-4 py-4 bg-white rounded-2xl border border-gray-100 hover:border-[#fc8127]/30 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="relative">
                  <img 
                    src={conv.partnerAvatar} 
                    alt={conv.partnerNombre}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 group-hover:border-[#fc8127]/40 transition-colors" 
                  />
                  {conv.noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#fc8127] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {conv.noLeidos}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold text-sm truncate ${conv.noLeidos > 0 ? 'text-[#00355f]' : 'text-gray-800'}`}>
                      {conv.partnerNombre}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-2">
                      {formatTiempo(conv.ultimoMensajeFecha)}
                    </span>
                  </div>
                  {conv.partnerTrade && (
                    <p className="text-[10px] text-[#fc8127] font-bold uppercase tracking-wider">{conv.partnerTrade}</p>
                  )}
                  <p className={`text-xs truncate mt-0.5 ${conv.noLeidos > 0 ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>
                    {conv.ultimoMensaje || 'Conversación iniciada'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Navegación Inferior (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 z-50 pb-safe md:hidden">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer" onClick={() => router.push(userRole === 'profesional' ? '/panel-profesional' : '/cliente')}>
            <div className="p-1.5"><Home className="w-6 h-6" /></div>
            <span className="text-[11px] font-medium">Inicio</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="bg-[#00355f] text-white p-1.5 rounded-xl shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#00355f]">Mensajes</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer" onClick={() => router.push('/notificaciones')}>
            <div className="p-1.5"><Bell className="w-6 h-6" /></div>
            <span className="text-[11px] font-medium">Notificaciones</span>
          </div>
        </div>
      </nav>
    </div>
  );
}