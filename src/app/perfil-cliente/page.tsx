"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Building, FileText, Folder, MessageSquare, ShieldAlert,
  HelpCircle, LogOut, ChevronRight, MapPin, CheckCircle2,
  Clock, Plus, Star, Search, AlertCircle, Loader2, Send,
  Wrench, ShieldCheck, DollarSign, Calendar, ArrowLeft,
  X, Save, FileCheck, Check, Sparkles, MessageCircle, FilePlus, Filter, Heart, RefreshCw
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, logout as doLogout, supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';

export default function PerfilClientePage() {
  return (
    <AuthGuard requiredRole="cliente">
      <PerfilClienteContent />
    </AuthGuard>
  );
}

type TabType = 'resumen' | 'hogar' | 'expedientes' | 'mensajes' | 'soporte' | 'favoritos';

function PerfilClienteContent() {
  const router = useRouter();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('resumen');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab') as TabType | null;
    if (tab && ['resumen', 'hogar', 'expedientes', 'mensajes', 'soporte', 'favoritos'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [disputas, setDisputas] = useState<any[]>([]);
  const [ordenesResenadas, setOrdenesResenadas] = useState<string[]>([]);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [recontratandoId, setRecontratandoId] = useState<string | null>(null);

  // Formulario de reseña (Calificar trabajo)
  const [resenandoExpId, setResenandoExpId] = useState<string | null>(null);
  const [resenaForm, setResenaForm] = useState({ puntualidad: 5, resolvioProblema: 5, dejoLimpio: 5, volveriaContratar: true, comentario: '' });
  const [enviandoResena, setEnviandoResena] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario nuevo ticket soporte (#SO-XXXXXX)
  const [showFormTicket, setShowFormTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    categoria: 'Ayuda',
    asunto: '',
    mensaje: '',
    profesionalId: ''
  });
  const CATEGORIAS_SOBRE_PROFESIONAL = ['Reclamo', 'Denunciar usuario'];
  const [enviandoTicket, setEnviandoTicket] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);

  // Formulario Centro de Resolución
  const [showFormDisputa, setShowFormDisputa] = useState(false);
  const [disputaForm, setDisputaForm] = useState({
    tipo_solucion: 'Hablar con profesional',
    descripcion: '',
    monto_reclamado: '',
    profesionalId: ''
  });
  const [enviandoDisputa, setEnviandoDisputa] = useState(false);

  // Filtro de conversaciones por estado (consulta, trabajo, finalizado)
  const [filterChatState, setFilterChatState] = useState<'todos' | 'consulta' | 'trabajo' | 'finalizado'>('todos');

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [propsData, expsData, convsData, tixData, dispData, resenadasData, favoritosData] = await Promise.all([
        dbHelper.getPropiedades(user.id),
        dbHelper.getExpedientesCliente(user.id),
        dbHelper.getConversaciones(user.id),
        dbHelper.getTicketsSoporteUsuario(user.id),
        dbHelper.getDisputasCliente(user.id),
        dbHelper.getOrdenesTrabajoResenadas(user.id),
        dbHelper.getFavoritosProfesionales(user.id)
      ]);
      setPropiedades(propsData);
      setExpedientes(expsData);
      setConversaciones(convsData);
      setTickets(tixData);
      setDisputas(dispData);
      setOrdenesResenadas(resenadasData);
      setFavoritos(favoritosData);
    } catch (err: any) {
      console.warn('Error al cargar datos del cliente:', err);
      setError('Ocurrió un inconveniente al actualizar tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !ticketForm.mensaje.trim()) return;
    setEnviandoTicket(true);
    setTicketSuccessMsg(null);
    try {
      const nuevo = await dbHelper.crearTicketSoporte({
        usuario_id: user.id,
        categoria: ticketForm.categoria,
        asunto: ticketForm.asunto || ticketForm.categoria,
        mensaje: ticketForm.mensaje,
        profesional_id: ticketForm.profesionalId || undefined,
      });
      setTickets(prev => [nuevo, ...prev]);
      setTicketSuccessMsg(`¡Ticket ${nuevo.codigo_ticket} generado con éxito! El equipo de soporte lo revisará en breve.`);
      setTicketForm({ categoria: 'Ayuda', asunto: '', mensaje: '', profesionalId: '' });
      setShowFormTicket(false);
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la consulta.');
    } finally {
      setEnviandoTicket(false);
    }
  };

  const handleCrearDisputa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !disputaForm.descripcion.trim() || !disputaForm.profesionalId) return;
    setEnviandoDisputa(true);
    try {
      const nueva = await dbHelper.crearDisputaResolucion({
        cliente_id: user.id,
        profesional_id: disputaForm.profesionalId,
        tipo_solucion: disputaForm.tipo_solucion,
        descripcion: disputaForm.descripcion,
        monto_reclamado: disputaForm.monto_reclamado ? parseFloat(disputaForm.monto_reclamado) : undefined
      });
      setDisputas(prev => [nueva, ...prev]);
      setShowFormDisputa(false);
      setDisputaForm({ tipo_solucion: 'Hablar con profesional', descripcion: '', monto_reclamado: '', profesionalId: '' });
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar la mediación.');
    } finally {
      setEnviandoDisputa(false);
    }
  };

  const handleCrearResena = async (exp: any) => {
    if (!user?.id || !exp.orden_trabajo_id) return;
    setEnviandoResena(true);
    try {
      await dbHelper.createResenaInteligente({
        orden_trabajo_id: exp.orden_trabajo_id,
        profesional_id: exp.profesional_id,
        cliente_id: user.id,
        puntualidad: resenaForm.puntualidad,
        resolvio_problema: resenaForm.resolvioProblema,
        dejo_limpio: resenaForm.dejoLimpio,
        volveria_contratar: resenaForm.volveriaContratar,
        comentario: resenaForm.comentario.trim() || undefined,
      });
      setOrdenesResenadas(prev => [...prev, exp.orden_trabajo_id]);
      setResenandoExpId(null);
      setResenaForm({ puntualidad: 5, resolvioProblema: 5, dejoLimpio: 5, volveriaContratar: true, comentario: '' });
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la reseña.');
    } finally {
      setEnviandoResena(false);
    }
  };

  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);

  /**
   * El profesional pidió cerrar el trabajo -- el cliente confirma que
   * realmente está terminado (y se lo lleva directo a calificarlo) o dice
   * que todavía no, lo que devuelve el trabajo a "en progreso".
   */
  const handleConfirmarFinalizacion = async (exp: any, confirma: boolean) => {
    if (!exp.orden_trabajo_id) return;
    setConfirmandoId(exp.id);
    try {
      await dbHelper.confirmarFinalizacionTrabajo(exp.orden_trabajo_id, confirma);
      const nuevoEstado = confirma
        ? (exp.ordenes_trabajo?.estado_solicitado === 'con_garantia' ? 'con_garantia' : 'finalizado')
        : 'en_progreso';
      setExpedientes(prev => prev.map(e =>
        e.id === exp.id ? { ...e, ordenes_trabajo: { ...e.ordenes_trabajo, estado: nuevoEstado } } : e
      ));
      // Si confirmó, lo llevamos directo al formulario de reseña.
      if (confirma) setResenandoExpId(exp.id);
    } catch (err: any) {
      setError(err?.message || 'Error al confirmar el trabajo.');
    } finally {
      setConfirmandoId(null);
    }
  };

  const handleRecontratar = async (profesionalId: string) => {
    if (!user?.id || !profesionalId || recontratandoId) return;
    setRecontratandoId(profesionalId);
    try {
      const conv = await dbHelper.getOrCreateConversation(user.id, profesionalId);
      if (conv?.id) router.push(`/chat/${conv.id}`);
    } catch (err: any) {
      setError(err?.message || 'No pudimos abrir el chat. Intentá de nuevo en un momento.');
    } finally {
      setRecontratandoId(null);
    }
  };

  const handleQuitarFavorito = async (profesionalId: string) => {
    if (!user?.id) return;
    const prev = favoritos;
    setFavoritos(f => f.filter(fav => fav.profesional?.id !== profesionalId));
    try {
      await dbHelper.toggleFavorito(user.id, profesionalId, false);
    } catch (err) {
      setFavoritos(prev);
      console.error('Error al quitar favorito:', err);
    }
  };

  const handleLogout = async () => {
    await doLogout();
    router.replace('/login');
  };

  const filteredConversaciones = conversaciones.filter(c => {
    if (filterChatState === 'todos') return true;
    return (c.estado_chat || 'consulta') === filterChatState;
  });

  const getTicketStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Recibida': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'En revisión': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Aceptada': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'En desarrollo': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Implementada':
      case 'Resuelto': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white font-sans selection:bg-[#fc8127] selection:text-white pb-24">
      
      {/* Top Header */}
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/cliente')} className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" theme="dark" />
            <span className="text-xs bg-orange-500/20 text-[#fc8127] border border-orange-500/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
              Mi Panel Cliente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/configuracion-cliente')} className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs font-bold flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-[#fc8127]" />
            <span className="hidden sm:inline">Configuración</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all text-xs font-bold flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {ticketSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{ticketSuccessMsg}</span>
            <button onClick={() => setTicketSuccessMsg(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Hero Profile Card — Estilo Mi Hogar */}
        <section className="bg-gradient-to-r from-[#001529] via-[#002547] to-[#001529] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#fc8127]/10 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
            {/* Left: Avatar + Info */}
            <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#fc8127] shadow-xl bg-slate-800">
                  <img
                    src={authProfile?.foto_perfil || authProfile?.fotoPerfil || 'https://i.pravatar.cc/150'}
                    alt={authProfile?.nombre || 'Cliente'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-xl border-2 border-slate-950 shadow-md">
                  <ShieldCheck className="w-4 h-4 fill-current" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cliente Verificado
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white">{authProfile?.nombre || 'Cliente'}</h1>
                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#fc8127]" /> {authProfile?.ciudad ? `${authProfile.ciudad}, ${authProfile.provincia}` : 'Argentina'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Miembro activo desde {authProfile?.created_at ? new Date(authProfile.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : 'recientemente'}
                </p>
              </div>
            </div>

            {/* Right: Real Metrics */}
            <div className="md:col-span-5 grid grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                <p className="text-2xl font-black text-white">{propiedades.length}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Propiedades</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                <p className="text-2xl font-black text-[#fc8127]">{expedientes.length}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Historial</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                <p className="text-2xl font-black text-emerald-400">{conversaciones.length}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Mensajes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-1.5 flex overflow-x-auto gap-1">
          {[
            { id: 'resumen', label: 'Resumen General', icon: <User className="w-4 h-4" /> },
            { id: 'hogar', label: `Mi Hogar (${propiedades.length})`, icon: <Building className="w-4 h-4" /> },
            { id: 'expedientes', label: `Historial (${expedientes.length})`, icon: <Folder className="w-4 h-4" /> },
            { id: 'favoritos', label: `Favoritos (${favoritos.length})`, icon: <Heart className="w-4 h-4" /> },
            { id: 'mensajes', label: `Mensajes (${conversaciones.length})`, icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'soporte', label: `Soporte & Resolución`, icon: <ShieldAlert className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#fc8127] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: RESUMEN GENERAL */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* Acceso Rápido Mi Hogar */}
            <div
              onClick={() => router.push('/mi-hogar')}
              className="bg-gradient-to-r from-amber-950/30 via-[#001529] to-[#001529] border-2 border-amber-500/40 rounded-3xl p-6 hover:border-amber-400 transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                  🏠
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="font-black text-lg text-white">Mi Hogar Digital</h3>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                      {propiedades.length} Propiedades
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Gestioná comprobantes, facturas, garantias y mantenimientos de tu casa o departamento.
                  </p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md group-hover:opacity-90 transition-opacity shrink-0">
                Ir a Mi Hogar →
              </button>
            </div>

            {/* Accesos Rápidos de Contratación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => router.push('/publicar-trabajo')}
                className="bg-[#001529] border border-slate-800 hover:border-[#fc8127]/50 rounded-3xl p-6 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center text-[#fc8127] group-hover:scale-110 transition-transform">
                  <FilePlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white">Modo Publicar Trabajo</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Publicá lo que necesitás reparar y recibí presupuestos comparables de profesionales en tu zona.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#fc8127] pt-2">
                  <span>Publicar Ahora</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => router.push('/cliente')}
                className="bg-[#001529] border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white">Modo Búsqueda Directa</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Encontrá al profesional verificado que más te guste y enviale una consulta directa por chat.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-400 pt-2">
                  <span>Buscar Especialista</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Resumen de Historial Reciente */}
            <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#fc8127]" /> Historial Reciente de Trabajos
                </h3>
                <button onClick={() => setActiveTab('expedientes')} className="text-xs font-bold text-[#fc8127] hover:underline">
                  Ver todos
                </button>
              </div>

              {expedientes.length === 0 ? (
                <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <Folder className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">No tenés trabajos en tu historial todavía</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Cuando aceptes un presupuesto con un profesional, se creará su carpeta digital con contrato, chat y factura.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expedientes.slice(0, 3).map(exp => (
                    <div
                      key={exp.id}
                      onClick={() => router.push(`/expediente/${exp.id}`)}
                      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-[#fc8127]/10 border border-[#fc8127]/30 rounded-xl flex items-center justify-center text-[#fc8127]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white group-hover:text-[#fc8127] transition-colors">{exp.titulo}</h4>
                          <p className="text-xs text-slate-400">{exp.profesional?.nombre || 'Profesional'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-400">
                          ${parseFloat(exp.costo_total || 0).toLocaleString('es-AR')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#fc8127] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MI HOGAR */}
        {activeTab === 'hogar' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg text-white">Mi Hogar — Mis Propiedades</h3>
                <p className="text-xs text-slate-400">Centro digital de documentación de tus inmuebles</p>
              </div>
              <button
                onClick={() => router.push('/mi-hogar')}
                className="bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Administrar Propiedades
              </button>
            </div>

            {propiedades.length === 0 ? (
              <div className="bg-[#001529] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-3xl mx-auto">🏠</div>
                <h4 className="font-black text-lg text-white">Todavía no registraste ninguna propiedad</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Agregá tu casa o departamento para organizar facturas, comprobantes, garantías y mantenimientos.
                </p>
                <button
                  onClick={() => router.push('/mi-hogar')}
                  className="bg-[#fc8127] text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg"
                >
                  Registrar mi primera propiedad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propiedades.map(prop => (
                  <div
                    key={prop.id}
                    onClick={() => router.push(`/mi-hogar/${prop.id}`)}
                    className="bg-[#001529] border border-slate-800 hover:border-[#fc8127]/50 rounded-3xl p-5 cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-2xl">
                        {prop.tipo === 'departamento' ? '🏢' : prop.tipo === 'oficina' ? '🏗️' : '🏠'}
                      </div>
                      <div>
                        <h4 className="font-black text-base text-white group-hover:text-[#fc8127] transition-colors">{prop.nombre}</h4>
                        <p className="text-xs text-slate-400 capitalize">{prop.tipo}</p>
                      </div>
                    </div>
                    {prop.direccion && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#fc8127]" /> {prop.direccion}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-bold text-[#fc8127]">
                      <span>Ver Expediente del Inmueble</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXPEDIENTES DEL TRABAJO */}
        {activeTab === 'expedientes' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-lg text-white">📁 Historial de Trabajos</h3>
              <p className="text-xs text-slate-400">Registro de tus contrataciones (presupuesto, chat, garantía y factura)</p>
            </div>

            {expedientes.length === 0 ? (
              <div className="bg-[#001529] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Folder className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="font-black text-base text-white">Todavía no tenés trabajos en tu historial</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Cada vez que aceptás un presupuesto, se agrega automáticamente a tu historial con la garantía y el seguimiento completo.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {[
                  { key: 'curso', titulo: 'En curso', lista: expedientes.filter(exp => !['finalizado', 'con_garantia'].includes(exp.ordenes_trabajo?.estado)) },
                  { key: 'fin', titulo: 'Finalizados', lista: expedientes.filter(exp => ['finalizado', 'con_garantia'].includes(exp.ordenes_trabajo?.estado)) },
                ].filter(grupo => grupo.lista.length > 0).map(grupo => (
                <div key={grupo.key} className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide">{grupo.titulo}</h4>
                {grupo.lista.map(exp => {
                  const estadoOrden = exp.ordenes_trabajo?.estado;
                  const pill = estadoOrden === 'con_garantia'
                    ? { label: '🛡️ Con garantía', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
                    : estadoOrden === 'finalizado'
                    ? { label: '🟢 Finalizado', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
                    : estadoOrden === 'esperando_confirmacion'
                    ? { label: '🏁 Esperando tu confirmación', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/30' }
                    : { label: '🔵 En curso', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
                  return (
                  <div
                    key={exp.id}
                    onClick={() => router.push(`/expediente/${exp.id}`)}
                    className="bg-[#001529] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 cursor-pointer transition-all space-y-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-base text-white group-hover:text-[#fc8127] transition-colors">{exp.titulo}</h4>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${pill.cls}`}>{pill.label}</span>
                          </div>
                          <p className="text-xs text-slate-400">Profesional: {exp.profesional?.nombre || 'Asignado'}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-400">
                        ${parseFloat(exp.costo_total || 0).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Garantía: {exp.garantia || '30 días'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#fc8127]" /> {new Date(exp.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>

                    {exp.ordenes_trabajo?.estado === 'esperando_confirmacion' && (
                      <div onClick={e => e.stopPropagation()} className="pt-3 border-t border-slate-800/80 space-y-2.5">
                        <p className="text-xs font-bold text-orange-400">
                          🏁 Tu profesional marcó este trabajo como terminado. ¿Confirmás?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmarFinalizacion(exp, true)}
                            disabled={confirmandoId === exp.id}
                            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
                          >
                            {confirmandoId === exp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Sí, está terminado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmarFinalizacion(exp, false)}
                            disabled={confirmandoId === exp.id}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
                          >
                            Todavía no
                          </button>
                        </div>
                      </div>
                    )}

                    {['finalizado', 'con_garantia'].includes(exp.ordenes_trabajo?.estado) && (
                      <div onClick={e => e.stopPropagation()} className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                        {exp.profesional_id && (
                          <button
                            type="button"
                            onClick={() => handleRecontratar(exp.profesional_id)}
                            disabled={recontratandoId === exp.profesional_id}
                            className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
                          >
                            {recontratandoId === exp.profesional_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Volver a contratar
                          </button>
                        )}
                        {ordenesResenadas.includes(exp.orden_trabajo_id) ? (
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Ya calificaste este trabajo
                          </p>
                        ) : resenandoExpId === exp.id ? (
                          <div className="space-y-3 bg-slate-900/60 rounded-2xl p-4">
                            {[
                              { key: 'puntualidad', label: 'Puntualidad' },
                              { key: 'resolvioProblema', label: 'Resolvió el problema' },
                              { key: 'dejoLimpio', label: 'Dejó todo limpio' },
                            ].map(campo => (
                              <div key={campo.key} className="flex items-center justify-between">
                                <span className="text-xs text-slate-300">{campo.label}</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                      key={n}
                                      type="button"
                                      onClick={() => setResenaForm(f => ({ ...f, [campo.key]: n }))}
                                    >
                                      <Star className={`w-5 h-5 ${n <= (resenaForm as any)[campo.key] ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-300">¿Volverías a contratarlo?</span>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => setResenaForm(f => ({ ...f, volveriaContratar: true }))} className={`text-[11px] font-bold px-3 py-1 rounded-lg ${resenaForm.volveriaContratar ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>Sí</button>
                                <button type="button" onClick={() => setResenaForm(f => ({ ...f, volveriaContratar: false }))} className={`text-[11px] font-bold px-3 py-1 rounded-lg ${!resenaForm.volveriaContratar ? 'bg-red-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>No</button>
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={resenaForm.comentario}
                              onChange={e => setResenaForm(f => ({ ...f, comentario: e.target.value }))}
                              placeholder="Comentario (opcional)"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setResenandoExpId(null)} className="text-xs text-slate-500 font-bold px-3 py-2 hover:underline">Cancelar</button>
                              <button
                                type="button"
                                onClick={() => handleCrearResena(exp)}
                                disabled={enviandoResena}
                                className="text-xs bg-[#fc8127] hover:bg-[#e06d19] disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
                              >
                                {enviandoResena ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />} Enviar reseña
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setResenandoExpId(exp.id)}
                            className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5" /> Calificar trabajo
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
                </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-lg text-white">❤️ Profesionales favoritos</h3>
              <p className="text-xs text-slate-400">Guardaste estos perfiles para encontrarlos rápido cuando los necesites</p>
            </div>

            {favoritos.length === 0 ? (
              <div className="bg-[#001529] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Heart className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="font-black text-base text-white">Todavía no guardaste favoritos</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tocá el corazón en el perfil de un profesional o en los resultados de búsqueda para guardarlo acá.
                </p>
                <button
                  onClick={() => router.push('/buscar-profesionales')}
                  className="text-xs bg-[#fc8127] hover:bg-[#e06d19] text-white font-black px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" /> Buscar profesionales
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoritos.map((fav: any) => {
                  const pro = fav.profesional;
                  if (!pro) return null;
                  return (
                    <div
                      key={fav.id}
                      className="bg-[#001529] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={pro.foto_perfil || `https://i.pravatar.cc/150?u=${pro.id}`}
                        alt={pro.nombre}
                        className="w-12 h-12 rounded-full object-cover shrink-0 cursor-pointer"
                        onClick={() => router.push(`/profesional/${pro.id}`)}
                      />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/profesional/${pro.id}`)}>
                        <p className="font-black text-sm text-white truncate">{pro.nombre}</p>
                        <p className="text-xs text-slate-400 truncate">{Array.isArray(pro.oficios) ? pro.oficios.join(', ') : (pro.oficios || 'Profesional')}</p>
                        <p className="text-[11px] text-slate-500 truncate">{pro.ciudad ? `${pro.ciudad}, ` : ''}{pro.provincia}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {typeof pro.rating === 'number' && pro.rating > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {pro.rating.toFixed(1)}
                          </span>
                        )}
                        <button
                          onClick={() => handleQuitarFavorito(pro.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-400 transition-colors"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MIS MENSAJES & PRESUPUESTOS (3 ESTADOS) */}
        {activeTab === 'mensajes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-black text-lg text-white">💬 Mis Conversaciones & Presupuestos</h3>
                <p className="text-xs text-slate-400">Filtrá tus chats en 3 estados unificados</p>
              </div>

              {/* Filtro 3 Estados */}
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 text-xs">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'consulta', label: 'Consulta' },
                  { id: 'trabajo', label: 'Trabajo' },
                  { id: 'finalizado', label: 'Finalizado' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterChatState(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterChatState === f.id
                        ? 'bg-[#fc8127] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredConversaciones.length === 0 ? (
              <div className="bg-[#001529] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="font-black text-base text-white">No tenés mensajes en este filtro</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Iniciá una consulta con cualquier profesional desde el buscador para negociar un presupuesto.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversaciones.map(conv => {
                  const estadoChat = conv.estado_chat || 'consulta';
                  return (
                    <div
                      key={conv.id}
                      onClick={() => router.push(`/chat/${conv.id}`)}
                      className="bg-[#001529] border border-slate-800 hover:border-slate-700 rounded-3xl p-5 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={conv.interlocutor?.avatar || conv.interlocutor?.foto_perfil || 'https://i.pravatar.cc/150'}
                          alt={conv.interlocutor?.nombre || 'Profesional'}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-white group-hover:text-[#fc8127] transition-colors">
                              {conv.interlocutor?.nombre || 'Profesional'}
                            </h4>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              estadoChat === 'trabajo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              estadoChat === 'finalizado' ? 'bg-slate-800 text-slate-400' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              Chat {estadoChat}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                            {conv.ultimo_mensaje || 'Consultá sobre disponibilidad y presupuestos...'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-[#fc8127] transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CENTRO DE SOPORTE (#SO-XXXXXX) & RESOLUCIÓN */}
        {activeTab === 'soporte' && (
          <div className="space-y-6">
            {/* Header Soporte */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-black text-lg text-white">🛡️ Centro de Soporte & Resolución</h3>
                <p className="text-xs text-slate-400">Atención directa conectada con los Administradores (#SO-XXXXXX)</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFormDisputa(true)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" /> Mediación
                </button>
                <button
                  onClick={() => setShowFormTicket(true)}
                  className="bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nueva Consulta #SO
                </button>
              </div>
            </div>

            {/* Modal / Formulario Nueva Consulta / Ticket Soporte */}
            {showFormTicket && (
              <form onSubmit={handleCrearTicket} className="bg-[#001529] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-base text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#fc8127]" /> Nueva Consulta o Sugerencia a Soporte
                  </h4>
                  <button type="button" onClick={() => setShowFormTicket(false)} className="text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Categoría *</label>
                    <select
                      value={ticketForm.categoria}
                      onChange={e => setTicketForm(f => ({ ...f, categoria: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#fc8127]"
                    >
                      <option value="Ayuda">Ayuda / Preguntas Frecuentes</option>
                      <option value="Reportar problema">Reportar problema en la app</option>
                      <option value="Reclamo">Reclamo administrativo</option>
                      <option value="Denunciar usuario">Denunciar usuario</option>
                      <option value="Sugerencias">Sugerencia de mejora</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Asunto principal</label>
                    <input
                      type="text"
                      placeholder="Ej: Inconveniente al pagar presupuesto..."
                      value={ticketForm.asunto}
                      onChange={e => setTicketForm(f => ({ ...f, asunto: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                    />
                  </div>
                </div>

                {CATEGORIAS_SOBRE_PROFESIONAL.includes(ticketForm.categoria) && (
                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1.5">¿Con qué profesional fue esto? *</label>
                    {expedientes.length === 0 ? (
                      <p className="text-[11px] text-slate-500 bg-slate-800/60 border border-slate-700 rounded-xl p-2.5">
                        No tenés ningún trabajo registrado con un profesional todavía, así que no podemos vincular este reclamo a nadie en particular.
                      </p>
                    ) : (
                      <select
                        required
                        value={ticketForm.profesionalId}
                        onChange={e => setTicketForm(f => ({ ...f, profesionalId: e.target.value }))}
                        className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Seleccioná el profesional...</option>
                        {expedientes.map((exp: any) => (
                          <option key={exp.id} value={exp.profesional_id}>{exp.profesional?.nombre || 'Profesional'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Mensaje detallado *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describí con detalle tu sugerencia o consulta. El equipo de administración te responderá directamente aquí."
                    value={ticketForm.mensaje}
                    onChange={e => setTicketForm(f => ({ ...f, mensaje: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFormTicket(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoTicket}
                    className="px-6 py-2.5 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-black flex items-center gap-2 disabled:opacity-50"
                  >
                    {enviandoTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar a Administración</>}
                  </button>
                </div>
              </form>
            )}

            {/* Modal / Formulario Centro de Resolución */}
            {showFormDisputa && (
              <form onSubmit={handleCrearDisputa} className="bg-[#001529] border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-base text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Centro de Resolución (Mediación Pre-Reseña)
                  </h4>
                  <button type="button" onClick={() => setShowFormDisputa(false)} className="text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1.5">¿Con qué profesional fue esto? *</label>
                  {expedientes.length === 0 ? (
                    <p className="text-[11px] text-slate-500 bg-slate-800/60 border border-slate-700 rounded-xl p-2.5">
                      No tenés ningún trabajo registrado con un profesional todavía.
                    </p>
                  ) : (
                    <select
                      required
                      value={disputaForm.profesionalId}
                      onChange={e => setDisputaForm(f => ({ ...f, profesionalId: e.target.value }))}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Seleccioná el profesional...</option>
                      {expedientes.map((exp: any) => (
                        <option key={exp.id} value={exp.profesional_id}>{exp.profesional?.nombre || 'Profesional'}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Tipo de solución deseada *</label>
                    <select
                      value={disputaForm.tipo_solucion}
                      onChange={e => setDisputaForm(f => ({ ...f, tipo_solucion: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Hablar con profesional">Hablar con el profesional</option>
                      <option value="Solicitar corrección">Solicitar corrección del trabajo</option>
                      <option value="Solicitar devolución parcial">Solicitar devolución parcial</option>
                      <option value="Cancelar garantía">Cancelar garantía</option>
                      <option value="Intervención OficiosYa">Pedir intervención urgente de OficiosYa Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Monto reclamado ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={disputaForm.monto_reclamado}
                      onChange={e => setDisputaForm(f => ({ ...f, monto_reclamado: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Explicación del caso *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describí qué ocurrió para buscar un acuerdo justo antes de calificar..."
                    value={disputaForm.descripcion}
                    onChange={e => setDisputaForm(f => ({ ...f, descripcion: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFormDisputa(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoDisputa}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-2 disabled:opacity-50"
                  >
                    {enviandoDisputa ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Iniciar Mediación</>}
                  </button>
                </div>
              </form>
            )}

            {/* Listado de Tickets (#SO-XXXXXX) */}
            <div className="bg-[#001529] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="font-black text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#fc8127]" /> Mis Consultas y Sugerencias (#SO-XXXXXX)
              </h4>

              {tickets.length === 0 ? (
                <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">No tenés tickets generados aún</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Hacé clic en "+ Nueva Consulta #SO" para enviarle una duda o sugerencia directamente a la administración.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(t => (
                    <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#fc8127] font-mono">{t.codigo_ticket}</span>
                          <span className="text-xs font-bold text-white">— {t.categoria}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase self-start sm:self-auto ${getTicketStatusBadge(t.estado)}`}>
                          {t.estado}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{t.mensaje}</p>

                      {/* Respuesta del Administrador */}
                      {t.respuesta_admin ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 space-y-1 mt-2">
                          <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Respuesta de la Administración OficiosYa:
                          </p>
                          <p className="text-xs text-slate-200 leading-relaxed">{t.respuesta_admin}</p>
                          {t.fecha_respuesta && (
                            <p className="text-[9px] text-slate-400 pt-1">
                              {new Date(t.fecha_respuesta).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">
                          Esperando respuesta de la administración...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listado de Mediaciones Activas */}
            {disputas.length > 0 && (
              <div className="bg-[#001529] border border-amber-500/30 rounded-3xl p-6 space-y-4">
                <h4 className="font-black text-base text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Mediaciones y Casos de Resolución
                </h4>
                <div className="space-y-3">
                  {disputas.map(d => (
                    <div key={d.id} className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400">{d.tipo_solucion}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                          {d.estado?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{d.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}