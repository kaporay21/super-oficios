"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Bell, X, ArrowRight, Volume2 } from 'lucide-react';
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
  unreadNotificationsCount: number;
  refreshUnreadNotifications: () => void;
  toasts: NotificationToast[];
  removeToast: (id: string) => void;
  requestPermission: () => Promise<void>;
  permissionState: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadMessagesCount: 0,
  unreadNotificationsCount: 0,
  refreshUnreadNotifications: () => {},
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

    // Liberamos el AudioContext al terminar: cada notificación creaba uno
    // nuevo y los navegadores cortan a las ~6 instancias simultáneas.
    osc2.onended = () => { ctx.close().catch(() => {}); };
  } catch (e) {
    // Ignorar si el audio aún no fue desbloqueado por interacción del usuario
  }
}

/**
 * Convierte el `texto` crudo de un mensaje en algo legible para el toast.
 *
 * Los presupuestos del Muro viajan como un JSON serializado dentro de la
 * columna `texto` (ver dbHelper.enviarOfertaMuro), y los presupuestos del
 * chat como un marcador `📄 PRESUPUESTO_ENVIADO:<uuid>`. Sin esto el usuario
 * veía el JSON completo en la notificación.
 */
function resumirMensaje(texto?: string | null): string {
  if (!texto) return 'Te envió un mensaje';

  if (texto.startsWith('📄 PRESUPUESTO_ENVIADO:')) return '📄 Te envió un presupuesto';
  if (texto.startsWith('✅ PRESUPUESTO_ACEPTADO:')) return '✅ Aceptó el presupuesto';
  if (texto.startsWith('❌ PRESUPUESTO_RECHAZADO:')) return '❌ Rechazó el presupuesto';

  if (texto.trimStart().startsWith('{')) {
    try {
      const parsed = JSON.parse(texto);
      if (parsed?.tipo === 'presupuesto_card') {
        const monto = Number(parsed.monto || 0).toLocaleString('es-AR');
        return `💰 Presupuesto de $${monto}`;
      }
    } catch {
      // No era JSON válido: cae al texto plano de abajo.
    }
  }

  return texto.length > 80 ? `${texto.slice(0, 80)}…` : texto;
}

/** Ruta a la que debe llevar el toast de una notificación, según su tipo. */
function destinoNotificacion(notif: any): string {
  const ref = notif?.referencia_id ? String(notif.referencia_id) : '';

  switch (notif?.tipo) {
    case 'presupuesto':
      // El cliente recibió una oferta: lo llevamos a comparar las de ESE trabajo.
      // /comparar-presupuestos exige ?trabajoId= — sin él muestra la pantalla vacía.
      return ref ? `/comparar-presupuestos?trabajoId=${ref}` : '/notificaciones';
    case 'mensaje':
      return ref ? `/chat/${ref}` : '/chat';
    default:
      return '/notificaciones';
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
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

  // Cargar usuario autenticado y mantenerlo sincronizado con la sesión.
  // Antes se resolvía una sola vez al montar: si el usuario iniciaba sesión
  // después, nunca se abría la suscripción realtime.
  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      const perfil = await getCurrentProfile().catch(() => null);
      if (!cancelado) setUser(perfil);
    };

    cargar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') cargar();
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUnreadMessagesCount(0);
        setUnreadNotificationsCount(0);
        setToasts([]);
      }
    });

    return () => {
      cancelado = true;
      subscription.unsubscribe();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Agregar toast in-app.
  // `removeToast` se declara ARRIBA a propósito: antes estaba definido después
  // de addToast, que lo referencia, y el compilador de React lo marcaba como
  // "cannot access variable before it is declared".
  const addToast = useCallback((toast: Omit<NotificationToast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast = { ...toast, id };
    setToasts(prev => [newToast, ...prev.slice(0, 2)]); // Máximo 3 toasts simultáneos

    // Reproducir sonido
    playNotificationSound();

    // Si el navegador permite push nativo y la ventana no está enfocada
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(toast.titulo, {
          body: toast.mensaje,
          // /icon.png no existe; los íconos de la PWA viven en /icons/.
          icon: toast.avatar || '/icons/icon-192.png',
        });
      } catch (e) {
        console.error('Error push nativo:', e);
      }
    }

    // Auto eliminar a los 6 segundos
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, [removeToast]);

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

  // Contador real de notificaciones no leídas (tabla `notificaciones`, no
  // `mensajes`). Antes cada pantalla lo reimplementaba a mano -- la mitad
  // dejó el puntito rojo de la campana hardcodeado siempre prendido, y la
  // otra mitad lo calculaba una sola vez al montar sin reaccionar a lo
  // nuevo que llegara mientras el usuario seguía en esa pantalla.
  const loadUnreadNotifCount = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .eq('leida', false);
      if (!error && count !== null) setUnreadNotificationsCount(count);
    } catch (e) {
      console.error('Error al contar notificaciones no leídas:', e);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    loadUnreadNotifCount(user.id);
  }, [user, loadUnreadNotifCount]);

  const refreshUnreadNotifications = useCallback(() => {
    if (user?.id) loadUnreadNotifCount(user.id);
  }, [user, loadUnreadNotifCount]);

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
          const convId = nuevoMensaje.conversacion_id;

          // Si el usuario YA está leyendo esa conversación, no molestamos:
          // ni toast, ni sonido, ni sumamos al contador (el chat lo marca leído).
          // Antes se comparaba contra emisor_id, que nunca coincide con la URL
          // (que lleva el id de la CONVERSACIÓN), así que el toast saltaba
          // incluso mientras estabas leyendo ese mismo chat.
          if (pathname === `/chat/${convId}`) return;

          setUnreadMessagesCount(prev => prev + 1);

          const { data: emisor } = await supabase
            .from('perfiles')
            .select('nombre, foto_perfil')
            .eq('id', nuevoMensaje.emisor_id)
            .maybeSingle();

          addToast({
            titulo: emisor?.nombre ? `💬 ${emisor.nombre}` : '💬 Nuevo Mensaje',
            // La columna es `texto`, no `contenido`: antes el toast siempre
            // mostraba el texto genérico en vez del mensaje real.
            mensaje: resumirMensaje(nuevoMensaje.texto),
            avatar: emisor?.foto_perfil || undefined,
            // /chat/[id] espera el id de la conversación, no el del usuario.
            linkUrl: convId ? `/chat/${convId}` : '/chat',
            tipo: 'mensaje',
          });
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

          setUnreadNotificationsCount(prev => prev + 1);

          // Los mensajes ya generan su propio toast en el canal de `mensajes`;
          // sin esto el usuario recibía dos avisos por cada mensaje entrante.
          if (notif.tipo === 'mensaje') return;

          addToast({
            titulo: notif.titulo || '🔔 Nueva Notificación',
            mensaje: notif.descripcion || '',
            // Antes todo apuntaba a /comparar-presupuestos sin trabajoId:
            // el cliente caía en la pantalla vacía y al profesional lo
            // expulsaba el AuthGuard requiredRole="cliente".
            linkUrl: destinoNotificacion(notif),
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
        unreadNotificationsCount,
        refreshUnreadNotifications,
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
