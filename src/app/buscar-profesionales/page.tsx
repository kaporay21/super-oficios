"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  Search, MapPin, Star, MessageSquare, ClipboardList, ArrowRight,
  Sparkles, CheckCircle, Award, ChevronLeft, ChevronRight, Loader2,
  Navigation, X, Camera
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { dbHelper } from '@/lib/supabase';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { useGeolocalizacion } from '@/hooks/useGeolocalizacion';

// ──────────────────────────────────────────────────────────────────────
// Carrusel estático de oficios (datos de presentación, no de la BD)
// ──────────────────────────────────────────────────────────────────────
const CAROUSEL_CARDS = [
  { id: 'Plomería', label: 'Plomería', img: '/images/oficio_plomeria_m_1784427462868.png', color: 'from-[#00355f]/90' },
  { id: 'Electricidad', label: 'Electricidad', img: '/images/oficio_electricidad_m_1784427470881.png', color: 'from-[#fc8127]/90' },
  { id: 'Albañilería', label: 'Albañilería', img: '/images/oficio_albanileria_m_1784427479131.png', color: 'from-[#00355f]/90' },
  { id: 'Pintura', label: 'Pintura', img: '/images/oficio_pintura_m_1784427486978.png', color: 'from-[#fc8127]/90' },
  { id: 'Carpintería', label: 'Carpintería', img: '/images/oficio_carpinteria_1784426158760.png', color: 'from-[#00355f]/90' },
  { id: 'Jardinería', label: 'Jardinería', img: '/images/oficio_jardineria_1784426924675.png', color: 'from-[#fc8127]/90' },
  { id: 'Limpieza', label: 'Limpieza', img: '/images/oficio_limpieza_1784426932346.png', color: 'from-[#00355f]/90' },
];

// Categorías para los botones de filtro rápido.
// El ID coincide con el valor real del oficio en la base de datos.
const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'Plomería', label: 'Plomería' },
  { id: 'Electricidad', label: 'Electricidad' },
  { id: 'Albañilería', label: 'Albañilería' },
  { id: 'Pintura', label: 'Pintura' },
  { id: 'Carpintería', label: 'Carpintería' },
  { id: 'Gasista', label: 'Gasista' },
  { id: 'Cerrajería', label: 'Cerrajería' },
  { id: 'Durlock / Yeso', label: 'Durlock / Yeso' },
  { id: 'Aire Acondicionado', label: 'Aire Acondicionado' },
  { id: 'Jardinería', label: 'Jardinería' },
  { id: 'Fumigación', label: 'Fumigación' },
  { id: 'Herrería', label: 'Herrería' },
  { id: 'Techista / Impermeabilización', label: 'Techista' },
  { id: 'Fletes y Mudanzas', label: 'Fletes y Mudanzas' },
];

const PROVINCIAS_ARGENTINAS = [
  'Buenos Aires', 'CABA (Ciudad Autónoma de Buenos Aires)', 'Catamarca', 'Chaco',
  'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const LIMIT_POR_PAGINA = 12;

// ──────────────────────────────────────────────────────────────────────
// Componente Principal (interno — necesita useSearchParams)
// ──────────────────────────────────────────────────────────────────────
function BuscadorContenido() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Estado de resultados ───────────────────────────────────────────
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Estado de filtros (inicializados desde la URL) ─────────────────
  const [oficio, setOficio] = useState(searchParams.get('oficio') || '');
  const [provincia, setProvincia] = useState(searchParams.get('provincia') || '');
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [soloVerificados, setSoloVerificados] = useState(searchParams.get('verificados') === '1');
  const [soloMatriculados, setSoloMatriculados] = useState(searchParams.get('matriculados') === '1');
  const [ordenarPor, setOrdenarPor] = useState<'rating' | 'trabajos_realizados' | 'fecha_registro'>(
    (searchParams.get('orden') as any) || 'fecha_registro'
  );
  const [page, setPage] = useState(parseInt(searchParams.get('pagina') || '1', 10));

  // ── Geolocalización automática ─────────────────────────────────────
  const geo = useGeolocalizacion();
  const [bannerGeoVisible, setBannerGeoVisible] = useState(true);
  const geoBannerYaAplicado = useRef(false);

  // Cuando la geo termina de detectar, si no hay provincia activa y no lo aplicamos antes,
  // mostramos el banner pero NO aplicamos el filtro automáticamente (respeta la autonomía).
  // El usuario puede hacer clic en "Aplicar" para filtrar por su zona.
  const handleAplicarGeo = () => {
    if (geo.provincia) {
      handleProvinciaChange(geo.provincia);
      geoBannerYaAplicado.current = true;
      setBannerGeoVisible(false);
    }
  };

  // Ref para el debounce del texto de búsqueda
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Valor "efectivo" del texto de búsqueda (se actualiza con debounce de 400ms)
  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);

  // ── Sincronización de URL ──────────────────────────────────────────
  // Mantiene la URL actualizada con los filtros activos para permitir
  // compartir búsquedas y respetar el botón "Atrás" del navegador.
  const sincronizarURL = useCallback((params: Record<string, string | null>) => {
    const actual = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '' && value !== '0') {
        actual.set(key, value);
      } else {
        actual.delete(key);
      }
    });
    router.replace(`${pathname}?${actual.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // ── Debounce del campo de búsqueda ────────────────────────────────
  // Espera 400ms después del último keystroke antes de disparar la query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPage(1); // Volvemos a la primera página al cambiar la búsqueda
      sincronizarURL({ q: busqueda, pagina: null });
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  // ── Consulta al servidor ───────────────────────────────────────────
  // Se dispara cada vez que cambian los filtros o la página.
  // NO se hace ningún .filter() en el cliente — todo ocurre en Supabase.
  useEffect(() => {
    const fetchProfesionales = async () => {
      setLoading(true);
      try {
        const resultado = await dbHelper.getFilteredProfessionals({
          oficio: oficio || undefined,
          provincia: provincia || undefined,
          busqueda: busquedaDebounced || undefined,
          soloVerificados,
          soloMatriculados,
          ordenarPor,
          page,
          limit: LIMIT_POR_PAGINA,
        });

        if (resultado.error) {
          console.error('Error al cargar profesionales:', resultado.error);
          setProfessionals([]);
          setTotalCount(0);
          setTotalPages(0);
        } else {
          setProfessionals(resultado.data);
          setTotalCount(resultado.count);
          setTotalPages(resultado.totalPages);
        }
      } catch (err) {
        console.error('Excepción al cargar profesionales:', err);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfesionales();
  }, [oficio, provincia, busquedaDebounced, soloVerificados, soloMatriculados, ordenarPor, page]);

  // ── Manejadores de cambio de filtros (actualizan URL + estado) ─────
  const handleOficioChange = (nuevoOficio: string) => {
    setOficio(nuevoOficio);
    setPage(1);
    sincronizarURL({ oficio: nuevoOficio, pagina: null });
  };

  const handleProvinciaChange = (nuevaProvincia: string) => {
    setProvincia(nuevaProvincia);
    setPage(1);
    sincronizarURL({ provincia: nuevaProvincia, pagina: null });
  };

  const handleVerificadosChange = (val: boolean) => {
    setSoloVerificados(val);
    setPage(1);
    sincronizarURL({ verificados: val ? '1' : null, pagina: null });
  };

  const handleMatriculadosChange = (val: boolean) => {
    setSoloMatriculados(val);
    setPage(1);
    sincronizarURL({ matriculados: val ? '1' : null, pagina: null });
  };

  const handleOrdenChange = (nuevoOrden: typeof ordenarPor) => {
    setOrdenarPor(nuevoOrden);
    setPage(1);
    sincronizarURL({ orden: nuevoOrden, pagina: null });
  };

  const handlePageChange = (nuevaPagina: number) => {
    setPage(nuevaPagina);
    sincronizarURL({ pagina: nuevaPagina > 1 ? String(nuevaPagina) : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFiltros = () => {
    setOficio('');
    setProvincia('');
    setBusqueda('');
    setBusquedaDebounced('');
    setSoloVerificados(false);
    setSoloMatriculados(false);
    setOrdenarPor('fecha_registro');
    setPage(1);
    geoBannerYaAplicado.current = false;
    setBannerGeoVisible(true);
    router.replace(pathname, { scroll: false });
  };

  // ── Cálculo de "Mostrando X–Y de Z" ───────────────────────────────
  const desde = totalCount === 0 ? 0 : (page - 1) * LIMIT_POR_PAGINA + 1;
  const hasta = Math.min(page * LIMIT_POR_PAGINA, totalCount);

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#0f4c81] selection:text-white">

      {/* ── Cabecera Superior ──────────────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-sm px-4 py-3 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="md" theme="light" />
          </div>
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

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {/* ── Título ─────────────────────────────────────────────── */}
        <section className="text-center bg-white py-12 px-4 rounded-3xl border border-gray-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00355f] leading-tight">
            Directorio de Profesionales
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
            Explorá los perfiles de nuestros expertos verificados. Para solicitar presupuestos y gestionar tus trabajos, crea tu cuenta gratuita.
          </p>

          {/* Banner de Geolocalización */}
          {bannerGeoVisible && !geo.rechazado && (
            <div className="mt-4">
              {geo.loading ? (
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-2 rounded-full">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Detectando tu ubicación...
                </div>
              ) : geo.ciudad && geo.provincia && !provincia ? (
                <div className="inline-flex items-center gap-3 bg-[#00355f]/5 border border-[#00355f]/20 text-[#00355f] text-sm font-medium px-5 py-3 rounded-2xl">
                  <Navigation className="w-4 h-4 text-[#fc8127] shrink-0" />
                  <span>Detectamos que estás en <strong>{geo.ciudad}, {geo.provincia}</strong></span>
                  <button
                    onClick={handleAplicarGeo}
                    className="bg-[#fc8127] text-white text-xs font-black px-3 py-1.5 rounded-lg hover:bg-[#e67320] transition-colors whitespace-nowrap"
                  >
                    Ver profesionales cerca
                  </button>
                  <button onClick={() => setBannerGeoVisible(false)} className="text-gray-400 hover:text-gray-600 ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : geo.error ? null : null}
            </div>
          )}
        </section>

        {/* ── Carrusel de Oficios ─────────────────────────────────── */}
        <section className="w-full overflow-hidden">
          <div className="animate-marquee gap-4 pb-4 px-2">
            {[...CAROUSEL_CARDS, ...CAROUSEL_CARDS].map((card, i) => (
              <div
                key={`${card.id}-${i}`}
                onClick={() => handleOficioChange(card.id)}
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

        {/* ── CTA: Publicar Trabajo ──────────────────────────────── */}
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
                Registrate en segundos, publicá lo que necesitás arreglar y dejá que los profesionales te envíen sus presupuestos. <strong>¡Es gratis!</strong>
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

        {/* ── Buscador y Filtros ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="bg-[#00355f] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-md space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">¿A quién estás buscando?</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

              {/* Campo de texto con debounce de 400ms */}
              <div className="md:col-span-8 flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-150">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  id="busqueda-profesional"
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: Juan, electricista, plomero..."
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-800 text-sm placeholder:text-gray-400"
                />
                {loading && busqueda && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2 shrink-0" />
                )}
              </div>

              {/* Selector de Provincia — con indicador de zona detectada */}
              <div className="md:col-span-4 flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-150 relative">
                <MapPin className={`w-5 h-5 mr-2.5 shrink-0 ${provincia && geo.provincia && provincia === geo.provincia ? 'text-[#fc8127]' : 'text-gray-400'}`} />
                <select
                  id="provincia-profesional"
                  value={provincia}
                  onChange={(e) => handleProvinciaChange(e.target.value)}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-gray-700 text-xs font-bold appearance-none pr-8 cursor-pointer"
                >
                  <option value="">{geo.provincia && !geo.loading ? `Tu zona: ${geo.provincia}` : 'Todas las provincias'}</option>
                  {PROVINCIAS_ARGENTINAS.map((prov) => (
                    <option key={prov} value={prov} className="text-gray-900 font-medium">{prov}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">▼</div>
              </div>
            </div>
          </div>

          {/* Botones de Categoría */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0 flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id || 'todos'}
                  onClick={() => handleOficioChange(cat.id)}
                  className={`px-5 py-2 md:py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                    oficio === cat.id
                      ? 'bg-[#fc8127] text-white font-bold'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filtros Rápidos y Ordenamiento */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="filtro-verificados"
                onClick={() => handleVerificadosChange(!soloVerificados)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                  soloVerificados
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Solo Verificados (DNI)
              </button>

              <button
                id="filtro-matriculados"
                onClick={() => handleMatriculadosChange(!soloMatriculados)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
                  soloMatriculados
                    ? 'bg-[#fc8127] text-white border-[#fc8127] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Solo Matriculados
              </button>

              <select
                id="orden-profesionales"
                value={ordenarPor}
                onChange={(e: any) => handleOrdenChange(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#00355f] outline-none cursor-pointer hover:bg-gray-50"
              >
                <option value="fecha_registro">Más recientes</option>
                <option value="rating">Más Valorados</option>
                <option value="trabajos_realizados">Mayor Experiencia</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Listado de Profesionales ──────────────────────────── */}
        <section className="space-y-4">

          {/* Encabezado con conteo real */}
          <div className="flex justify-between items-end border-b border-gray-200 pb-2 flex-wrap gap-2">
            <h3 className="text-xl font-bold text-[#00355f] leading-tight">Profesionales Disponibles</h3>
            {!loading && totalCount > 0 && (
              <span className="text-sm font-bold text-gray-500">
                Mostrando <span className="text-[#fc8127]">{desde}–{hasta}</span> de{' '}
                <span className="text-[#00355f]">{totalCount}</span> profesionales
              </span>
            )}
          </div>

          {/* Estado de carga — Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {Array.from({ length: LIMIT_POR_PAGINA }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mt-4" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-10 bg-gray-200 rounded-xl flex-1" />
                      <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estado Vacío Real */}
          {!loading && professionals.length === 0 && (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-bold text-[#00355f]">No encontramos coincidencias</p>
              <p className="text-gray-500 text-sm mt-1">
                Probá buscando otro oficio o modificando la zona.
              </p>
              <button
                onClick={limpiarFiltros}
                className="mt-4 text-[#fc8127] font-bold hover:underline"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {/* Grilla de Tarjetas de Profesionales */}
          {!loading && professionals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {professionals.map((pro) => {
                const premium = pro.plan === 'Master';
                // Badge "Cerca tuyo" si el profesional está en la misma provincia detectada
                const esCercano = geo.provincia && pro.province && 
                  pro.province.toLowerCase().trim() === geo.provincia.toLowerCase().trim();
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
                      {/* Foto de perfil */}
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
                        {/* Badge "Cerca tuyo" */}
                        {esCercano && !premium && (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#00355f] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm text-[9px] font-black uppercase tracking-wider border border-[#00355f]/10">
                            <Navigation className="w-3 h-3 text-[#fc8127]" /> Cerca tuyo
                          </div>
                        )}
                        {esCercano && premium && (
                          <div className="absolute top-10 left-3 bg-white/95 backdrop-blur-sm text-[#00355f] px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm text-[9px] font-black uppercase tracking-wider border border-[#00355f]/10">
                            <Navigation className="w-3 h-3 text-[#fc8127]" /> Cerca tuyo
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" />
                          <span className="font-bold text-xs text-green-700">{(pro.rating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1 justify-between bg-white rounded-b-2xl">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#00355f] transition-colors">
                            {pro.name}
                          </h4>
                          <p className="text-[11px] font-extrabold text-[#fc8127] tracking-wider uppercase mt-1">
                            {pro.trade || '—'}
                          </p>

                          {/* Insignias */}
                          <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
                            {(pro.fotoPerfil || pro.avatar) && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-[#00355f] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200" title="Foto verificada por cámara en vivo">
                                <Camera className="w-3 h-3 text-[#fc8127]" /> Rostro Verificado
                              </span>
                            )}
                            {(pro.verificacion === 'Verificado' || pro.estadoDNI === 'Validado') && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3 text-green-600" /> DNI Verificado
                              </span>
                            )}
                            {(pro.matriculadoVerificado || pro.estadoCertificados === 'Validado') && (
                              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                <Award className="w-3 h-3 text-[#fc8127]" /> Matriculado
                              </span>
                            )}
                          </div>

                          {/* Ubicación */}
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 mb-5">
                            <MapPin className="w-4 h-4 text-[#00355f]" />
                            <span className="line-clamp-1">{pro.location}</span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Tooltip text="Ver perfil completo" position="top">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push(`/profesional/${pro.id}`); }}
                              className="flex-1 py-2.5 bg-gray-100 text-[#00355f] rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors active:scale-95"
                            >
                              Ver Perfil
                            </button>
                          </Tooltip>
                          <Tooltip text="Iniciá sesión para contactar" position="top">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/login'); }}
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

          {/* ── Controles de Paginación ─────────────────────────── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5 text-[#00355f]" />
              </button>

              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-gray-400 font-bold">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item as number)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                        page === item
                          ? 'bg-[#00355f] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )
              }

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Página siguiente"
              >
                <ChevronRight className="w-5 h-5 text-[#00355f]" />
              </button>
            </div>
          )}
        </section>

        {/* ── CTA Profesional ──────────────────────────────────── */}
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
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
        </section>

      </div>
    </main>
  );
}

// Envolvemos en Suspense para que Next.js maneje useSearchParams correctamente
export default function BuscarProfesionalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-bold text-[#00355f] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#fc8127]" />
        Cargando directorio...
      </div>
    }>
      <BuscadorContenido />
    </Suspense>
  );
}