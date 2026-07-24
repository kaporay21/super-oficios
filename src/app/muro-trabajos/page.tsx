"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Home, Briefcase, MessageSquare, 
  User, PlusCircle, Grid, Wrench, Zap, Paintbrush, 
  Hammer, Sparkles, MapPin, Clock, LayoutDashboard, Send
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';

export default function MuroTrabajosPage() {
  const router = useRouter();
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [presupuestosCount, setPresupuestosCount] = useState(0);
  const [obrasGanadasCount, setObrasGanadasCount] = useState(0);

  useEffect(() => {
    const loadJobsAndStats = async () => {
      try {
        const allJobs = typeof dbHelper.getJobs === 'function' ? await dbHelper.getJobs() : [];
        const clientRequests = (allJobs || []).filter((j: any) => !j.tipo && !j.salario);
        setTrabajos(clientRequests);

        if (typeof dbHelper.getPresupuestos === 'function') {
          const presupuestos = await dbHelper.getPresupuestos();
          setPresupuestosCount(presupuestos ? presupuestos.length : 0);
        } else {
          const stored = JSON.parse(localStorage.getItem('oficiosya_presupuestos_guardados') || '[]');
          setPresupuestosCount(stored.length);
        }

        if (typeof dbHelper.getObras === 'function') {
          const obras = await dbHelper.getObras();
          const ganadas = (obras || []).filter((o: any) => o.estado === 'en-curso' || o.estado === 'finalizada');
          setObrasGanadasCount(ganadas.length);
        } else {
          const stored = JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
          const ganadas = stored.filter((o: any) => o.estado === 'en-curso' || o.estado === 'finalizada');
          setObrasGanadasCount(ganadas.length);
        }
      } catch (error) {
        console.error("Error al cargar muro de trabajos:", error);
      }
    };
    loadJobsAndStats();
  }, []);

  // Lógica de filtrado en tiempo real
  const trabajosFiltrados = categoriaActiva === 'Todos' 
    ? trabajos 
    : trabajos.filter(trabajo => trabajo.categoria === categoriaActiva);

  const categorias = ['Todos', 'Plomería', 'Electricidad', 'Pintura', 'Carpintería', 'Albañilería'];

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-24 pb-24 md:pb-0">
      
      {/* Top AppBar Consistente */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-24" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
          <Tooltip title="Mi Perfil" text="Actualizá tus datos personales, especialidades, coberturas y subí certificados profesionales." position="bottom">
            <div onClick={() => router.push('/configuracion-profesional')} className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold text-sm border border-gray-200 cursor-pointer">
              JP
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
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
          <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
              <MuroIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Muro</span>
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
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8 flex-grow w-full space-y-8">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00355f] mb-2">Muro de Trabajos</h1>
            <p className="text-base text-gray-500 max-w-2xl">Explora las solicitudes recientes en tu zona. Envía presupuestos para ganar el proyecto.</p>
          </div>
          {/* El botón "Publicar un Trabajo" se oculta en esta vista si es exclusiva del profesional, pero lo mantenemos si la plataforma permite dualidad */}
          <button onClick={() => router.push('/publicar-trabajo')} className="bg-[#fc8127] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#e67320] active:scale-95 transition-all w-fit">
            <PlusCircle className="w-5 h-5" /> Publicar Solicitud
          </button>
        </section>

        {/* Categorías (Filtros horizontales Funcionales) */}
        <section className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <div className="flex gap-3">
            {categorias.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategoriaActiva(cat)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  categoriaActiva === cat 
                    ? 'bg-[#00355f] text-white shadow-sm' 
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Listado principal de Trabajos (Filtrado) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-8 space-y-6">
            {trabajosFiltrados.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-[#00355f]">No hay trabajos en esta categoría</h3>
                <p className="text-sm text-gray-500 mt-2">Intenta seleccionando "Todos" o busca en otro momento.</p>
              </div>
            ) : (
              trabajosFiltrados.map((job) => (
                <article key={job.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden hover:shadow-md transition-shadow">
                  {job.urgente && (
                    <div className="absolute top-0 right-0 z-10">
                      <span className="bg-[#fc8127] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">Urgente</span>
                    </div>
                  )}
                  <div className="w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                    <img className="absolute inset-0 w-full h-full object-cover" src={job.imagen} alt={job.titulo} />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-black text-[#00355f] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{job.categoria}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-3">{job.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{job.descripcion}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-1.5 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {job.ubicacion}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Publicado {job.tiempo}</span>
                      </div>
                      <button onClick={() => router.push('/mis-trabajos')} className="bg-[#00355f] hover:bg-[#0f4c81] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm sm:w-auto w-full flex justify-center">
                        Enviar Presupuesto
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6">
            <div className="bg-[#00355f] text-white p-6 rounded-2xl shadow-lg space-y-4">
              <h4 className="text-lg font-bold">Tu Actividad</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Presupuestos enviados</span><span className="font-bold text-lg text-[#fc8127]">{presupuestosCount}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Trabajos ganados</span><span className="font-bold text-lg text-[#fc8127]">{obrasGanadasCount}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-[#00355f]">Sugeridos cerca tuyo</h4>
              <div className="space-y-4 text-sm divide-y divide-gray-100">
                <div className="pt-2">
                  <p className="font-bold text-gray-900 cursor-pointer hover:text-[#fc8127]">Instalación Termotanque</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-gray-400" /> San Miguel de Tucumán</p>
                </div>
                <div className="pt-3">
                  <p className="font-bold text-gray-900 cursor-pointer hover:text-[#fc8127]">Cortocircuito en cocina</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-gray-400" /> San Andrés</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Dashboard</span></button>
        <button className="flex flex-col items-center text-[#fc8127]"><Grid className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Muro</span></button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><MessageSquare className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Chat</span></button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><User className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Perfil</span></button>
      </nav>
    </div>
  );
}