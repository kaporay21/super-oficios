"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Home, Briefcase, MessageSquare, 
  User, PlusCircle, Grid, Wrench, Zap, Paintbrush, 
  Hammer, Sparkles, MapPin, Clock, LayoutDashboard, Send
} from 'lucide-react';

export default function MuroTrabajosPage() {
  const router = useRouter();
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  // Datos simulados con ubicaciones realistas
  const trabajosRecientes = [
    {
      id: 1,
      categoria: 'Plomería',
      titulo: 'Arreglo de filtración en cocina',
      descripcion: 'Tengo una filtración persistentemente bajo la bacha de la cocina. El agua está dañando el mueble de melamina. Necesito a alguien que pueda venir hoy mismo para sellar o cambiar la cañería.',
      ubicacion: 'San Miguel de Tucumán (Centro)',
      tiempo: 'Hace 2 horas',
      urgente: true,
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATY8flL-MfyUm7rRccSGypPj-4UZKhm6f0Ld8Js-Y3Jem5W4lOqCr4eCWve4w8GwhlgYq5_JMnjV928e9nnbYOIJ0_Vb3PBLDdYHjIHjm4GOVsvEqzw7lHHUakYr-msGguBzKQF4ZeG8gJQLTVna6m7YHvOnOS9yTXxcpYeW0sTz_2ahlhfSiqOgKIs_kLSXZichHSHpzZjY9mUyh6N_OeICgK1KO023Svr-TJkSWtaZ4YW9670CZZoUh3lBF4qNu3gM5PpcyYXATG'
    },
    {
      id: 2,
      categoria: 'Pintura',
      titulo: 'Pintura completa Living-Comedor',
      descripcion: 'Busco profesional para pintar living comedor de 30m2. Incluye techos y paredes. Ya tengo la pintura (Látex blanco). Se requiere prolijidad y protección de muebles.',
      ubicacion: 'Yerba Buena',
      tiempo: 'Hace 5 horas',
      urgente: false,
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb-W4v2n8yXJgm8B_mKWEbh7vmFUZ53RTZo5Aex4dV35aB1SOIXiV6ZiiF8pLuuKkgv_kn9bykdrz2CTKzH7Kbs0WfVta21vr5Edr-TqV5nRDNkfDITwOvY2fjD7PyoP6ABekmRThM21UqASk6qkQspB_KT7SJpNu5in3dFPAnXfrhB8Vi2x7YA2SZRqzRqajwMcnZpPBbv5paAdBVBtqjd6O4umbYgfVzWhELpsciINDerv85olpP404f7JNT6B62JwSwmwKckkP1'
    }
  ];

  // Lógica de filtrado en tiempo real
  const trabajosFiltrados = categoriaActiva === 'Todos' 
    ? trabajosRecientes 
    : trabajosRecientes.filter(trabajo => trabajo.categoria === categoriaActiva);

  const categorias = ['Todos', 'Plomería', 'Electricidad', 'Pintura', 'Carpintería', 'Albañilería'];

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0">
      
      {/* Top AppBar Consistente */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-20" onClick={() => router.push('/panel-profesional')}>
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
             <span className="text-xl">👷🏻‍♂️</span>
          </div>
          <h1 className="font-extrabold text-lg text-[#00355f] leading-none">
            Oficios<span className="text-[#fc8127]">Ya</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/notificaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div onClick={() => router.push('/configuracion-profesional')} className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold text-sm border border-gray-200 cursor-pointer">
            JP
          </div>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/panel-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><LayoutDashboard className="w-6 h-6" /></button>
        <button className="w-12 h-12 bg-[#fc8127] text-white rounded-xl flex items-center justify-center shadow-md"><Grid className="w-6 h-6" /></button>
        <button onClick={() => router.push('/mis-trabajos')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Briefcase className="w-6 h-6" /></button>
        <button onClick={() => router.push('/chat')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><MessageSquare className="w-6 h-6" /></button>
        <div className="mt-auto mb-6">
          <button onClick={() => router.push('/configuracion-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
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
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Presupuestos enviados</span><span className="font-bold text-lg text-[#fc8127]">12</span></div>
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Trabajos ganados</span><span className="font-bold text-lg text-[#fc8127]">4</span></div>
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