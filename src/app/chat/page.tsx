"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, MessageSquare, LayoutDashboard, Briefcase, 
  User, ChevronRight, Search, Hammer, Home
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { HomeIcon, PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, PublicarIcon, HerramientasIcon } from '@/components/ModernIcons';
import Logo from '@/components/Logo';

export default function ChatIndexPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'cliente' | 'profesional'>('cliente');

  useEffect(() => {
    const pro = localStorage.getItem('oficiosya_profesional_perfil');
    const client = localStorage.getItem('oficiosya_cliente_perfil');
    if (pro) {
      setUserRole('profesional');
    } else {
      setUserRole('cliente');
    }
  }, []);

  // Lista simulada de chats según el rol detectado
  const conversaciones = React.useMemo(() => {
    if (userRole === 'profesional') {
      return [
        { id: '1', nombre: 'Ricardo Gómez', ultimoMensaje: 'Nos vemos a las 14:30hs', tiempo: '10:15hs', noLeidos: 0 },
        { id: '2', nombre: 'Mariana Solís', ultimoMensaje: '¿A qué hora sale para la cañería?', tiempo: 'Ayer', noLeidos: 1 },
      ];
    } else {
      return [
        { id: '1', nombre: 'Carlos Méndez', ultimoMensaje: 'Hola, vi tu solicitud de reparación. ¿Te parece si paso el jueves?', tiempo: '10:15hs', noLeidos: 0 },
        { id: '2', nombre: 'Lucía Ferreyra', ultimoMensaje: 'Hola, ¿me podrías dar más detalles del cortocircuito?', tiempo: 'Ayer', noLeidos: 0 },
        { id: '3', nombre: 'Roberto Gómez', ultimoMensaje: 'Hola, ya envié el presupuesto para la reparación.', tiempo: 'Ayer', noLeidos: 0 },
      ];
    }
  }, [userRole]);

  // Cargar trabajos activos para mostrar badge
  const [chatIdsConTrabajo, setChatIdsConTrabajo] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_trabajos_activos');
    if (stored) {
      const trabajos = JSON.parse(stored);
      const ids = trabajos
        .filter((t: any) => t.estado === 'en_curso')
        .map((t: any) => t.chatId);
      setChatIdsConTrabajo(ids);
    }
  }, []);

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-24 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(userRole === 'profesional' ? '/panel-profesional' : '/cliente')}>
            <Logo size="md" theme="light" />
          </div>
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral Desktop (Dinámica) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        {userRole === 'profesional' ? (
          <>
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

            <Tooltip title="Mensajes" text="Chateá directamente con tus clientes para coordinar visitas y detalles de los trabajos." position="right">
              <button className="flex flex-col items-center justify-center gap-1 group text-[#00355f] hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center border border-blue-100 shadow-sm group-hover:shadow-md transition-all">
                  <MensajesIcon className="w-6 h-6" active={true} />
                </div>
                <span className="text-[10px] font-extrabold text-[#00355f] uppercase tracking-wider">Mensajes</span>
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

            <Tooltip title="Herramientas" text="Calculadora de materiales, mano de obra y cómputos para albañilería y cuadrillas." position="right">
              <button 
                onClick={() => router.push('/presupuestador-obras')}
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <HerramientasIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Herramientas</span>
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
          </>
        ) : (
          <>
            <Tooltip title="Inicio" text="Volvé a la pantalla principal para explorar profesionales y rubros en tu zona." position="right">
              <button 
                onClick={() => router.push('/cliente')}
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <HomeIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Inicio</span>
              </button>
            </Tooltip>

            <Tooltip title="Mis solicitudes" text="Hacé seguimiento de tus trabajos solicitados, presupuestos recibidos e historial." position="right">
              <button 
                onClick={() => router.push('/perfil-cliente')}
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <TrabajosIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Solicitudes</span>
              </button>
            </Tooltip>

            <Tooltip title="Publicar trabajo" text="Publicá un nuevo trabajo o necesidad para recibir presupuestos de profesionales." position="right">
              <button 
                onClick={() => router.push('/publicar-trabajo')}
                className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#10b981] hover:scale-105 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                  <PublicarIcon className="w-6 h-6" active={false} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#10b981] uppercase tracking-wider">Publicar</span>
              </button>
            </Tooltip>

            <Tooltip title="Mensajes" text="Chateá con los profesionales seleccionados para coordinar visitas o trabajos." position="right">
              <button className="flex flex-col items-center justify-center gap-1 group text-[#00355f] hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center border border-blue-100 shadow-sm group-hover:shadow-md transition-all">
                  <MensajesIcon className="w-6 h-6" active={true} />
                </div>
                <span className="text-[10px] font-extrabold text-[#00355f] uppercase tracking-wider">Mensajes</span>
              </button>
            </Tooltip>

            <div className="mt-auto mb-6">
              <Tooltip title="Mi Perfil" text="Editá tu información personal, dirección de contacto y preferencias de tu cuenta." position="right">
                <button 
                  onClick={() => router.push('/configuracion-cliente')} 
                  className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                    <ConfiguracionIcon className="w-6 h-6" active={false} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Configurar</span>
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 flex-grow w-full space-y-6">
        
        {/* Título y Buscador */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#00355f] mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>
        
        {/* Lista de Conversaciones */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {conversaciones.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-lg border border-gray-100">
                    {chat.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  {chat.noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#fc8127] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {chat.noLeidos}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#00355f]">{chat.nombre}</h4>
                  <p className={`text-sm mt-0.5 ${chat.noLeidos > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                    {chat.ultimoMensaje}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatIdsConTrabajo.includes(chat.id) && (
                  <span className="bg-blue-50 text-[#00355f] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                    <Hammer className="w-3 h-3" /> En curso
                  </span>
                )}
                <span className="text-[10px] font-medium text-gray-400">{chat.tiempo}</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom NavBar (Mobile - Dinámica) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => router.push(userRole === 'profesional' ? '/panel-profesional' : '/cliente')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          {userRole === 'profesional' ? <LayoutDashboard className="w-5 h-5" /> : <Home className="w-5 h-5" />}
          <span className="text-[10px] font-medium mt-1">{userRole === 'profesional' ? 'Dashboard' : 'Inicio'}</span>
        </button>
        {userRole === 'profesional' ? (
          <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Mis Trabajos</span>
          </button>
        ) : (
          <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Trabajos</span>
          </button>
        )}
        <button className="flex flex-col items-center text-[#fc8127] relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Mensajes</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button onClick={() => router.push(userRole === 'profesional' ? '/configuracion-profesional' : '/perfil-cliente')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}