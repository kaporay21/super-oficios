"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Briefcase, MapPin, Clock, 
  Filter, Users, ChevronRight, PlusCircle,
  LayoutDashboard, MessageSquare, User, Zap,
  Star, BookmarkPlus, Bookmark, TrendingUp,
  Building2, AlertCircle, CheckCircle2, Heart,
  Compass, Sparkles, Target, Handshake
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';
import { OFICIOS_CORE, PROVINCIAS_CORE } from '@/lib/constants';
import { useAuth } from '@/components/AuthContext';

const PROVINCIAS = ['Todas', ...PROVINCIAS_CORE];
const OFICIOS = ['Todos', ...OFICIOS_CORE];

const TIPOS = ['Todos', 'Permanente', 'Por obra', 'Temporal', 'Part-time'];

export default function BolsaEmpleoPage() {
  const router = useRouter();
  const { profile: authProfile } = useAuth();
  const [empleos, setEmpleos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [provinciaFiltro, setProvinciaFiltro] = useState('Todas');
  const [oficioFiltro, setOficioFiltro] = useState('Todos');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [guardados, setGuardados] = useState<number[]>([]);
  const [postulados, setPostulados] = useState<number[]>([]);
  const [mostrandoExito, setMostrandoExito] = useState<number | null>(null);

  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      // 1. Cargar perfil local (para saber quién es el profesional)
      const storedPerfil = localStorage.getItem('oficiosya_profesional_perfil');
      let currentPerfil = null;
      if (storedPerfil) {
        currentPerfil = JSON.parse(storedPerfil);
        setPerfil(currentPerfil);
      }
      const nombrePro = currentPerfil?.nombre || 'Usuario Profesional';

      // 2. Cargar empleos exclusivamente desde Supabase
      try {
        const jobs = await dbHelper.getJobs();
        const jobOffers = (jobs || []).filter((j: any) => j.tipo || j.salario || j.esEmpleo);
        setEmpleos(jobOffers);
      } catch (e) {
        console.error("Error al cargar empleos desde BD:", e);
        setEmpleos([]);
      }

      // 3. Cargar postulaciones desde dbHelper
      try {
        const misPost = await dbHelper.getMisPostulaciones(nombrePro);
        setPostulados(misPost.map((p: any) => p.empleoId || p.idPostulacion));
      } catch (e) {
        console.error(e);
      }
      
      // Cargar guardados
      const storedGuardados = localStorage.getItem('oficiosya_empleos_guardados');
      if (storedGuardados) {
        setGuardados(JSON.parse(storedGuardados));
      }
    };
    
    initData();
  }, []);

  const empleosFiltrados = empleos.filter(e => {
    const oficioNombre = e.oficio || e.categoria || e.rubro || 'General';
    const matchBusqueda = (e.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.descripcion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      oficioNombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchProvincia = provinciaFiltro === 'Todas' || e.provincia === provinciaFiltro;
    const matchOficio = oficioFiltro === 'Todos' || oficioNombre === oficioFiltro;
    const matchTipo = tipoFiltro === 'Todos' || e.tipo === tipoFiltro;
    return matchBusqueda && matchProvincia && matchOficio && matchTipo;
  });

  const handlePostularse = async (empleo: any) => {
    if (postulados.includes(empleo.id)) return;
    
    const nombrePro = perfil?.nombre || 'Usuario Profesional';
    const avatarPro = perfil?.fotoPerfil || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJFksOrbm_vwGQaTq5Vuqr1acUBEH2jxptCR5CusLDf2Sb5qZ8fqxqznYXUigT9dEfKpCENJlHaLhC_WoPDhEQJYKRkRbxGiFrH2Jf4hrRkaq4pffxxwX2ietvZfajbBEyvOb665wnkChMjc88JXD3dUq70dprcIy22fOVZalBnuC390ApdZb18RNQjeSD56KQnd4KnVj3W9Vf6W_rfyL2JkZDhnRQLKr0smIh2slCZIjrr0crl5Ri-6h1zRMK70Hxc9PXqDijgpuj';

    const nuevaPostulacion = {
      empleoId: empleo.id,
      tituloEmpleo: empleo.titulo,
      empleador: empleo.empleador,
      candidato: nombrePro,
      candidatoAvatar: avatarPro,
      candidatoRating: authProfile?.rating || perfil?.rating || 0,
      candidatoVerificado: authProfile?.verificado || false,
      mensaje: 'Me interesa la propuesta, cuento con disponibilidad.',
      oficio: empleo.oficio,
      tipo: empleo.tipo,
      provincia: empleo.provincia,
      fecha: new Date().toISOString(),
      estado: 'En revisión',
    };
    
    try {
      await dbHelper.createPostulacion(nuevaPostulacion);
      
      setPostulados([...postulados, empleo.id]);
      setMostrandoExito(empleo.id);
      setTimeout(() => setMostrandoExito(null), 2500);

      // Generar notificación de postulación (local por ahora)
      const notif = {
        id: Date.now(),
        tipo: 'postulacion',
        titulo: '¡Te postulaste exitosamente!',
        mensaje: `Tu postulación para "${empleo.titulo}" fue enviada. El empleador revisará tu perfil.`,
        fecha: new Date().toISOString(),
        leida: false,
        link: '/mis-postulaciones',
      };
      const nStored = localStorage.getItem('oficiosya_notificaciones');
      const nExisting = nStored ? JSON.parse(nStored) : [];
      localStorage.setItem('oficiosya_notificaciones', JSON.stringify([notif, ...nExisting]));
    } catch (error) {
      console.error("Error al postularse:", error);
      alert("Hubo un error al enviar tu postulación. Intenta nuevamente.");
    }
  };

  const handleGuardar = (id: number) => {
    const nuevos = guardados.includes(id)
      ? guardados.filter(g => g !== id)
      : [...guardados, id];
    setGuardados(nuevos);
    localStorage.setItem('oficiosya_empleos_guardados', JSON.stringify(nuevos));
  };

  const fechaRelativa = (fecha: string) => {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    return `Hace ${Math.floor(diff / 7)} semana${Math.floor(diff / 7) > 1 ? 's' : ''}`;
  };

  const tipoBadgeColor: Record<string, string> = {
    'Permanente': 'bg-green-100 text-green-700 border-green-200',
    'Por obra': 'bg-blue-100 text-blue-700 border-blue-200',
    'Temporal': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Part-time': 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0">
      
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-20" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip text="Notificaciones" position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
          <Tooltip text="Mis postulaciones" position="bottom">
            <button onClick={() => router.push('/mis-postulaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <BookmarkPlus className="w-5 h-5 text-[#00355f]" />
            </button>
          </Tooltip>
        </div>
      </header>

      <main className="flex-grow w-full pt-16 pb-8">

        {/* Hero Header fotográfico Inmersivo FULL WIDTH */}
        <div className="relative mb-8 w-full h-[380px] md:h-[450px] overflow-hidden group">
          {/* Imagen de fondo real (Pexels) con fallback de color */}
          <div 
            className="absolute inset-0 bg-[#00355f] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: "url('https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=2000')" }}
          ></div>
          
          {/* Overlay oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00355f]/95 via-[#00355f]/70 to-[#00355f]/20"></div>
          
          <div className="relative z-10 h-full max-w-5xl mx-auto px-6 md:px-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              {/* Ícono súper moderno con Glassmorphism */}
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                <Handshake className="w-7 h-7 text-[#fc8127] drop-shadow-md" />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest bg-[#fc8127]/90 px-3 py-1.5 rounded-full shadow-md">Bolsa de Empleo</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-5 drop-shadow-lg">
              El talento que <br className="hidden md:block"/> tu proyecto necesita
            </h1>
            
            <p className="text-base md:text-lg text-blue-50 leading-relaxed mb-8 max-w-xl drop-shadow-md font-medium">
              Conectamos profesionales de oficio con las mejores oportunidades en toda la Argentina. Tu próximo paso empieza aquí.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/publicar-empleo')}
                className="flex items-center justify-center gap-2 bg-[#fc8127] hover:bg-[#e06b16] text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-all"
              >
                <PlusCircle className="w-5 h-5" /> Publicar un Empleo
              </button>
              <button
                onClick={() => router.push('/mis-postulaciones')}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-4 rounded-2xl text-sm backdrop-blur-md active:scale-95 transition-all"
              >
                <BookmarkPlus className="w-5 h-5" /> Mis Postulaciones
              </button>
            </div>
          </div>
          
          {/* Stats strip inferior flotante */}
          <div className="absolute bottom-0 left-0 w-full bg-white/5 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-8">
              <div className="flex items-center gap-2 text-xs text-blue-100 font-medium">
                <Sparkles className="w-4 h-4 text-[#fc8127]" />
                <span><strong className="text-white text-sm">{empleos.length}</strong> empleos activos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-100 font-medium hidden sm:flex">
                <Users className="w-4 h-4 text-[#fc8127]" />
                <span><strong className="text-white text-sm">+500</strong> profesionales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor centralizado para el resto del contenido */}
        <div className="max-w-4xl mx-auto w-full px-4">
          
          {/* Search + Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o palabra clave..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none text-sm bg-gray-50"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={provinciaFiltro}
                onChange={e => setProvinciaFiltro(e.target.value)}
                className="w-full md:w-48 h-11 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-[#00355f] focus:border-transparent text-gray-600 font-medium"
              >
                <option value="Todas">Todas las provincias</option>
                {PROVINCIAS.filter(p => p !== 'Todas').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              
              <select
                value={oficioFiltro}
                onChange={e => setOficioFiltro(e.target.value)}
                className="w-full md:w-48 h-11 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-[#00355f] focus:border-transparent text-gray-600 font-medium"
              >
                <option value="Todos">Todos los oficios</option>
                {OFICIOS.filter(o => o !== 'Todos').map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-gray-500">
            {empleosFiltrados.length} resultado{empleosFiltrados.length !== 1 ? 's' : ''}
          </span>
          {(provinciaFiltro !== 'Todas' || oficioFiltro !== 'Todos' || tipoFiltro !== 'Todos') && (
            <button
              onClick={() => { setProvinciaFiltro('Todas'); setOficioFiltro('Todos'); setTipoFiltro('Todos'); }}
              className="text-xs font-bold text-[#fc8127] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Lista de Empleos */}
        <div className="space-y-4">
          {empleosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">No hay empleos con esos filtros</p>
              <p className="text-xs mt-1">Intentá ampliar la búsqueda</p>
            </div>
          ) : empleosFiltrados.map(empleo => (
            <div
              key={empleo.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#00355f]/20 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-grow min-w-0">
                    <img
                      src={empleo.empleadorAvatar}
                      alt={empleo.empleador}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-[#00355f] transition-colors truncate">
                        {empleo.titulo}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">{empleo.empleador}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGuardar(empleo.id)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {guardados.includes(empleo.id)
                      ? <Bookmark className="w-4 h-4 text-[#fc8127] fill-[#fc8127]" />
                      : <Bookmark className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {empleo.urgente && (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                      <AlertCircle className="w-2.5 h-2.5" /> Urgente
                    </span>
                  )}
                  {empleo.nuevo && (
                    <span className="flex items-center gap-1 bg-[#00355f]/10 text-[#00355f] border border-[#00355f]/20 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                      <Zap className="w-2.5 h-2.5" /> Nuevo
                    </span>
                  )}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${tipoBadgeColor[empleo.tipo] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {empleo.tipo}
                  </span>
                  <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                    {empleo.oficio}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                  {empleo.descripcion}
                </p>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#fc8127]" />
                    {empleo.ciudad}, {empleo.provincia}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {fechaRelativa(empleo.fecha || empleo.created_at)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#00355f]" />
                    {empleo.postulantes + (postulados.includes(empleo.id) ? 1 : 0)} postulados
                  </div>
                  {empleo.salario && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold">
                      <span>💰</span> {empleo.salario}
                    </div>
                  )}
                </div>

                {/* Botón de postulación */}
                {mostrandoExito === empleo.id ? (
                  <div className="w-full h-11 flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl font-bold text-sm animate-in fade-in duration-300">
                    <CheckCircle2 className="w-4 h-4" /> ¡Postulación enviada!
                  </div>
                ) : postulados.includes(empleo.id) ? (
                  <div className="w-full h-11 flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-200 rounded-xl font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Ya te postulaste
                  </div>
                ) : (
                  <button
                    onClick={() => handlePostularse(empleo)}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-[#00355f] hover:bg-[#0f4c81] text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Postularme a este empleo <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 px-4 z-50 border-t border-gray-200 shadow-lg">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Panel</span>
        </button>
        <button onClick={() => router.push('/bolsa-empleo')} className="flex flex-col items-center justify-center text-[#fc8127]">
          <Briefcase className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Empleos</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
