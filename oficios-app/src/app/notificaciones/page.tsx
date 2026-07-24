"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Briefcase, MessageSquare, 
  Send, Info, LayoutDashboard, User 
} from 'lucide-react';

// Tipo de dato para las notificaciones
interface Notificacion {
  id: number;
  tipo: 'trabajo' | 'mensaje' | 'sistema' | 'alerta';
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'trabajos' | 'mensajes'>('todas');

  // Estado inicial de las notificaciones
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: 1,
      tipo: 'trabajo',
      titulo: 'Nuevo trabajo cerca de tu zona: Pintura de living',
      descripcion: 'Una nueva solicitud de pintura interior ha sido publicada a 2km de tu ubicación actual.',
      tiempo: 'Hace 5 min',
      leida: false
    },
    {
      id: 2,
      tipo: 'trabajo',
      titulo: '¡Juan Pérez aceptó tu presupuesto!',
      descripcion: 'El profesional ha confirmado los términos. Ahora puedes coordinar la fecha de inicio por el chat.',
      tiempo: 'Hace 20 min',
      leida: false
    },
    {
      id: 3,
      tipo: 'mensaje',
      titulo: 'Has recibido un nuevo mensaje',
      descripcion: 'María García: "Hola, ¿podrías enviarme una foto de los materiales que necesitas?"',
      tiempo: 'Hace 1 h',
      leida: false
    },
    {
      id: 4,
      tipo: 'sistema',
      titulo: 'Tu postulación ha sido enviada con éxito',
      descripcion: 'Tu presupuesto para "Arreglo de grifería" fue recibido por el cliente. Te avisaremos cuando lo revise.',
      tiempo: 'Ayer',
      leida: true
    },
    {
      id: 5,
      tipo: 'alerta',
      titulo: 'Actualiza tu perfil',
      descripcion: 'Completa tus certificados para ganar mayor visibilidad en las búsquedas de clientes.',
      tiempo: 'Hace 2 días',
      leida: true
    }
  ]);

  // Función para marcar como leída al hacer clic
  const marcarComoLeida = (id: number) => {
    setNotificaciones(notificaciones.map(notif => 
      notif.id === id ? { ...notif, leida: true } : notif
    ));
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
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-20 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-20" onClick={() => router.push('/panel-profesional')}>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
             <span className="text-xl">👷🏻‍♂️</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold text-lg text-[#00355f]">Oficios</span><span className="font-extrabold text-lg text-[#fc8127]">Ya</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div 
            className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold cursor-pointer border border-gray-200"
            onClick={() => router.push('/configuracion-profesional')}
          >
            JP
          </div>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/panel-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><LayoutDashboard className="w-6 h-6" /></button>
        <button onClick={() => router.push('/mis-trabajos')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Briefcase className="w-6 h-6" /></button>
        <button onClick={() => router.push('/chat')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><MessageSquare className="w-6 h-6" /></button>
        <div className="relative group">
          <button className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center shadow-sm"><Bell className="w-6 h-6 fill-current" /></button>
        </div>
        <div className="mt-auto">
          <button onClick={() => router.push('/configuracion-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
        </div>
      </nav>

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
                onClick={() => marcarComoLeida(notif.id)}
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
    </div>
  );
}