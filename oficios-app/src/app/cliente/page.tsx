"use client";

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, MessageSquare, Plus, Bell, Menu, Home, ClipboardList, User } from 'lucide-react';
import { PROFESSIONALS, MOCK_JOBS } from '@/data';
import { Screen, Professional, Job } from '@/types';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // Función actualizada para manejar la navegación
  const handleNavigate = (screen: Screen | 'publish_job') => {
    if (screen === 'profile_client') router.push('/perfil-cliente'); // Ajustado a la ruta correcta
    if (screen === 'register_pro') router.push('/registro-profesional');
    
    // AHORA REDIRIGE DIRECTO A COMPARAR PRESUPUESTOS
    if (screen === 'job_detail') router.push('/comparar-presupuestos'); 
    
    if (screen === 'publish_job') router.push('/publicar-trabajo'); // Nueva ruta agregada
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#0f4c81] selection:text-white">
      {/* Cabecera Superior (Full Width con contenedor interno) */}
      <header className="bg-white px-4 py-3 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          {/* Logo y Menú */}
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-600 cursor-pointer md:hidden" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                 <span className="text-xl">👷🏻‍♂️</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-[#00355f] leading-tight tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></span>
                <span className="text-[10px] text-[#00355f] font-medium leading-tight">lo que buscas a un click</span>
              </div>
            </div>
          </div>
          
          {/* Iconos derechos y Usuario */}
          <div className="flex items-center gap-5">
            <Search className="text-[#00355f] w-5 h-5 cursor-pointer hidden md:block" />
            <div className="relative cursor-pointer">
              <Bell className="text-[#00355f] w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div 
              className="hidden md:flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/perfil-cliente')}
            >
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas" alt="Diego M." className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
              <span className="text-sm font-semibold text-gray-700">Diego M.</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal (Limitado en ancho para pantallas grandes) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        <HomeClient 
          onNavigate={handleNavigate} 
          postedJobs={MOCK_JOBS} 
        />
      </div>

      {/* Navegación Inferior (Visible en móviles, adaptable en escritorio) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 z-50 pb-safe">
        <div className="max-w-7xl mx-auto w-full flex justify-between md:justify-center md:gap-24 items-center">
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="text-[#00355f] p-1.5">
              <Home className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[11px] font-bold text-[#00355f]">Explorar</span>
          </div>
          
          {/* Botón Publicar conectado */}
          <div 
            onClick={() => handleNavigate('publish_job')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#fc8127] cursor-pointer transition-colors active:scale-95"
          >
            <div className="p-1.5">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium">Publicar</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer relative">
            <div className="p-1.5">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <span className="text-[11px] font-medium">Notificaciones</span>
          </div>

          <div 
            onClick={() => router.push('/perfil-cliente')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00355f] cursor-pointer transition-colors active:scale-95"
          >
            <div className="p-1.5 relative">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium">Perfil</span>
          </div>
        </div>
      </nav>

      {/* Botón Flotante Naranja conectado */}
      <button
        onClick={() => handleNavigate('publish_job')}
        className="fixed bottom-24 right-6 md:right-12 w-14 h-14 bg-[#fc8127] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
        title="Publicar Trabajo"
      >
        <Plus className="w-8 h-8" />
      </button>
    </main>
  );
}

// --- COMPONENTE CLIENTE --- //

interface HomeClientProps {
  onNavigate: (screen: Screen | 'publish_job') => void;
  onSelectPro?: (pro: Professional) => void;
  postedJobs: Job[];
}

const HomeClient: React.FC<HomeClientProps> = ({
  onNavigate,
  onSelectPro,
  postedJobs
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedScreen] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'plomeria', label: 'Plomería' },
    { id: 'electricidad', label: 'Electricidad' },
    { id: 'albanileria', label: 'Albañilería' },
    { id: 'pintura', label: 'Pintura' },
    { id: 'carpinteria', label: 'Carpintería' },
  ];

  const filteredProfessionals = useMemo(() => {
    return PROFESSIONALS.filter((pro) => {
      const matchesCategory = selectedCategory === 'todos' || pro.category === selectedCategory;
      const matchesSearch = pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pro.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pro.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 pb-10">
      
      {/* Título de Bienvenida */}
      <section className="text-center bg-white py-12 px-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#00355f] leading-tight">
          Encontrá al profesional que necesitás hoy
        </h1>
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          Conectamos tus necesidades con expertos verificados y de confianza en tu zona.
        </p>
      </section>

      {/* Buscador y Filtros */}
      <section className="space-y-4">
        <div className="bg-[#00355f] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-md">
          <h2 className="text-xl md:text-2xl font-bold mb-4">¿Qué oficio necesitas hoy?</h2>
          <div className="flex items-center bg-white rounded-xl px-4 py-3 md:py-4 shadow-sm">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: Plomero matriculado..."
              className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 text-sm md:text-base placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Ubicación y Botones de Filtro */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <MapPin className="w-5 h-5 text-[#00355f]" />
            <span className="text-xs md:text-sm font-semibold">Mostrando en:</span>
            <button className="flex items-center gap-1 font-bold text-[#00355f] text-xs md:text-sm">
              San Miguel de Tucumán, Argentina
              <span className="text-[10px]">▼</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0 w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedScreen(cat.id)}
                className={`px-5 py-2 md:py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat.id
                    ? 'bg-[#fc8127] text-white font-bold'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona OficiosYa? */}
      <section className="bg-white py-10 px-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-bold text-[#00355f] mb-10 text-center">¿Cómo funciona OficiosYa?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-lg">1</div>
            <h4 className="font-bold text-gray-900">Busca tu oficio</h4>
            <p className="text-sm text-gray-500 leading-relaxed px-4">Encontrá exactamente lo que necesitás entre cientos de categorías.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-lg">2</div>
            <h4 className="font-bold text-gray-900">Mirá perfiles y reseñas</h4>
            <p className="text-sm text-gray-500 leading-relaxed px-4">Elegí con confianza basándote en la experiencia de otros usuarios.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-lg">3</div>
            <h4 className="font-bold text-gray-900">Contactalo y recibí presupuestos</h4>
            <p className="text-sm text-gray-500 leading-relaxed px-4">Chateá directamente y coordiná el trabajo en minutos.</p>
          </div>
        </div>
      </section>

      {/* Tus Pedidos Activos */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-[#00355f]">Tus Pedidos Activos</h3>
          <button onClick={() => onNavigate('profile_client')} className="font-bold text-sm hover:underline text-[#00355f]">
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          {postedJobs.map((job, index) => (
            <div 
              key={job.id}
              onClick={() => onNavigate('job_detail')}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#fc8127]/50 transition-all cursor-pointer flex flex-col justify-between relative"
            >
              {/* NUEVO: Globo de notificaciones de presupuestos simulado en la primera tarjeta */}
              {index === 0 && (
                <div className="absolute -top-2 -right-2 bg-[#fc8127] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white z-10 animate-pulse">
                  3 Presupuestos
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-[#00355f]" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    job.urgency === 'urgent' ? 'bg-red-50 text-red-600' : 
                    job.urgency === 'pending' ? 'bg-orange-50 text-[#fc8127]' : 'bg-blue-50 text-[#00355f]'
                  }`}>
                    {job.urgency === 'urgent' ? 'Urgente' : job.urgency === 'pending' ? 'Pendiente' : 'Normal'}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{job.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-50">
                <span className="text-[11px] text-gray-400">{job.timeAgo}</span>
                <span className="text-[#00355f] font-bold text-xs hover:underline">Detalles</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profesionales Destacados */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-[#00355f] leading-tight">Profesionales Destacados</h3>
          <button onClick={() => setSelectedScreen('todos')} className="font-bold text-sm text-[#00355f] hover:underline">
            Explorar más
          </button>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
            <p className="text-gray-500">No se encontraron profesionales para esta búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {filteredProfessionals.map((pro) => (
              <div
                key={pro.id}
                onClick={() => {
                  if (onSelectPro) onSelectPro(pro);
                  router.push(`/profesional/${pro.id}`);
                }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                <div className="h-48 w-full relative bg-gray-200 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={pro.avatar}
                    alt={pro.name}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" />
                    <span className="font-bold text-xs text-green-700">{pro.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#00355f] transition-colors">
                      {pro.name}
                    </h4>
                    <p className="text-[11px] font-extrabold text-[#fc8127] tracking-wider uppercase mt-1">
                      {pro.trade}
                    </p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 mb-5">
                      <MapPin className="w-4 h-4 text-[#00355f]" />
                      <span>{pro.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-[#00355f] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#0f4c81] transition-colors active:scale-95">
                      Contactar
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-[#00355f] hover:bg-gray-50 transition-colors active:scale-95 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Profesional */}
      <section className="bg-[#00355f] text-white p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-3">¿Sos profesional?</h3>
          <p className="text-sm md:text-base text-blue-100 leading-relaxed">
            ¡Llevá tu trabajo al siguiente nivel! Unite a la red más grande de profesionales y empezá a recibir trabajos hoy mismo.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('register_pro')}
            className="bg-[#fc8127] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
          >
            Registrarme gratis
          </button>
        </div>
        {/* Elemento decorativo */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
};