"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Search, MapPin, Star, MessageSquare, ClipboardList, ArrowRight, Sparkles, CheckCircle, Award } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dbHelper } from '@/lib/supabase';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';

const CAROUSEL_CARDS = [
  { id: 'plomeria', label: 'Plomería', img: '/images/oficio_plomeria_m_1784427462868.png', color: 'from-[#00355f]/90' },
  { id: 'electricidad', label: 'Electricidad', img: '/images/oficio_electricidad_m_1784427470881.png', color: 'from-[#fc8127]/90' },
  { id: 'albanileria', label: 'Albañilería', img: '/images/oficio_albanileria_m_1784427479131.png', color: 'from-[#00355f]/90' },
  { id: 'pintura', label: 'Pintura', img: '/images/oficio_pintura_m_1784427486978.png', color: 'from-[#fc8127]/90' },
  { id: 'carpinteria', label: 'Carpintería', img: '/images/oficio_carpinteria_1784426158760.png', color: 'from-[#00355f]/90' },
  { id: 'jardineria', label: 'Jardinería', img: '/images/oficio_jardineria_1784426924675.png', color: 'from-[#fc8127]/90' },
  { id: 'limpieza', label: 'Limpieza', img: '/images/oficio_limpieza_1784426932346.png', color: 'from-[#00355f]/90' },
];

function BuscadorContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    const fetchPros = async () => {
      try {
        const users = await dbHelper.getAllUsers();
        const pros = users.filter((u: any) => u.role === 'Profesional');
        setProfessionals(pros);
      } catch (err) {
        console.error("Error al cargar profesionales:", err);
      }
    };
    fetchPros();
  }, []);

  const isMasterPlan = (proId: string | number) => {
    const pro = professionals.find(p => p.id === proId);
    if (pro) {
      return pro.plan === 'Master';
    }
    return false;
  };
  
  // Capturamos los parámetros que vienen de la Landing Page
  const oficioParam = searchParams.get('oficio') || '';
  const provinciaParam = searchParams.get('provincia') || '';

  // Estados de búsqueda y filtros avanzados
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [provinciaFiltro, setProvinciaFiltro] = useState<string>('');
  const [soloVerificados, setSoloVerificados] = useState<boolean>(false);
  const [soloMatriculados, setSoloMatriculados] = useState<boolean>(false);
  const [ordenarPor, setOrdenarPor] = useState<'destacados' | 'rating' | 'experiencia'>('destacados');

  const provinciasArgentinas = [
    'Buenos Aires',
    'CABA (Ciudad Autónoma de Buenos Aires)',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

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
      setProvinciaFiltro(provinciaParam);
    }
  }, [oficioParam, provinciaParam]);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'plomeria', label: 'Plomería' },
    { id: 'electricidad', label: 'Electricidad' },
    { id: 'albanileria', label: 'Albañilería' },
    { id: 'pintura', label: 'Pintura' },
    { id: 'carpinteria', label: 'Carpintería' },
    { id: 'gasista', label: 'Gasista' },
    { id: 'cerrajeria', label: 'Cerrajería' },
    { id: 'durlock', label: 'Durlock / Yeso' },
    { id: 'aire', label: 'Aire Acondicionado' },
    { id: 'jardineria', label: 'Jardinería' },
    { id: 'fumigacion', label: 'Fumigación' },
    { id: 'herreria', label: 'Herrería' },
    { id: 'techista', label: 'Techista' },
    { id: 'fletes', label: 'Fletes y Mudanzas' }
  ];

  // Lógica de filtrado inteligente multi-palabra, región y sin acentos
  const filteredProfessionals = useMemo(() => {
    return professionals.filter((pro) => {
      // 1. Filtrado por Categoría de botones superiores
      const proCat = pro.category ? pro.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
      
      // Mapeamos los IDs de los botones a coincidencias reales
      let matchesCategory = selectedCategory === 'todos';
      if (selectedCategory === 'plomeria') matchesCategory = proCat === 'plomeria' || pro.trade.toLowerCase().includes('plomero');
      else if (selectedCategory === 'electricidad') matchesCategory = proCat === 'electricidad' || pro.trade.toLowerCase().includes('electricista');
      else if (selectedCategory === 'albanileria') matchesCategory = proCat === 'albanileria' || pro.trade.toLowerCase().includes('albañil') || pro.trade.toLowerCase().includes('albanil');
      else if (selectedCategory === 'pintura') matchesCategory = proCat === 'pintura' || pro.trade.toLowerCase().includes('pintor');
      else if (selectedCategory === 'carpinteria') matchesCategory = proCat === 'carpinteria' || pro.trade.toLowerCase().includes('carpintero');
      else if (selectedCategory === 'gasista') matchesCategory = pro.trade.toLowerCase().includes('gasista');
      else if (selectedCategory === 'cerrajeria') matchesCategory = pro.trade.toLowerCase().includes('cerrajero') || pro.trade.toLowerCase().includes('cerrajería');
      else if (selectedCategory === 'durlock') matchesCategory = pro.trade.toLowerCase().includes('durlock') || pro.trade.toLowerCase().includes('yesero') || pro.trade.toLowerCase().includes('yeso');
      else if (selectedCategory === 'aire') matchesCategory = pro.trade.toLowerCase().includes('aire') || pro.trade.toLowerCase().includes('acondicionado') || pro.trade.toLowerCase().includes('climatizacion');
      else if (selectedCategory === 'jardineria') matchesCategory = pro.trade.toLowerCase().includes('jardín') || pro.trade.toLowerCase().includes('jardinero') || pro.trade.toLowerCase().includes('jardinería');
      else if (selectedCategory === 'fumigacion') matchesCategory = pro.trade.toLowerCase().includes('fumigador') || pro.trade.toLowerCase().includes('fumigación') || pro.trade.toLowerCase().includes('plagas');
      else if (selectedCategory === 'herreria') matchesCategory = pro.trade.toLowerCase().includes('herrero') || pro.trade.toLowerCase().includes('herrería');
      else if (selectedCategory === 'techista') matchesCategory = pro.trade.toLowerCase().includes('techo') || pro.trade.toLowerCase().includes('techista') || pro.trade.toLowerCase().includes('impermeabil');
      else if (selectedCategory === 'fletes') matchesCategory = pro.trade.toLowerCase().includes('flete') || pro.trade.toLowerCase().includes('mudanza') || pro.trade.toLowerCase().includes('transporte');

      // 2. Filtrado por Provincia seleccionada de forma explícita
      let matchesProvincia = true;
      if (provinciaFiltro) {
        const provNorm = provinciaFiltro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const locNorm = pro.location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Comprobar si coincide la provincia o fragmento (ej: 'caba' o 'la rioja')
        matchesProvincia = locNorm.includes(provNorm) || 
                          (provNorm.includes('caba') && locNorm.includes('caba')) ||
                          (provNorm.includes('buenos aires') && (locNorm.includes('gba') || locNorm.includes('buenos aires')));
      }

      // 3. Filtrado por texto libre inteligente (tokenizado y sin acentos)
      if (!searchQuery.trim()) {
        return matchesCategory && matchesProvincia;
      }

      const nameNorm = pro.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const tradeNorm = pro.trade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const locationNorm = pro.location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const categoryNorm = pro.category ? pro.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

      const queryTokens = searchQuery
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter(t => t.length > 0);

      const matchesSearch = queryTokens.every(token => {
        return (
          nameNorm.includes(token) ||
          tradeNorm.includes(token) ||
          locationNorm.includes(token) ||
          categoryNorm.includes(token) ||
          (token === 'plomeria' && (tradeNorm.includes('plomero') || categoryNorm.includes('plomeria'))) ||
          (token === 'plomero' && (tradeNorm.includes('plomero') || categoryNorm.includes('plomeria'))) ||
          (token === 'electricidad' && (tradeNorm.includes('electricista') || categoryNorm.includes('electricidad'))) ||
          (token === 'electricista' && (tradeNorm.includes('electricista') || categoryNorm.includes('electricidad'))) ||
          (token === 'albañileria' && (tradeNorm.includes('albañil') || categoryNorm.includes('albanileria'))) ||
          (token === 'albañil' && (tradeNorm.includes('albañil') || categoryNorm.includes('albanileria'))) ||
          (token === 'albanileria' && (tradeNorm.includes('albanil') || categoryNorm.includes('albanileria'))) ||
          (token === 'albanil' && (tradeNorm.includes('albanil') || categoryNorm.includes('albanileria')))
        );
      });

      const isVerif = !soloVerificados || (pro.verificacion === 'Verificado' || pro.estadoDNI === 'Validado');
      const isMatric = !soloMatriculados || (pro.matriculadoVerificado || pro.estadoCertificados === 'Validado');

      return matchesCategory && matchesProvincia && matchesSearch && isVerif && isMatric;
    }).sort((a, b) => {
      if (ordenarPor === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (ordenarPor === 'experiencia') {
        const expA = parseInt(a.experiencia) || 0;
        const expB = parseInt(b.experiencia) || 0;
        return expB - expA;
      }
      return 0;
    });
  }, [professionals, selectedCategory, searchQuery, provinciaFiltro, soloVerificados, soloMatriculados, ordenarPor]);

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#0f4c81] selection:text-white">
      
      {/* Cabecera Superior (Pública) */}
      <header className="bg-white/95 backdrop-blur-sm px-4 py-3 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" theme="light" />
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

        {/* Carrusel Visual de Oficios (Marquee Continuo) */}
        <section className="w-full overflow-hidden">
          <div className="animate-marquee gap-4 pb-4 px-2">
            {[...CAROUSEL_CARDS, ...CAROUSEL_CARDS].map((card, i) => (
              <div 
                key={`${card.id}-${i}`} 
                onClick={() => {
                  setSelectedCategory(card.id);
                  setSearchQuery('');
                }}
                className="shrink-0 w-64 h-40 md:w-80 md:h-48 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={card.img} alt={card.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent flex items-end p-5`}>
                  <span className="text-white font-bold text-lg">{card.label}</span>
                </div>
              </div>
            ))}
          </div>
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
          <div className="bg-[#00355f] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-md space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">¿A quién estás buscando?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Buscador de Texto */}
              <div className="md:col-span-8 flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-150">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: Plomero matriculado, Juan, etc..."
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 text-sm placeholder:text-gray-400"
                />
              </div>

              {/* Selector de Provincia */}
              <div className="md:col-span-4 flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-150 relative">
                <MapPin className="w-5 h-5 text-gray-400 mr-2.5 shrink-0" />
                <select
                  value={provinciaFiltro}
                  onChange={(e) => setProvinciaFiltro(e.target.value)}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-700 text-xs font-bold appearance-none pr-8 cursor-pointer"
                >
                  <option value="">Todas las provincias</option>
                  {provinciasArgentinas.map((prov) => (
                    <option key={prov} value={prov} className="text-gray-900 font-medium">{prov}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">▼</div>
              </div>

            </div>
          </div>

          {/* Filtros de Categorías */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0 flex-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 md:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === cat.id
                      ? 'bg-[#fc8127] text-white font-bold'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filtros Rápidos de Insignias y Ordenamiento */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setSoloVerificados(!soloVerificados)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                  soloVerificados
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Solo Verificados (DNI)
              </button>

              <button
                onClick={() => setSoloMatriculados(!soloMatriculados)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                  soloMatriculados
                    ? 'bg-[#fc8127] text-white border-[#fc8127] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Solo Matriculados
              </button>

              <select
                value={ordenarPor}
                onChange={(e: any) => setOrdenarPor(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#00355f] outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="destacados">Orden: Destacados</option>
                <option value="rating">Más Valorados (Estrellas)</option>
                <option value="experiencia">Mayor Experiencia</option>
              </select>
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
              {filteredProfessionals.map((pro) => {
                const premium = isMasterPlan(pro.id);
                return (
                  <div
                    key={pro.id}
                    className={`relative rounded-2xl ${premium ? 'p-[2.5px] overflow-hidden' : ''}`}
                  >
                    {premium && (
                      <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_75%,#fc8127_95%,#d946ef_100%)]" />
                    )}
                    <div
                      onClick={() => router.push(`/profesional/${pro.id}`)}
                      className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col group h-full"
                    >
                      <div className="h-48 w-full relative bg-gray-200 overflow-hidden">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={pro.avatar}
                          alt={pro.name}
                        />
                        {premium && (
                          <div className="absolute top-3 left-3 bg-[#fc8127] text-white px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm text-[9px] font-black uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 fill-white text-white" /> Destacado
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" />
                          <span className="font-bold text-xs text-green-700">{pro.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-1 justify-between bg-white rounded-b-2xl">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#00355f] transition-colors">
                            {pro.name}
                          </h4>
                          <p className="text-[11px] font-extrabold text-[#fc8127] tracking-wider uppercase mt-1">
                            {pro.trade}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
                            {(pro.verificacion === 'Verificado' || pro.estadoDNI === 'Validado') && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full" title="Identidad Verificada (DNI)">
                                <CheckCircle className="w-3 h-3 text-green-600" /> Verificado
                              </span>
                            )}

                            {(pro.matriculadoVerificado || pro.estadoCertificados === 'Validado') && (
                              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full" title="Profesional Matriculado / Certificado">
                                <Award className="w-3 h-3 text-[#fc8127]" /> Matriculado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 mb-5">
                            <MapPin className="w-4 h-4 text-[#00355f]" />
                            <span className="line-clamp-1">{pro.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Tooltip text="Ver perfil completo" position="top">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profesional/${pro.id}`);
                              }} 
                              className="flex-1 py-2.5 bg-gray-100 text-[#00355f] rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95"
                            >
                              Ver Perfil
                            </button>
                          </Tooltip>
                          <Tooltip text="Iniciar conversación" position="top">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push('/login');
                              }}
                              className="px-4 py-2.5 bg-[#00355f] text-white rounded-xl hover:bg-[#0f4c81] transition-colors active:scale-95 flex items-center justify-center shadow-sm"
                            >
                              <MessageSquare className="w-5 h-5" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              onClick={() => router.push('/registro-profesional')}
              className="bg-[#fc8127] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
            >
              Registrarme gratis
            </button>
          </div>
          {/* Elemento decorativo */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
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