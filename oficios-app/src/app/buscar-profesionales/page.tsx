"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Search, MapPin, Star, MessageSquare, ClipboardList, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
// Asumo que tienes tu data simulada aquí. Si no, reemplázalo por tu fuente de datos real.
import { PROFESSIONALS } from '@/data'; 

function BuscadorContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Capturamos los parámetros que vienen de la Landing Page
  const oficioParam = searchParams.get('oficio') || '';
  const provinciaParam = searchParams.get('provincia') || '';

  // Estados de búsqueda
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sincronizamos los parámetros de la URL con el buscador interno al cargar la página
  useEffect(() => {
    let initialSearch = '';
    if (oficioParam) {
      // Si el oficio coincide con una categoría, la seleccionamos
      const lowerOficio = oficioParam.toLowerCase();
      if (['plomería', 'electricidad', 'albañilería', 'pintura', 'carpintería'].includes(lowerOficio)) {
        // Quitamos tildes para el ID si es necesario o lo mapeamos
        const normalizedId = lowerOficio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        setSelectedCategory(normalizedId);
      } else {
        initialSearch += oficioParam + ' ';
      }
    }
    if (provinciaParam) {
      initialSearch += provinciaParam;
    }
    if (initialSearch.trim()) {
      setSearchQuery(initialSearch.trim());
    }
  }, [oficioParam, provinciaParam]);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'plomeria', label: 'Plomería' },
    { id: 'electricidad', label: 'Electricidad' },
    { id: 'albanileria', label: 'Albañilería' },
    { id: 'pintura', label: 'Pintura' },
    { id: 'carpinteria', label: 'Carpintería' },
  ];

  // Lógica de filtrado
  const filteredProfessionals = useMemo(() => {
    return PROFESSIONALS.filter((pro) => {
      // Normalizamos categoría para comparar
      const proCat = pro.category ? pro.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      const matchesCategory = selectedCategory === 'todos' || proCat === selectedCategory;
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        pro.name.toLowerCase().includes(query) ||
        pro.trade.toLowerCase().includes(query) ||
        pro.location.toLowerCase().includes(query);
        
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#0f4c81] selection:text-white">
      
      {/* Cabecera Superior (Pública) */}
      <header className="bg-white/95 backdrop-blur-sm px-4 py-3 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
               <span className="text-xl">👷🏻‍♂️</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#00355f] leading-tight tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></span>
            </div>
          </div>
          
          {/* Botones de Registro/Login públicos */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/bienvenida')}
              className="text-[#00355f] font-bold text-sm hover:underline hidden md:block"
            >
              Crear cuenta
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="bg-[#00355f] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#0f4c81] transition-colors shadow-sm active:scale-95"
            >
              Ingresar
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        
        {/* Título de Bienvenida */}
        <section className="text-center bg-white py-12 px-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00355f] leading-tight">
            Directorio de Profesionales
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
            Explorá los perfiles de nuestros expertos verificados. Para solicitar presupuestos y gestionar tus trabajos, crea tu cuenta gratuita.
          </p>
        </section>

        {/* === NUEVO CTA: REGÍSTRATE PARA PEDIR PRESUPUESTO === */}
        <section className="bg-gradient-to-r from-[#fc8127] to-[#e67320] rounded-3xl p-1 shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white/95 backdrop-blur-md rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute -right-10 -top-10 text-[#fc8127] opacity-10 pointer-events-none">
              <ClipboardList className="w-64 h-64" />
            </div>
            
            <div className="relative z-10 text-center md:text-left flex-1">
              <span className="inline-block bg-[#fc8127]/10 text-[#fc8127] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                Para Clientes
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-2 leading-tight">
                ¿Querés recibir propuestas exactas?
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-0">
                Registrate en segundos, publicá lo que necesitás arreglar y dejá que los profesionales te envíen sus presupuestos directamente a tu panel. <strong>¡Es gratis!</strong>
              </p>
            </div>
            
            <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center md:justify-end">
              <button 
                onClick={() => router.push('/registro-cliente')}
                className="w-full md:w-auto bg-[#00355f] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0f4c81] shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
              >
                Registrarme y pedir presupuesto
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Buscador y Filtros */}
        <section className="space-y-4">
          <div className="bg-[#00355f] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-md">
            <h2 className="text-xl md:text-2xl font-bold mb-4">¿A quién estás buscando?</h2>
            <div className="flex items-center bg-white rounded-xl px-4 py-3 md:py-4 shadow-sm">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Plomero en Tucumán..."
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 text-sm md:text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Filtros de Categorías */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0 w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
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

        {/* Profesionales Destacados */}
        <section className="space-y-4">
          <div className="flex justify-between items-end border-b border-gray-200 pb-2">
            <h3 className="text-xl font-bold text-[#00355f] leading-tight">Profesionales Disponibles</h3>
            {searchQuery && (
              <span className="text-sm font-bold text-[#fc8127]">
                Resultados para "{searchQuery}"
              </span>
            )}
          </div>

          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-bold text-[#00355f]">No encontramos coincidencias</p>
              <p className="text-gray-500 text-sm mt-1">Prueba buscando otro oficio o modificando la zona.</p>
              <button onClick={() => {setSearchQuery(''); setSelectedCategory('todos');}} className="mt-4 text-[#fc8127] font-bold hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {filteredProfessionals.map((pro) => (
                <div
                  key={pro.id}
                  onClick={() => router.push(`/profesional/${pro.id}`)}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group"
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
                        <span className="line-clamp-1">{pro.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que se abra el perfil
                          router.push('/login'); // Redirige al login para contactar
                        }} 
                        className="flex-1 py-2.5 bg-gray-100 text-[#00355f] rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95"
                      >
                        Ver Perfil
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/login');
                        }}
                        className="px-4 py-2.5 bg-[#00355f] text-white rounded-xl hover:bg-[#0f4c81] transition-colors active:scale-95 flex items-center justify-center shadow-sm"
                        title="Inicia sesión para chatear"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

// Envolvemos la página en un componente Suspense para que Next.js pueda manejar el useSearchParams correctamente
export default function BuscarProfesionalesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-bold text-[#00355f]">Cargando directorio...</div>}>
      <BuscadorContenido />
    </Suspense>
  );
}