"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, FileText, Star, Award, Zap, MessageSquare, 
  User, Home, Briefcase, PlusCircle, ArrowLeft, Loader2, ClipboardCheck
} from 'lucide-react';
import Logo from '@/components/Logo';
import Tooltip from '@/components/Tooltip';
import { HomeIcon, PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, PublicarIcon } from '@/components/ModernIcons';

import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function CompararPresupuestosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [aceptandoId, setAceptandoId] = useState<string | number | null>(null);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRealPresupuestos = async () => {
      try {
        const postulaciones = await dbHelper.getAllPostulaciones();
        
        // Enrich with real professional details from Supabase
        const list = await Promise.all(postulaciones.map(async (post, idx) => {
          return {
            id: post.id || idx,
            nombre: post.candidato || 'Profesional',
            rating: 5.0,
            resenas: 1,
            precio: 15000,
            tiempo: 'A convenir',
            etiqueta: post.estado === 'Aceptado' ? 'Aceptado' : 'Propuesta Recibida',
            etiquetaIcon: <Star className="w-4 h-4" />,
            etiquetaColor: post.estado === 'Aceptado' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800',
            avatar: post.candidatoAvatar || 'https://i.pravatar.cc/150?u=' + (post.candidato || idx),
            mensaje: post.mensaje
          };
        }));

        setPresupuestos(list);
      } catch (err) {
        console.error("Error al cargar presupuestos reales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRealPresupuestos();
  }, []);

  const handleAceptar = async (id: any) => {
    if (!user) return;
    setAceptandoId(id);

    const elegido = presupuestos.find(p => p.id === id);
    if (elegido) {
      try {
        // Create or get real Supabase conversation
        const conv = await dbHelper.getOrCreateConversation(user.id, elegido.nombre);
        if (conv?.id) {
          router.push(`/chat/${conv.id}`);
          return;
        }
      } catch (err) {
        console.warn("Error iniciando chat real:", err);
      }
    }

    setTimeout(() => {
      setAceptandoId(null);
      router.push('/chat');
    }, 1000);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors relative z-10">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Centered Logo with Mascot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10" onClick={() => router.push('/cliente')}>
          <Logo size="md" theme="light" />
        </div>

        <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full relative z-10 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      {/* Navegación Lateral Desktop con Tooltips */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-50 flex-col items-center py-8 gap-5 select-none shadow-sm">

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
            className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
              <TrabajosIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Solicitudes</span>
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
      </div>

      <main className="mt-20 flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-2 tracking-tight">Presupuestos Recibidos</h1>
          <p className="text-gray-500 text-sm mb-4 font-medium">Reparación de Cañería en Cocina</p>
          <div className="flex items-center gap-2 text-[#00355f] font-bold bg-white border border-gray-200 px-4 py-2.5 rounded-2xl w-fit shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-[#fc8127]" />
            <span>Hay {presupuestos.length} propuestas para vos</span>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#fc8127] animate-spin" />
            </div>
          ) : presupuestos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 text-base mb-1">Aún no hay presupuestos para mostrar</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">Cuando los profesionales se postulen a tus búsquedas, aparecerán comparados en esta pantalla.</p>
              <button onClick={() => router.push('/publicar-trabajo')} className="bg-[#00355f] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0f4c81]">
                Publicar Nuevo Trabajo
              </button>
            </div>
          ) : (
            presupuestos.map((presu) => (
            <div key={presu.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              
              {/* Etiqueta Destacada */}
              <div className="absolute top-0 right-0">
                <span className={`${presu.etiquetaColor} font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm`}>
                  {presu.etiquetaIcon} {presu.etiqueta}
                </span>
              </div>

              {/* Perfil del Profesional */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                  <img className="w-full h-full object-cover" src={presu.avatar} alt={presu.nombre} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00355f] mb-1">{presu.nombre}</h3>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#fc8127] text-[#fc8127]" />
                    <span className="font-bold text-sm text-gray-900">{presu.rating}</span>
                    <span className="text-xs text-gray-400 font-medium">({presu.resenas} opiniones)</span>
                  </div>
                </div>
              </div>

              {/* Grid de Precio y Tiempo */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Costo Estimado</p>
                  <p className="text-2xl font-black text-[#00355f]">${presu.precio.toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Disponibilidad</p>
                  <p className="text-lg font-bold text-gray-800">{presu.tiempo}</p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push(`/profesional/${presu.id}`)}
                  className="flex-1 border-2 border-[#00355f] text-[#00355f] font-bold text-sm py-3.5 rounded-xl hover:bg-blue-50 transition-colors active:scale-95"
                >
                  Ver Perfil
                </button>
                <button 
                  onClick={() => handleAceptar(presu.id)}
                  disabled={aceptandoId !== null}
                  className="flex-[1.5] bg-[#00355f] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-[#0f4c81] transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {aceptandoId === presu.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                  ) : (
                    'Elegir y Chatear'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-10 p-6 bg-gradient-to-br from-[#00355f] to-[#0a4270] rounded-[2rem] text-white flex gap-5 items-center shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <ClipboardCheck className="w-32 h-32" />
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-lg font-bold mb-1">Coordiná con tranquilidad</p>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              Al aceptar una propuesta, se habilitará un chat privado con el profesional para que puedan coordinar la visita, los materiales y el horario del trabajo directamente.
            </p>
          </div>
        </div>

      </main>

      {/* Bottom NavBar (Mobile - Client Version) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {/* Botón Home apuntando a /cliente */}
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-[#fc8127]">
          <Briefcase className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Trabajos</span>
        </button>
        <button onClick={() => router.push('/publicar-trabajo')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Publicar</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] relative">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>

    </div>
  );
}