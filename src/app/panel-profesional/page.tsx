"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, Edit2, Calendar, FileText, TrendingUp,
  Zap, Clock, ChevronRight, ChevronLeft, Wrench, Paintbrush,
  CheckCircle, ShieldCheck, Timer, LayoutDashboard,
  Briefcase, MessageSquare, User, Users, Plus, Settings, BarChart2,
  Hammer, Grid, ImagePlus, Star, Crown, HelpCircle, Send, X, Loader2,
  Lightbulb, Info, Trash2, Compass, BookmarkPlus, Handshake, AlertTriangle,
  Zap as Bolt, Award, TrendingDown, Eye, Trophy, ChevronDown,
  Sparkles, Layers, Target, Gift, LogOut
} from 'lucide-react';
import Logo from '@/components/Logo';
import BienvenidaProModal from '@/components/BienvenidaProModal';
import { dbHelper, supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';

export default function PanelProfesionalPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <PanelProfesionalContent />
    </AuthGuard>
  );
}

// ─── Colores de nivel ───────────────────────────────────────────────────────
const NIVEL_CONFIG: Record<string, { color: string; bg: string; border: string; min: number; max: number; next: string }> = {
  Bronce:  { color: 'text-amber-600',   bg: 'bg-amber-500/20',   border: 'border-amber-500/40',  min: 0,   max: 199,  next: 'Plata' },
  Plata:   { color: 'text-slate-300',   bg: 'bg-slate-400/20',   border: 'border-slate-400/40',  min: 200, max: 499,  next: 'Oro' },
  Oro:     { color: 'text-yellow-400',  bg: 'bg-yellow-400/20',  border: 'border-yellow-400/40', min: 500, max: 999,  next: 'Platino' },
  Platino: { color: 'text-cyan-300',    bg: 'bg-cyan-400/20',    border: 'border-cyan-400/40',   min: 1000,max: 9999, next: '—' },
};

// ─── Chat mode badge ─────────────────────────────────────────────────────────
const CHAT_BADGE: Record<string, { label: string; cls: string }> = {
  consulta:   { label: 'Consulta',   cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  trabajo:    { label: 'En Trabajo', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  finalizado: { label: 'Finalizado', cls: 'bg-slate-600/20 text-slate-400 border-slate-600/30' },
};

function PanelProfesionalContent() {
  const router = useRouter();
  const { profile: authProfile, user } = useAuth();

  const [perfil, setPerfil] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // Datos reales
  const [stats, setStats] = useState({ activeJobs: 0, presupuestos: 0, ganancias: '$0', trabajosFinalizados: 0, resenasPositivas: 0, tasaRespuesta: '—', rating: 0 });
  const [actividad, setActividad] = useState<any[]>([]);
  const [historialClientes, setHistorialClientes] = useState<any[]>([]);
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [puntos, setPuntos] = useState<any>(null);

  // Calendario
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [activeNote, setActiveNote] = useState<string>('');

  // Soporte
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportType, setSupportType] = useState('Pregunta');
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Tab activo
  const [activeTab, setActiveTab] = useState<'panel' | 'clientes' | 'mensajes' | 'agenda'>('panel');

  // ── Confetti & perfil ──────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('show_confetti') === 'true') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#fc8127', '#00355f', '#4CAF50'] });
      localStorage.removeItem('show_confetti');
    }
    if (authProfile) setPerfil(authProfile);
  }, [authProfile]);

  // ── Carga de datos reales ─────────────────────────────────────────────────
  useEffect(() => {
    if (!perfil?.id) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const [reviews, ordenes, actividadData, histClientes, convs, puntosData] = await Promise.all([
          dbHelper.getReviewsForProfessional(perfil.id).catch(() => []),
          dbHelper.getOrdenesTrabajoProfesional(perfil.id).catch(() => []),
          dbHelper.getActividadReciente(perfil.id).catch(() => []),
          dbHelper.getHistorialClientes(perfil.id).catch(() => []),
          dbHelper.getConversacionesRecientes(perfil.id, 5).catch(() => []),
          dbHelper.getOrCreatePuntosProfesional(perfil.id).catch(() => null),
        ]);

        const avgRating = reviews.length > 0
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
          : 0;
        const finalizados = ordenes.filter((o: any) => o.estado === 'finalizado' || o.estado === 'con_garantia');
        const enProgreso = ordenes.filter((o: any) => o.estado === 'en_progreso');
        const totalGanancias = finalizados.reduce((acc: number, o: any) => acc + parseFloat(o.monto || 0), 0);

        setStats({
          activeJobs: enProgreso.length,
          presupuestos: ordenes.length,
          ganancias: '$' + totalGanancias.toLocaleString('es-AR'),
          trabajosFinalizados: finalizados.length,
          resenasPositivas: reviews.length,
          tasaRespuesta: '100%',
          rating: parseFloat(avgRating.toFixed(1)),
        });
        setActividad(actividadData);
        setHistorialClientes(histClientes);
        setConversaciones(convs);
        setPuntos(puntosData);
      } catch (err) {
        console.error('Error cargando panel:', err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [perfil?.id]);

  // ── Calendario ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_calendar_notes');
    if (stored) setNotes(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    setActiveNote(notes[key] || '');
  }, [selectedDate, notes]);

  const handleSaveNote = () => {
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const updated = { ...notes };
    if (!activeNote.trim()) delete updated[key]; else updated[key] = activeNote;
    setNotes(updated);
    localStorage.setItem('oficiosya_calendar_notes', JSON.stringify(updated));
  };

  const monthsList = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const firstDay = (m: number, y: number) => new Date(y, m, 1).getDay();
  const blanks = Array(firstDay(currentMonth, currentYear)).fill(null);
  const monthDays = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
  const totalCells = [...blanks, ...monthDays];

  // ── Soporte ────────────────────────────────────────────────────────────────
  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || !user?.id) return;
    setIsSendingTicket(true);
    try {
      await dbHelper.crearTicketSoporte({
        usuario_id: user.id,
        categoria: supportType as any,
        asunto: supportType,
        mensaje: supportMessage,
      });
      setSupportMessage('');
      setShowSupportModal(false);
    } catch (err) {
      console.error('Error al enviar ticket:', err);
    } finally {
      setIsSendingTicket(false);
    }
  };

  // ── Nivel y puntos ─────────────────────────────────────────────────────────
  const nivelActual = puntos?.nivel || 'Bronce';
  const puntosTotal = puntos?.puntos_totales || 0;
  const nivelCfg = NIVEL_CONFIG[nivelActual] || NIVEL_CONFIG.Bronce;
  const progreso = nivelActual !== 'Platino'
    ? Math.min(100, ((puntosTotal - nivelCfg.min) / (nivelCfg.max - nivelCfg.min)) * 100)
    : 100;

  // ── Slugs / URL pública ────────────────────────────────────────────────────
  const slugPerfil = perfil?.slug || '';
  const urlPublica = slugPerfil ? `superoficios.com/${slugPerfil}` : `superoficios.com/p/${perfil?.id?.slice(0, 8)}`;

  const handleLogout = async () => {
    await dbHelper.logout();
    router.push('/login');
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2040] to-[#0a1628] text-white font-sans overflow-x-hidden pb-24 md:pb-8">
      <BienvenidaProModal />


      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d1f3c]/90 border-b border-white/10 px-4 md:px-8 h-16 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="sm" theme="dark" />
        </div>

        {/* Nivel Badge */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black ${nivelCfg.bg} ${nivelCfg.border} ${nivelCfg.color}`}>
          <Trophy className="w-3.5 h-3.5" />
          {nivelActual} · {puntosTotal} pts
        </div>

        <div className="flex items-center gap-2">
          {/* URL pública */}
          {slugPerfil && (
            <button
              onClick={() => router.push(`/profesional/${slugPerfil}`)}
              className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#fc8127] transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Eye className="w-3.5 h-3.5" />
              {urlPublica}
            </button>
          )}

          {/* Disponible toggle */}
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${isAvailable ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-700/30 border-slate-600/30 text-slate-400'}`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-slate-500'}`} />
            {isAvailable ? 'Disponible' : 'No disponible'}
          </button>

          <button onClick={() => router.push('/notificaciones')} className="relative p-2 rounded-xl hover:bg-white/10 text-slate-300 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0d1f3c]" />
          </button>

          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#fc8127]/40 cursor-pointer hover:border-[#fc8127] transition-colors shrink-0" onClick={() => router.push('/configuracion-profesional')}>
            <img src={perfil?.avatar || 'https://i.pravatar.cc/150?u=pro'} alt="Avatar" className="w-full h-full object-cover" />
          </div>

          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── SIDEBAR DESKTOP ────────────────────────────────────────────── */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-[#0a1628]/95 border-r border-white/8 z-30 flex-col items-center py-5 gap-2 select-none">
        {[
          { key: 'panel', icon: LayoutDashboard, label: 'Panel', action: () => setActiveTab('panel') },
          { key: 'muro', icon: Grid, label: 'Muro', action: () => router.push('/muro-trabajos') },
          { key: 'mensajes', icon: MessageSquare, label: 'Mensajes', action: () => router.push('/chat') },
          { key: 'clientes', icon: Users, label: 'Clientes', action: () => setActiveTab('clientes') },
          { key: 'finanzas', icon: TrendingUp, label: 'Finanzas', action: () => router.push('/mis-finanzas') },
          { key: 'marca', icon: Zap, label: 'Mi Marca', action: () => router.push('/mi-marca') },
          { key: 'crecimiento', icon: Trophy, label: 'Nivel', action: () => router.push('/centro-crecimiento') },
        ].map(item => (
          <button
            key={item.key}
            onClick={item.action}
            className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-2xl transition-all group ${
              activeTab === item.key
                ? 'bg-[#fc8127]/20 text-[#fc8127] border border-[#fc8127]/30'
                : 'text-slate-500 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}

        <div className="mt-auto mb-4 space-y-2">
          <button onClick={() => setShowSupportModal(true)} className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <HelpCircle className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Soporte</span>
          </button>
          <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Ajustes</span>
          </button>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────── */}
      <div className="md:ml-20 max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 pb-28 md:pb-8">

        {/* ── HERO SECTION ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#0d2040] via-[#102c55] to-[#0d2040] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Avatar + status */}
            <div className="relative shrink-0">
              <img
                src={perfil?.avatar || 'https://i.pravatar.cc/150?u=pro'}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#fc8127]/50 shadow-xl"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0d2040] shadow-md ${isAvailable ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Hola, {perfil?.nombre?.split(' ')[0] || 'Profesional'} 👋
                </h1>
                {perfil?.plan && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    perfil.plan === 'Master' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    perfil.plan === 'Pro' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>Plan {perfil.plan}</span>
                )}
                {perfil?.verificado && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verificado
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {perfil?.oficios?.join(', ') || 'Profesional'} · {perfil?.ciudad || ''}{perfil?.provincia ? ', ' + perfil.provincia : ''}
              </p>

              {/* Perfil Vivo — Actividad Reciente */}
              {actividad.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {actividad.map((act, i) => (
                    <span key={i} className="text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                      <span>{act.icono}</span> {act.texto}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                onClick={() => router.push('/editar-perfil-publico')}
                className="px-4 py-2.5 bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5"
              >
                <ImagePlus className="w-4 h-4" /> Editar Perfil
              </button>
              <button
                onClick={() => router.push('/mi-marca')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-[#fc8127]" /> Mi Marca
              </button>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID MÉTRICAS ──────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Trabajos Activos', value: stats.activeJobs, icon: '🔧', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', onClick: () => router.push('/mis-trabajos') },
            { label: 'Ganancias del Mes', value: stats.ganancias, icon: '💰', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', onClick: () => router.push('/mis-finanzas') },
            { label: 'Reseñas', value: stats.resenasPositivas, icon: '⭐', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', onClick: () => router.push('/mi-marca') },
            { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : '—', icon: '🏆', color: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/30', onClick: () => router.push('/mi-marca') },
          ].map((metric, i) => (
            <div
              key={i}
              onClick={metric.onClick}
              className={`bg-gradient-to-br ${metric.color} border ${metric.border} rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.98] group`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform block mb-2">{metric.icon}</span>
              <p className="text-xl md:text-2xl font-black text-white">{String(metric.value).padStart(metric.label === 'Ganancias del Mes' ? 1 : 2, '0')}</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">{metric.label}</p>
            </div>
          ))}
        </section>

        {/* ── SISTEMA OPERATIVO PRO (UNA SOLA VEZ) ─────────────────────── */}
        <section className="bg-gradient-to-r from-[#0d2040] via-[#102c55] to-[#0d2040] border border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#fc8127]" /> Sistema Operativo
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Gestión integral — órdenes, marca, finanzas y crecimiento</p>
            </div>
            <span className="text-[10px] font-black bg-[#fc8127]/20 text-[#fc8127] border border-[#fc8127]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              SuperOficios PRO
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { route: '/orden-trabajo',      label: 'Órdenes',     desc: 'Gestión formal garantizada',    icon: '📋', from: 'from-blue-500/20',   border: 'border-blue-500/30',   iconBg: 'bg-blue-500/20 text-blue-300' },
              { route: '/mi-marca',           label: 'Mi Marca',    desc: 'Confianza y marketing digital', icon: '⚡', from: 'from-purple-500/20', border: 'border-purple-500/30', iconBg: 'bg-purple-500/20 text-purple-300' },
              { route: '/mis-finanzas',       label: 'Finanzas',    desc: 'Estadísticas y evolución',      icon: '📈', from: 'from-emerald-500/20',border: 'border-emerald-500/30',iconBg: 'bg-emerald-500/20 text-emerald-300' },
              { route: '/centro-crecimiento', label: 'Crecimiento', desc: 'Misiones, logros y nivel',      icon: '🏆', from: 'from-amber-500/20',  border: 'border-amber-500/30',  iconBg: 'bg-amber-500/20 text-amber-300' },
            ].map(mod => (
              <div
                key={mod.route}
                onClick={() => router.push(mod.route)}
                className={`bg-gradient-to-br ${mod.from}/50 border ${mod.border} rounded-2xl p-4 cursor-pointer hover:scale-[1.03] hover:shadow-lg transition-all active:scale-[0.98] group`}
              >
                <div className={`w-10 h-10 ${mod.iconBg} rounded-xl flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                  {mod.icon}
                </div>
                <p className="text-sm font-black text-white">{mod.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TABS: PANEL / CLIENTES / MENSAJES / AGENDA ───────────────── */}
        <div className="flex gap-1 bg-[#0d2040] border border-white/10 rounded-2xl p-1">
          {([
            { id: 'panel',    label: 'Resumen',   icon: LayoutDashboard },
            { id: 'clientes', label: 'Clientes',  icon: Users },
            { id: 'mensajes', label: 'Mensajes',  icon: MessageSquare },
            { id: 'agenda',   label: 'Agenda',    icon: Calendar },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-[#fc8127] text-white shadow-lg shadow-[#fc8127]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: RESUMEN ─────────────────────────────────────────────── */}
        {activeTab === 'panel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Columna izquierda */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Trabajos activos */}
              <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#fc8127]" /> Trabajos en Curso
                  </h3>
                  <button onClick={() => router.push('/mis-trabajos')} className="text-xs font-bold text-[#fc8127] hover:underline">Ver todos →</button>
                </div>

                {stats.activeJobs === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-sm font-bold text-slate-300">Sin trabajos activos</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Postulate a trabajos en el muro para conseguir clientes</p>
                    <button onClick={() => router.push('/muro-trabajos')} className="bg-[#fc8127] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#e06d19] transition-colors">
                      Explorar Muro
                    </button>
                  </div>
                ) : (
                  <div onClick={() => router.push('/mis-trabajos')} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">✅</div>
                      <div>
                        <p className="font-black text-sm text-white">{stats.activeJobs} trabajo(s) en progreso</p>
                        <p className="text-xs text-slate-400">Click para gestionar</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Bolsa de Empleo */}
              <div
                onClick={() => router.push('/bolsa-empleo')}
                className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:border-[#fc8127]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fc8127]/20 rounded-2xl flex items-center justify-center border border-[#fc8127]/30">
                    <Handshake className="w-6 h-6 text-[#fc8127]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-white">Bolsa de Empleo</h3>
                      <span className="text-[9px] font-black bg-[#fc8127] text-white px-2 py-0.5 rounded-full uppercase">Nuevo</span>
                    </div>
                    <p className="text-xs text-slate-400">Publicá o encontrá empleo para tu equipo</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); router.push('/publicar-empleo'); }} className="px-3 py-1.5 bg-[#fc8127] text-white font-black text-[11px] rounded-xl hover:bg-[#e06d19] transition-colors">
                    Publicar
                  </button>
                </div>
              </div>

              {/* Mi Crecimiento / Puntos */}
              <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#fc8127]" /> Mi Crecimiento
                  </h3>
                  <button onClick={() => router.push('/centro-crecimiento')} className="text-xs font-bold text-[#fc8127] hover:underline">Ver todo →</button>
                </div>

                {/* Nivel y barra de progreso */}
                <div className={`${nivelCfg.bg} border ${nivelCfg.border} rounded-2xl p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {nivelActual === 'Platino' ? '💎' : nivelActual === 'Oro' ? '🥇' : nivelActual === 'Plata' ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <p className={`text-sm font-black ${nivelCfg.color}`}>{nivelActual}</p>
                        <p className="text-[11px] text-slate-400">{puntosTotal} pts totales</p>
                      </div>
                    </div>
                    {nivelActual !== 'Platino' && (
                      <span className="text-[11px] text-slate-400">→ {nivelCfg.next}</span>
                    )}
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        nivelActual === 'Platino' ? 'bg-cyan-400' : nivelActual === 'Oro' ? 'bg-yellow-400' : nivelActual === 'Plata' ? 'bg-slate-300' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                {/* Acciones para ganar puntos */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { accion: 'Compartir perfil', pts: '+50', icon: '🔗', fn: () => { navigator.clipboard.writeText(`https://${urlPublica}`); } },
                    { accion: 'Invitar colega',   pts: '+100', icon: '👥', fn: () => router.push('/mi-marca') },
                    { accion: 'Completar perfil', pts: '+50', icon: '✅', fn: () => router.push('/editar-perfil-publico') },
                    { accion: 'Ver misiones',     pts: '→',   icon: '🎯', fn: () => router.push('/centro-crecimiento') },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.fn}
                      className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight">{item.accion}</p>
                        <p className="text-[10px] text-[#fc8127] font-black">{item.pts} pts</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <aside className="space-y-5">
              {/* Rendimiento */}
              <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-[#fc8127]/20 to-transparent border-b border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Calificación Promedio</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white">{stats.rating > 0 ? stats.rating.toFixed(1) : '—'}</span>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(stats.rating) ? 'text-[#fc8127] fill-[#fc8127]' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Finalizados', value: stats.trabajosFinalizados, icon: CheckCircle, color: 'text-emerald-400' },
                    { label: 'Reseñas +',   value: stats.resenasPositivas,    icon: ShieldCheck, color: 'text-[#fc8127]' },
                    { label: 'Respuesta',   value: stats.tasaRespuesta,        icon: Timer,       color: 'text-blue-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{item.value}</span>
                    </div>
                  ))}
                  <button onClick={() => router.push('/mis-trabajos')} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-white/10 mt-2">
                    Ver historial completo
                  </button>
                </div>
              </div>

              {/* URL Pública / Mi Marca */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#fc8127]" />
                  <h4 className="font-black text-sm text-white">Tu URL Pública</h4>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 mb-3 font-mono text-xs text-slate-300 truncate">
                  {urlPublica}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://${urlPublica}`)}
                    className="py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl transition-colors border border-white/10"
                  >
                    📋 Copiar
                  </button>
                  <button
                    onClick={() => router.push('/mi-marca')}
                    className="py-2 bg-[#fc8127] hover:bg-[#e06d19] text-xs font-black text-white rounded-xl transition-colors"
                  >
                    ⚡ Mi Marca
                  </button>
                </div>
              </div>

              {/* Banner plan */}
              {perfil?.plan !== 'Master' && (
                <div className="bg-gradient-to-br from-[#fc8127]/20 to-amber-500/10 border border-[#fc8127]/30 rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-[#fc8127]" />
                    <h4 className="font-black text-sm text-white">Mejora tu Plan</h4>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {perfil?.plan === 'Pro' ? 'Actualizá a Master para postulaciones ilimitadas y el 1° puesto.' : 'Pasate a Pro para destacar entre la competencia y ganar más clientes.'}
                  </p>
                  <button onClick={() => router.push('/planes')} className="w-full py-2.5 bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs rounded-xl transition-colors">
                    {perfil?.plan === 'Pro' ? 'Ver Plan Master' : 'Ver Planes Disponibles'}
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ── TAB: CLIENTES (Historial mini-CRM) ───────────────────────── */}
        {activeTab === 'clientes' && (
          <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5">
            <h3 className="font-black text-base text-white mb-5 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#fc8127]" /> Historial de Clientes
              <span className="text-xs font-bold text-slate-400 ml-1">({historialClientes.length})</span>
            </h3>

            {historialClientes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-sm font-bold text-slate-300">Sin clientes registrados</p>
                <p className="text-xs text-slate-500 mt-1">Completá tu primer trabajo para ver el historial</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historialClientes.map((c, i) => (
                  <div key={c.clienteId || i} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all cursor-pointer group">
                    <img
                      src={c.fotoPerfil || 'https://i.pravatar.cc/150?u=' + c.clienteId}
                      alt={c.nombre}
                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-white truncate">{c.nombre}</p>
                      <p className="text-[11px] text-slate-400 truncate">Último: {c.ultimoTrabajo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#fc8127]">{c.totalTrabajos} trabajo(s)</p>
                      <p className="text-[11px] text-slate-400">${parseFloat(c.montoTotal || 0).toLocaleString('es-AR')}</p>
                    </div>
                    {c.telefono && (
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${c.telefono}`); }}
                        className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MENSAJES ─────────────────────────────────────────────── */}
        {activeTab === 'mensajes' && (
          <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#fc8127]" /> Conversaciones Recientes
              </h3>
              <button onClick={() => router.push('/chat')} className="text-xs font-bold text-[#fc8127] hover:underline">Ver todas →</button>
            </div>

            {/* Lógica de Chat: 2 Modos claramente documentados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div
                onClick={() => router.push('/buscar-profesionales')}
                className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl cursor-pointer hover:bg-blue-500/20 transition-all"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl shrink-0">🔍</div>
                <div>
                  <p className="text-sm font-black text-white">Modo 1: Contacto Directo</p>
                  <p className="text-[11px] text-slate-400">Cliente te contacta desde tu perfil → Chat de Consulta</p>
                </div>
              </div>
              <div
                onClick={() => router.push('/muro-trabajos')}
                className="flex items-center gap-3 p-4 bg-[#fc8127]/10 border border-[#fc8127]/30 rounded-2xl cursor-pointer hover:bg-[#fc8127]/20 transition-all"
              >
                <div className="w-10 h-10 bg-[#fc8127]/20 rounded-xl flex items-center justify-center text-xl shrink-0">📋</div>
                <div>
                  <p className="text-sm font-black text-white">Modo 2: Muro de Trabajos</p>
                  <p className="text-[11px] text-slate-400">Te postulás a un trabajo → enviás presupuesto estructurado</p>
                </div>
              </div>
            </div>

            {conversaciones.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm font-bold text-slate-300">Sin conversaciones aún</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Tus chats con clientes aparecerán aquí</p>
                <button onClick={() => router.push('/muro-trabajos')} className="bg-[#fc8127] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#e06d19]">
                  Ver Muro de Trabajos
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversaciones.map(conv => {
                  const badge = CHAT_BADGE[conv.estadoChat] || CHAT_BADGE.consulta;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => router.push(`/chat/${conv.id}`)}
                      className="flex items-center gap-3 p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#fc8127]/30 rounded-2xl cursor-pointer transition-all group"
                    >
                      <img
                        src={conv.partnerAvatar}
                        alt={conv.partnerNombre}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-white truncate">{conv.partnerNombre}</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{conv.ultimoMensaje || 'Sin mensajes aún'}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#fc8127] transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: AGENDA ──────────────────────────────────────────────── */}
        {activeTab === 'agenda' && (
          <div className="bg-[#0d2040]/80 border border-white/10 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#fc8127]" /> Agenda & Notas
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white min-w-[110px] text-center">{monthsList[currentMonth]} {currentYear}</span>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 border-b border-white/10 pb-2 mb-2">
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {totalCells.map((cell, idx) => {
                if (!cell) return <div key={`b${idx}`} className="aspect-square" />;
                const cellDate = new Date(currentYear, currentMonth, cell);
                const isSelected = selectedDate.getDate() === cell && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                const hasNote = !!notes[`${currentYear}-${currentMonth + 1}-${cell}`];
                const isToday = new Date().getDate() === cell && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
                return (
                  <button
                    key={`d${cell}`}
                    onClick={() => setSelectedDate(cellDate)}
                    className={`aspect-square rounded-xl text-xs font-bold relative transition-all flex items-center justify-center ${
                      isSelected ? 'bg-[#fc8127] text-white shadow-lg shadow-[#fc8127]/30' :
                      isToday ? 'bg-[#fc8127]/20 text-[#fc8127] border border-[#fc8127]/30' :
                      'text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {cell}
                    {hasNote && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#fc8127]" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">
                  {selectedDate.getDate()} de {monthsList[selectedDate.getMonth()]}
                </span>
                {notes[`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`] && (
                  <button
                    onClick={() => {
                      const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
                      const updated = { ...notes }; delete updated[key]; setNotes(updated);
                      localStorage.setItem('oficiosya_calendar_notes', JSON.stringify(updated)); setActiveNote('');
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Borrar
                  </button>
                )}
              </div>
              <textarea
                value={activeNote}
                onChange={e => setActiveNote(e.target.value)}
                placeholder="Recordatorios, clientes, visitas..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#fc8127] resize-none"
                rows={3}
              />
              <button onClick={handleSaveNote} className="px-4 py-2 bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Guardar Nota
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV MOBILE ──────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a1628]/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center py-3 px-4">
        {[
          { id: 'panel', icon: LayoutDashboard, label: 'Panel', action: () => setActiveTab('panel') },
          { id: 'muro', icon: Grid, label: 'Muro', action: () => router.push('/muro-trabajos') },
          { id: 'mensajes', icon: MessageSquare, label: 'Mensajes', action: () => setActiveTab('mensajes') },
          { id: 'marca', icon: Zap, label: 'Mi Marca', action: () => router.push('/mi-marca') },
          { id: 'ajustes', icon: Settings, label: 'Ajustes', action: () => router.push('/configuracion-profesional') },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={tab.action}
            className={`flex flex-col items-center gap-1 ${
              activeTab === tab.id ? 'text-[#fc8127]' : 'text-slate-500'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === tab.id ? 'bg-[#fc8127]/20' : ''}`}>
              <tab.icon className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── MODAL: SOPORTE ─────────────────────────────────────────────── */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d1f3c] border border-white/20 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#fc8127]" /> Soporte SuperOficios
              </h3>
              <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Categoría</label>
                <select
                  value={supportType}
                  onChange={e => setSupportType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#fc8127]"
                >
                  <option value="Ayuda">Pregunta / Consulta general</option>
                  <option value="Sugerencias">Sugerencia de mejora</option>
                  <option value="Reclamo">Queja / Reclamo</option>
                  <option value="Reportar problema">Reportar problema</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={e => setSupportMessage(e.target.value)}
                  placeholder="Describí tu consulta o problema..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowSupportModal(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/10 rounded-xl hover:bg-white/5">
                  Cancelar
                </button>
                <button type="submit" disabled={isSendingTicket} className="px-5 py-2 bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-black rounded-xl flex items-center gap-1.5 disabled:opacity-50">
                  {isSendingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}