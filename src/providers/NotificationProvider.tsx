"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Bell, X, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { supabase, getCurrentProfile } from '@/lib/supabase';

interface NotificationToast {
  id: string;
  titulo: string;
  mensaje: string;
  avatar?: string;
  linkUrl?: string;
  tipo: 'mensaje' | 'presupuesto' | 'notificacion';
}

interface NotificationContextType {
  unreadMessagesCount: number;
  toasts: NotificationToast[];
  removeToast: (id: string) => void;
  requestPermission: () => Promise<void>;
  permissionState: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadMessagesCount: 0,
  toasts: [],
  removeToast: () => {},
  requestPermission: async () => {},
  permissionState: 'default',
});

export const useNotification = () => useContext(NotificationContext);

// Generador de sonido sintético corto (Chime "ding-dong" de 2 tonos estilo iOS/WhatsApp)
function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Nota 1: E6 (1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Nota 2: B6 (1975.5 Hz) 80ms después
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignorar si el audio aún no fue desbloqueado por interacción del usuario
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [showPermissionBanner, setShowPermissionBanner] = useState<boolean>(false);

  // Consultar estado de notificaciones nativas
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === 'default') {
        // Mostrar banner después de 3 segundos
        const t = setTimeout(() => setShowPermissionBanner(true), 3000);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        setShowPermissionBanner(false);
      } catch (e) {
        console.error('Error al pedir permiso de notificaciones:', e);
      }
    }
  };

  // Cargar usuario autenticado
  useEffect(() => {
    getCurrentProfile().then(u => {
      setUser(u);
    }).catch(() => null);
  }, []);

  // Agregar toast in-app
  const addToast = useCallback((toast: Omit<NotificationToast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [newToast, ...prev.slice(0, 2)]); // Máximo 3 toasts simultáneos

    // Reproducir sonido
    playNotificationSound();

    // Si el navegador permite push nativo y la ventana no está enfocada
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(toast.titulo, {
          body: toast.mensaje,
          icon: toast.avatar || '/icon.png',
        });
      } catch (e) {
        console.error('Error push nativo:', e);
      }
    }

    // Auto eliminar a los 6 segundos
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Cargar contador inicial de mensajes no leídos
  const loadUnreadCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('receptor_id', userId)
        .eq('leido', false);

      if (!error && count !== null) {
        setUnreadMessagesCount(count);
      }
    } catch (e) {
      console.error('Error al contar no leídos:', e);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadUnreadCount(user.id);
  }, [user, loadUnreadCount]);

  // Suscripción Realtime a Supabase
  useEffect(() => {
    if (!user?.id) return;

    // Escuchar mensajes entrantes
    const channelMensajes = supabase
      .channel(`realtime-mensajes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `receptor_id=eq.${user.id}`,
        },
        async (payload) => {
          const nuevoMensaje = payload.new;
          
          // Actualizar contador
          setUnreadMessagesCount(prev => prev + 1);

          // Si el usuario no está justo en la conversación abierta
          if (!pathname.includes(`/chat/${nuevoMensaje.emisor_id}`)) {
            // Obtener nombre del emisor
            const { data: emisor } = await supabase
              .from('perfiles')
              .select('nombre, foto_perfil')
              .eq('id', nuevoMensaje.emisor_id)
              .maybeSingle();

            addToast({
              titulo: emisor?.nombre ? `💬 ${emisor.nombre}` : '💬 Nuevo Mensaje',
              mensaje: nuevoMensaje.contenido || 'Te ha enviado un mensaje',
              avatar: emisor?.foto_perfil,
              linkUrl: `/chat/${nuevoMensaje.emisor_id}`,
              tipo: 'mensaje',
            });
          }
        }
      )
      .subscribe();

    // Escuchar notificaciones generales
    const channelNotificaciones = supabase
      .channel(`realtime-notif-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new;
          addToast({
            titulo: notif.titulo || '🔔 Nueva Notificación',
            mensaje: notif.descripcion || '',
            linkUrl: '/comparar-presupuestos',
            tipo: 'notificacion',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelMensajes);
      supabase.removeChannel(channelNotificaciones);
    };
  }, [user, pathname, addToast]);

  return (
    <NotificationContext.Provider
      value={{
        unreadMessagesCount,
        toasts,
        removeToast,
        requestPermission,
        permissionState,
      }}
    >
      {children}

      {/* ── Banners Flotantes In-App (Toast Estilo iOS/WhatsApp) ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              removeToast(toast.id);
              if (toast.linkUrl) router.push(toast.linkUrl);
            }}
            className="pointer-events-auto bg-[#00355f] text-white rounded-2xl p-3.5 shadow-2xl border border-white/20 flex items-center justify-between gap-3 animate-in slide-in-from-top-6 duration-300 cursor-pointer hover:bg-[#0f4c81] active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {toast.avatar ? (
                <img
                  src={toast.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#fc8127] flex items-center justify-center shrink-0 text-white font-bold">
                  {toast.tipo === 'mensaje' ? <MessageSquare className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-xs text-[#fc8127] truncate">{toast.titulo}</p>
                <p className="text-xs text-gray-200 truncate">{toast.mensaje}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                Ver <ArrowRight className="w-3 h-3" />
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Banner Discreto para solicitar notificaciones al celular ── */}
      {showPermissionBanner && permissionState === 'default' && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[92%] max-w-sm bg-white border border-gray-200 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#fc8127] flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#00355f]">¿Activar alertas al celular?</p>
              <p className="text-[11px] text-gray-500">Recibí presupuestos y chat al instante.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={requestPermission}
              className="bg-[#fc8127] text-white text-xs font-black px-3 py-1.5 rounded-xl hover:bg-[#e67320] transition-colors"
            >
              Activar
            </button>
            <button
              onClick={() => setShowPermissionBanner(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
