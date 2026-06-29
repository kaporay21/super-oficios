"use client";

import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, MessageCircle, Plus, LayoutList, User, Home, MessageSquare } from 'lucide-react';
import { PROFESSIONALS, MOCK_JOBS } from '@/data';
import { Screen, Professional, Job } from '@/types';

export default function HomePage() {
  // Simulamos la navegación por ahora
  const handleNavigate = (screen: Screen) => {
    console.log("Navegando a:", screen);
    // Aquí luego implementaremos el enrutamiento real de Next.js
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header Fijo */}
      <header className="bg-white px-4 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
             <span className="text-xl">👷🏻‍♂️</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-[#00355f] leading-tight">OficiosYa</span>
            <span className="text-[10px] text-gray-500 leading-tight">lo que buscas a un click</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Search className="text-[#00355f] w-6 h-6" />
          <SlidersHorizontal className="text-[#00355f] w-6 h-6 cursor-pointer hover:opacity-80" />
        </div>
      </header>

      <div className="px-4 mt-4">
        <HomeClient 
          onNavigate={handleNavigate} 
          postedJobs={MOCK_JOBS} 
        />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <div className="bg-[#00355f] text-white p-1.5 rounded-lg">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium text-[#00355f]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <div className="p-1.5">
            <LayoutList className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Feed</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <div className="p-1.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Messages</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer">
          <div className="p-1.5">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </nav>
    </main>
  );
}

// --- COMPONENTE CLIENTE CON LÓGICA DE FILTRADO --- //

interface HomeClientProps {
  onNavigate: (screen: Screen) => void;
  onSelectPro?: (pro: Professional) => void;
  postedJobs: Job[];
}

const HomeClient: React.FC<HomeClientProps> = ({
  onNavigate,
  onSelectPro,
  postedJobs
}) => {
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
    <div className="space-y-8 pb-10">
      {/* Banner de Bienvenida */}
      <section className="text-center py-8 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-2xl font-extrabold text-[#00355f] leading-tight">
          Encontrá al profesional que necesitás hoy
        </h2>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          Conectamos tus necesidades con expertos verificados y de confianza en tu zona.
        </p>
      </section>

      {/* Bloque de Búsqueda */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-[#00355f] p-6 text-white mb-4 shadow-md">
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-bold">¿Qué oficio necesitas hoy?</h3>
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Plomero matriculado..."
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-2 mb-4 text-gray-500 px-2">
          <MapPin className="w-5 h-5 text-[#00355f]" />
          <span className="text-xs font-semibold">Mostrando en:</span>
          <button className="flex items-center gap-1 font-bold text-[#00355f] text-xs">
            Tucumán, Argentina
            <span className="text-[10px]">▼</span>
          </button>
        </div>

        {/* Chips de Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pr-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedScreen(cat.id)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-[#fc8127] text-white font-bold'
                  : 'bg-white border border-gray-200 text-gray-600 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-[#00355f] mb-6 text-center">¿Cómo funciona OficiosYa?</h3>
        <div className="flex flex-col gap-6 relative">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-gray-900 text-sm">Busca tu oficio</h4>
            <p className="text-xs text-gray-500 leading-relaxed px-4">Encontrá exactamente lo que necesitás entre cientos de categorías.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-gray-900 text-sm">Mirá perfiles y reseñas</h4>
            <p className="text-xs text-gray-500 leading-relaxed px-4">Elegí con confianza basándote en la experiencia de otros usuarios.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-gray-900 text-sm">Contactalo y recibí presupuestos</h4>
            <p className="text-xs text-gray-500 leading-relaxed px-4">Chateá directamente y coordiná el trabajo en minutos.</p>
          </div>
        </div>
      </section>

      {/* Pedidos Activos */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-bold text-[#00355f]">Tus Pedidos Activos</h3>
          <button onClick={() => onNavigate('profile_client')} className="font-bold text-xs hover:underline text-gray-500">
            Ver todos
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {postedJobs.map((job) => (
            <div 
              key={job.id}
              onClick={() => onNavigate('job_detail')}
              className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-start gap-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5 text-[#fc8127]" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                    job.urgency === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-[#fc8127]'
                  }`}>
                    {job.urgency === 'urgent' ? 'Urgente' : 'Pendiente'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{job.description}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-gray-400">{job.timeAgo}</span>
                  <span className="text-[#00355f] font-bold text-xs">Detalles</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profesionales Destacados */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-bold text-[#00355f] leading-tight">Profesionales<br/>Destacados</h3>
          <button onClick={() => setSelectedScreen('todos')} className="font-medium text-xs text-gray-500">
            Explorar<br/>más
          </button>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-8 bg-white border border-gray-100 rounded-xl">
            <p className="text-gray-500 text-sm">No se encontraron profesionales para esta búsqueda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredProfessionals.map((pro) => (
              <div
                key={pro.id}
                onClick={() => {
                  if (onSelectPro) onSelectPro(pro);
                  onNavigate('job_detail');
                }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer pb-4"
              >
                <div className="h-40 w-full relative bg-gray-200">
                  <img
                    className="w-full h-full object-cover"
                    src={pro.avatar}
                    alt={pro.name}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-green-700 text-green-700" />
                    <span className="font-bold text-xs text-green-700">{pro.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="px-4 pt-4 space-y-1">
                  <h4 className="font-bold text-lg text-gray-900">
                    {pro.name}
                  </h4>
                  <p className="text-[10px] font-bold text-[#fc8127] tracking-wide uppercase">
                    {pro.trade}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-2 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{pro.location}</span>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-2.5 bg-[#00355f] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#0f4c81] transition-colors">
                      Contactar
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-[#00355f] shadow-sm flex items-center justify-center hover:bg-gray-50">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Profesional */}
      <section className="bg-[#00355f] text-white p-6 rounded-2xl relative overflow-hidden shadow-md">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-3">¿Sos profesional?</h3>
          <p className="text-xs text-blue-100 mb-5 pr-10 leading-relaxed">
            ¡Llevá tu trabajo al siguiente nivel! Unite a la red más grande de profesionales y empezá a recibir trabajos hoy mismo.
          </p>
          <button
            onClick={() => onNavigate('register_pro')}
            className="bg-[#fc8127] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md"
          >
            Registrarme ahora
          </button>
        </div>
        <div className="absolute -bottom-3 -right-3 bg-[#fc8127] w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
           <Plus className="w-6 h-6 text-white" />
        </div>
      </section>
    </div>
  );
};