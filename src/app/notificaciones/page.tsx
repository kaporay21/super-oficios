"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Briefcase, MessageSquare, 
  Send, Info, LayoutDashboard, User, Home, Building 
} from 'lucide-react';
import Logo from '@/components/Logo';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
import { dbHelper } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import AuthGuard from '@/components/AuthGuard';

// Tipo de dato para las notificaciones
interface Notificacion {
  id: string;
  tipo: 'trabajo' | 'mensaje' | 'sistema' | 'alerta';
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

export default function NotificacionesPage() {
  return (
    <AuthGuard requiredRole={undefined}>
      <NotificacionesContent />
    </AuthGuard>
  );
}

function NotificacionesContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'trabajos' | 'mensajes'>('todas');
  const [userPlan, setUserPlan] = useState<'Gratis' | 'Pro' | 'Master'>('Gratis');

  // Estado de las notificaciones desde BD
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (profile?.rol === 'profesional') {
      const storedPerfil = localStorage.getItem('oficiosya_profesional_perfil');
      if (storedPerfil) {
        try {
          const parsed = JSON.parse(storedPerfil);
          if (parsed.plan) setUserPlan(parsed.plan);
        } catch (e) {}
      }
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      loadNotificaciones();
    }
  }, [user?.id]);

  const loadNotificaciones = async () => {
    if (!user?.id) return;
    try {
      const data = await dbHelper.getNotificaciones(user.id);
      const formatted = data.map(n => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        descripcion: n.descripcion,
        tiempo: new Date(n.created_at).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        leida: n.leida,
        referencia_id: n.referencia_id
      }));
      setNotificaciones(formatted);
    } catch (e) {
      console.error("Error cargando notificaciones:", e);
    }
  };

  const marcarComoLeida = async (id: string) => {
    setNotificaciones(prev => prev.map(notif => 
      notif.id === id ? { ...notif, leida: true } : notif
    ));
    await dbHelper.marcarNotificacionLeida(id);
  };

  const handleNotificacionClick = (notif: Notificacion) => {
    marcarComoLeida(notif.id);
    if (notif.tipo === 'trabajo' || (notif as any).referencia_id) {
      if (profile?.rol === 'profesional') {
        router.push('/muro-trabajos');
      } else {
        router.push('/mis-trabajos');
      }
    } else if (notif.tipo === 'mensaje') {
      router.push('/chat');
    }
  };

  // Filtrar notificaciones según el botón activo
  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filtroActivo === 'todas') return true;
    if (filtroActivo === 'trabajos') return notif.tipo === 'trabajo';
    if (filtroActivo === 'mensajes') return notif.tipo === 'mensaje';
    return true;
  });

  // Helper para renderizar el ícono correcto según el tipo
  const renderIcono = (tipo: string) => {
    switch (tipo) {
      case 'trabajo': return <div className="w-12 h-12 bg-[#d2e4ff] rounded-xl flex items-center justify-center shrink-0"><Briefcase className="w-6 h-6 text-[#00355f]" /></div>;
      case 'mensaje': return <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0"><MessageSquare className="w-6 h-6 text-green-700" /></div>;
      case 'sistema': return <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0"><Send className="w-6 h-6 text-gray-600" /></div>;
      case 'alerta': return <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><Info className="w-6 h-6 text-red-600" /></div>;
      default: return <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0"><Bell className="w-6 h-6 text-gray-600" /></div>;
    }
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 shadow-sm border-b border-gray-200 ${profile?.rol === 'profesional' ? 'bg-white' : 'bg-[#001529]'}`}>
        <div className={`flex items-center gap-3 cursor-pointer ${profile?.rol === 'profesional' ? 'md:pl-24' : ''}`} onClick={() => router.push(profile?.rol === 'profesional' ? '/panel-profesional' : '/cliente')}>
          {profile?.rol === 'profesional' ? <Logo size="md" theme="light" /> : <Logo size="md" theme="dark" />}
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button className="p-2 rounded-full bg-blue-50 text-[#00355f] transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
          <Tooltip title="Mi Perfil" text="Actualizá tus datos personales, especialidades, coberturas y subí certificados profesionales." position="bottom">
            <div 
              className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold cursor-pointer border border-gray-200"
              onClick={() => router.push('/configuracion-profesional')}
            >
              JP
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) - SOLO PROFESIONAL */}
      {profile?.rol === 'profesional' && (
        <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
          
          <Tooltip title="Panel" text="Hacé clic para ver el resumen de tu actividad, trabajos activos y ganancias del mes." position="right">
            <button 
              onClick={() => router.push('/panel-profesional')}
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <PanelIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Panel</span>
            </button>
          </Tooltip>

          <Tooltip title="Muro de trabajos" text="Explorá el muro de solicitudes publicadas por clientes y postulá tus presupuestos." position="right">
            <button 
              onClick={() => router.push('/muro-trabajos')}
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <MuroIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Muro</span>
            </button>
          </Tooltip>

          {(userPlan === 'Pro' || userPlan === 'Master') && (
            <Tooltip title="Mis trabajos" text="Revisá y gestioná tus trabajos en curso, presupuestados o finalizados." position="right">
              <button 
                onClick={() => router.push('/mis-trabajos')}
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <TrabajosIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Trabajos</span>
              </button>
            </Tooltip>
          )}

          <Tooltip title="Mensajes" text="Chateá directamente con tus clientes para coordinar visitas y detalles de los trabajos." position="right">
            <button 
              onClick={() => router.push('/chat')}
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <MensajesIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Mensajes</span>
            </button>
          </Tooltip>

          <Tooltip title="Buzón de Soporte" text="¿Tenés dudas o sugerencias? Escribinos y nuestro equipo te responderá directamente." position="right">
            <button 
              onClick={() => router.push('/panel-profesional?support=true')}
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <SoporteIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Soporte</span>
            </button>
          </Tooltip>

          <Tooltip title="Presupuestador" text="Calculadora de materiales, mano de obra y cómputos de obra." position="right">
            <button 
              onClick={() => router.push('/presupuestador-obras')}
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <HerramientasIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Presupuestador</span>
            </button>
          </Tooltip>

          <div className="mt-auto mb-6">
            <Tooltip title="Configuración" text="Editá tus datos, cambia tu contraseña y activa o desactiva estos globitos aclaratorios." position="right">
              <button 
                onClick={() => router.push('/configuracion-profesional')} 
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <ConfiguracionIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Configurar</span>
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      <main className="mt-16 flex-grow px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
        {/* Section Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f]">Notificaciones</h1>
        </div>

        {/* Categories / Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFiltroActivo('todas')}
            className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${filtroActivo === 'todas' ? 'bg-[#00355f] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFiltroActivo('trabajos')}
            className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${filtroActivo === 'trabajos' ? 'bg-[#00355f] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Trabajos
          </button>
          <button 
            onClick={() => setFiltroActivo('mensajes')}
            className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${filtroActivo === 'mensajes' ? 'bg-[#00355f] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Mensajes
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notificacionesFiltradas.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Bell className="text-gray-300 w-10 h-10" />
               </div>
               <h2 className="text-lg font-bold text-[#00355f]">No hay notificaciones</h2>
               <p className="text-sm text-gray-500 mt-2">Te avisaremos cuando suceda algo importante.</p>
             </div>
          ) : (
            notificacionesFiltradas.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificacionClick(notif)}
                className={`group relative flex gap-4 p-5 bg-white border border-gray-200 rounded-2xl transition-all duration-200 hover:shadow-md cursor-pointer ${notif.leida ? 'opacity-70' : 'bg-blue-50/30 border-blue-100'}`}
              >
                {/* Indicador de no leído y tiempo */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold text-gray-400">{notif.tiempo}</span>
                  {!notif.leida && <div className="w-2.5 h-2.5 bg-[#fc8127] rounded-full shadow-sm animate-pulse"></div>}
                </div>

                {renderIcono(notif.tipo)}
                
                <div className="pr-12">
                  <h3 className={`text-base md:text-lg ${notif.leida ? 'font-semibold text-gray-800' : 'font-bold text-[#00355f]'}`}>
                    {notif.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {notif.descripcion}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom NavBar (Mobile) */}
      {profile?.rol === 'profesional' ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
          <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Dashboard</span></button>
          <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><Briefcase className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Trabajos</span></button>
          <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span className="text-[10px] mt-1 font-medium">Mensajes</span>
          </button>
          <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-[#fc8127]"><User className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Perfil</span></button>
        </nav>
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#001529]/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 flex justify-around z-40">
          <button onClick={() => router.push('/cliente')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Inicio</span>
          </button>
          <button onClick={() => router.push('/mi-hogar')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
            <Building className="w-5 h-5" />
            <span className="text-[9px] font-bold">Mi Hogar</span>
          </button>
          <button onClick={() => router.push('/buscar-profesionales')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-bold">Buscar</span>
          </button>
          <button onClick={() => router.push('/configuracion-cliente')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold">Perfil</span>
          </button>
        </nav>
      )}
    </div>
  );
}