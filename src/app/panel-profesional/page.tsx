"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Edit2, Calendar, FileText, TrendingUp, 
  Zap, Clock, ChevronRight, ChevronLeft, Wrench, Paintbrush, 
  CheckCircle, ShieldCheck, Timer, LayoutDashboard, 
  Briefcase, MessageSquare, User, Users, Plus, Settings, BarChart2,
  Hammer, Grid, ImagePlus, Star, Crown, HelpCircle, Send, X, Loader2,
  Lightbulb, Info, Trash2, Compass, BookmarkPlus, Handshake
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
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

function PanelProfesionalContent() {
  const router = useRouter();
  const { profile: authProfile } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);

  // Cargar perfil desde auth context
  useEffect(() => {
    // Check if we should show confetti
    if (localStorage.getItem('show_confetti') === 'true') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fc8127', '#00355f', '#4CAF50']
      });
      localStorage.removeItem('show_confetti');
    }

    if (authProfile) {
      setPerfil(authProfile);
    }
  }, [authProfile]);

  const [stats, setStats] = useState({
    activeJobs: 0,
    presupuestos: 0,
    ganancias: '$0',
    trabajosFinalizados: 0,
    resenasPositivas: 0,
    tasaRespuesta: '100%',
    rating: 5.0
  });

  useEffect(() => {
    if (!perfil) return;
    const loadStats = async () => {
      try {
        // Get real data from database
        const allPostulaciones = await dbHelper.getAllPostulaciones();
        const myApps = allPostulaciones.filter((p: any) => p.candidato === perfil.nombre);
        
        const realPresupuestos = myApps.length;
        const realActiveJobs = myApps.filter((p: any) => p.estado === 'Aceptado').length;

        // Get real reviews count
        const reviews = await dbHelper.getReviewsForProfessional(perfil.id);
        const avgRating = reviews.length > 0 
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
          : 5.0;
        
        setStats({
          activeJobs: realActiveJobs,
          presupuestos: realPresupuestos,
          ganancias: '$0',
          trabajosFinalizados: 0,
          resenasPositivas: reviews.length,
          tasaRespuesta: '100%',
          rating: avgRating
        });
      } catch (err) {
        console.error("Error al cargar estadísticas en panel-profesional:", err);
      }
    };
    loadStats();
  }, [perfil]);

  // Estados de Soporte
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportType, setSupportType] = useState('Pregunta');
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Estados para el Calendario Interactivo con Notas
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState<{[key: string]: string}>({});
  const [activeNote, setActiveNote] = useState<string>('');

  useEffect(() => {
    const storedNotes = localStorage.getItem('oficiosya_calendar_notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
      setActiveNote(notes[dateKey] || '');
    }
  }, [selectedDate, notes]);

  const handleSaveNote = () => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const updatedNotes = { ...notes };
    if (activeNote.trim() === '') {
      delete updatedNotes[dateKey];
    } else {
      updatedNotes[dateKey] = activeNote;
    }
    setNotes(updatedNotes);
    localStorage.setItem('oficiosya_calendar_notes', JSON.stringify(updatedNotes));
    alert('Nota guardada correctamente.');
  };

  const handleDeleteNote = () => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    const updatedNotes = { ...notes };
    delete updatedNotes[dateKey];
    setNotes(updatedNotes);
    localStorage.setItem('oficiosya_calendar_notes', JSON.stringify(updatedNotes));
    setActiveNote('');
    alert('Nota eliminada.');
  };

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthsList = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const blanks = Array(firstDayOfMonth(currentMonth, currentYear)).fill(null);
  const monthDays = Array.from({ length: daysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
  const totalCells = [...blanks, ...monthDays];

  // Archivo adjunto
  const [archivoBase64, setArchivoBase64] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');

  const handleSupportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setArchivoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Cargar mis tickets
  useEffect(() => {
    if (showSupportModal) {
      loadTickets();
    }
  }, [showSupportModal, perfil]);

  const loadTickets = async () => {
    if (!perfil?.email) return;
    try {
      const allTickets = await dbHelper.getTickets();
      const filtered = allTickets.filter((t: any) => t.email === perfil.email);
      setMyTickets(filtered);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    }
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || !perfil) return;

    setIsSendingTicket(true);

    try {
      const nuevoTicket = {
        nombre: perfil.nombre || 'Profesional',
        email: perfil.email || 'correo@ejemplo.com',
        tipo: supportType,
        mensaje: supportMessage,
        estado: 'Pendiente',
        archivoBase64, // imagen adjunta
        fecha: new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      await dbHelper.createTicket(nuevoTicket);

      setSupportMessage('');
      setArchivoBase64('');
      setNombreArchivo('');
      setIsSendingTicket(false);
      loadTickets();
    } catch (error) {
      console.error("Error al enviar ticket:", error);
      setIsSendingTicket(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans overflow-x-hidden md:pl-24 pb-24 md:pb-0">
      <BienvenidaProModal />
      
      {/* Top AppBar */}
      <header className="bg-white border-b border-gray-200 shadow-sm w-full top-0 sticky z-40 flex justify-between items-center px-4 md:px-8 h-16 md:h-20">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <Logo size="md" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button 
              onClick={() => router.push('/notificaciones')}
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </Tooltip>
          <Tooltip title="Mi Perfil" text="Actualizá tus datos personales, especialidades, coberturas y subí certificados profesionales." position="bottom">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer" onClick={() => router.push('/configuracion-profesional')}>
              <img 
                className="w-full h-full object-cover" 
                alt="Perfil de Roberto" 
                src={perfil?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuC1W2fOmSq-AynqbO3ZoWLKh_XWhnamU4gzNipXAwgMd19QXjrLW74lvJpK-ZQeavvPt4luRYD7mhyI0qQuA6QCs8afpj3cqqLqgCs6S4po0rIeUYesugVkfTIMWiABeNBgEH8TIKJHiZdH_Pv9DLWbTS8ggXJkSpU6taEOfoFmwVs-S04n62fGxmqyzsGqJSR4eb_sNOrD5MTYiXByZcjscbg4QHwR8TpMzDU7dtp1JrFSPFMp9pBSecyG65yj2h2KnVBnkMvHuipY"}
              />
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        
        <Tooltip title="Panel" text="Hacé clic para ver el resumen de tu actividad, trabajos activos y ganancias del mes." position="right">
          <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
              <PanelIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Panel</span>
          </button>
        </Tooltip>

        <Tooltip title="Muro de trabajos" text="Explorá el muro de solicitudes publicadas por clientes y postulá tus presupuestos." position="right">
          <button 
            onClick={() => router.push('/muro-trabajos')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <MuroIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Muro</span>
          </button>
        </Tooltip>

        {(perfil?.plan === 'Pro' || perfil?.plan === 'Master') && (
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
        )}

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
            onClick={() => setShowSupportModal(true)}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <SoporteIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Soporte</span>
          </button>
        </Tooltip>

        <Tooltip title="Presupuestador" text="Calculadora de materiales, mano de obra y cómputos de obra." position="right">
          <button 
            onClick={() => router.push('/presupuestador-obras')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <HerramientasIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Presupuestador</span>
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Welcome & Quick Actions */}
         <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Hola, {perfil?.nombre?.split(' ')[0] || 'Roberto'}</h2>
              {perfil?.plan && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  perfil.plan === 'Master' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  perfil.plan === 'Pro' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  Plan {perfil.plan === 'Gratis' ? 'Básico' : perfil.plan}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-500 mt-1">Tu panel de profesional está actualizado para hoy.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/editar-perfil-publico')}
              className="flex-1 md:flex-none px-6 h-12 bg-[#fc8127] text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-[#e67320]"
            >
              <ImagePlus className="w-4 h-4" />
              Perfil Público
            </button>
            <button className="flex-1 md:flex-none px-6 h-12 border-2 border-[#00355f] text-[#00355f] font-bold text-sm rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-blue-50">
              <Calendar className="w-4 h-4" />
              Disponibilidad
            </button>
          </div>
        </section>

        {/* Summary Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6 cursor-pointer" onClick={() => router.push('/muro-trabajos')}>
            <div className="p-4 bg-blue-50 text-[#00355f] rounded-full shrink-0">
              <Hammer className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Trabajos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{String(stats.activeJobs).padStart(2, '0')}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-orange-50 text-[#fc8127] rounded-full shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Presupuestos</p>
              <p className="text-3xl font-bold text-gray-900">{String(stats.presupuestos).padStart(2, '0')}</p>
            </div>
          </div>
          
          <div className="bg-[#00355f] text-white p-6 rounded-2xl shadow-lg flex items-center gap-6 relative overflow-hidden">
            <div className="p-4 bg-white/20 text-white rounded-full shrink-0 z-10">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="z-10">
              <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">Ganancias Mes</p>
              <p className="text-3xl font-bold text-white">{stats.ganancias}</p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
               <TrendingUp className="w-40 h-40" />
            </div>
          </div>
        </section>

        {/* NUEVO: Accesos Rápidos a Bolsa de Empleo */}
        <section 
          onClick={() => router.push('/bolsa-empleo')}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-6 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/40 blur-xl rounded-full"></div>
              <Handshake className="w-7 h-7 text-[#fc8127] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-extrabold text-[#00355f]">Bolsa de Empleo</h3>
                <span className="bg-gradient-to-r from-[#fc8127] to-[#ff9e5e] text-white text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-sm shadow-orange-200">Nuevo</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">Publicá búsquedas laborales o encontrá trabajo para tu equipo.</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 w-full md:w-auto shrink-0 flex-wrap md:flex-nowrap">
            <button 
              onClick={(e) => { e.stopPropagation(); router.push('/mis-postulaciones'); }}
              className="flex-1 md:flex-none px-5 h-11 bg-white border border-gray-200 text-gray-700 font-bold text-xs md:text-sm rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 hover:border-gray-300 shadow-sm"
            >
              <BookmarkPlus className="w-4 h-4 text-[#00355f]" /> Mis Postulaciones
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); router.push('/candidatos-empleo'); }}
              className="flex-1 md:flex-none px-5 h-11 bg-blue-50 border border-blue-100 text-[#00355f] font-bold text-xs md:text-sm rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4 text-[#fc8127]" /> Candidatos
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); router.push('/publicar-empleo'); }}
              className="w-full md:w-auto md:flex-none px-6 h-11 bg-gradient-to-r from-[#00355f] to-[#0f4c81] text-white font-bold text-xs md:text-sm rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 md:mt-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Publicar Empleo
            </button>
          </div>
        </section>

        {/* Banner de Suscripción Dinámico */}
        {perfil?.plan !== 'Master' ? (
          <div className="bg-gradient-to-r from-[#00355f] to-[#0f4c81] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
                <Crown className="w-7 h-7 text-[#fc8127]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {perfil?.plan === 'Pro' ? '¡Llegá a lo más alto!' : '¡Destacá tu perfil y ganá más clientes!'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {perfil?.plan === 'Pro' 
                    ? 'Actualizá al Plan Master para postulaciones y fotos ilimitadas y el 1° puesto como "Más Recomendado".' 
                    : 'Pasate a un plan superior para tener postulaciones ilimitadas y aparecer primero.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/planes')} 
              className="w-full md:w-auto shrink-0 bg-[#fc8127] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#e67320] active:scale-95 transition-all whitespace-nowrap"
            >
              {perfil?.plan === 'Pro' ? 'Ver Plan Master' : 'Ver Planes'}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#00355f] to-purple-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
                <Crown className="w-7 h-7 text-[#fc8127] fill-[#fc8127]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">¡Suscripción Master Activa!</h3>
                <p className="text-blue-100 text-sm">Disfrutás de visibilidad de prioridad máxima, soporte 24/7 y herramientas ilimitadas.</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/planes')} 
              className="w-full md:w-auto shrink-0 bg-white/15 text-white px-6 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/25 active:scale-95 transition-all whitespace-nowrap"
            >
              Gestionar Plan
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Jobs Section */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Trabajos en curso</h3>
              <button onClick={() => router.push('/mis-trabajos')} className="text-[#00355f] font-bold text-sm hover:underline">Ver todos</button>
            </div>
            
            <div className="space-y-4">
              {stats.activeJobs === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-700 text-base mb-1">No tenés trabajos activos en curso</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">Postulate a búsquedas laborales en el Muro para conseguir tus primeros clientes.</p>
                  <button 
                    onClick={() => router.push('/muro-trabajos')} 
                    className="bg-[#00355f] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0f4c81]"
                  >
                    Explorar Muro de Trabajos
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between cursor-pointer" onClick={() => router.push('/mis-trabajos')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Tenés {stats.activeJobs} trabajo(s) activo(s)</h4>
                      <p className="text-xs text-gray-500">Hacé clic para ver el detalle en tus trabajos.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </section>

          {/* Sidebar Section */}
          <aside className="space-y-6">
            
            {/* Promo Card: Perfil Público */}
            <div className="bg-gradient-to-br from-[#00355f] to-[#0f4c81] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#fc8127] fill-[#fc8127]" />
                  <h3 className="font-bold text-lg">Tu Perfil Público</h3>
                </div>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  Los clientes confían en lo que ven. Añade fotos de tus trabajos y una presentación llamativa para destacar entre la competencia.
                </p>
                <button 
                  onClick={() => router.push('/editar-perfil-publico')}
                  className="w-full py-2.5 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold text-sm rounded-xl transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  Actualizar Portafolio
                </button>
              </div>
              <div className="absolute -right-4 -top-4 opacity-10">
                <User className="w-32 h-32" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-2">Tu Rendimiento</h3>
            
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-[#00355f] text-white">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200 mb-2">Calificación Promedio</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-bold leading-none">{stats.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-blue-100 mt-3">
                  {stats.rating >= 4.8 
                    ? '¡Excelente! Estás en el top 5% de profesionales de tu zona.' 
                    : '¡Buen rendimiento! Sigue sumando trabajos exitosos.'}
                </p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Trabajos Finalizados</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.trabajosFinalizados}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#fc8127]" />
                    <span className="text-sm font-medium text-gray-700">Reseñas Positivas</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.resenasPositivas}</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-[#00355f]" />
                    <span className="text-sm font-medium text-gray-700">Tasa de Respuesta</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.tasaRespuesta}</span>
                </div>
                
                <button onClick={() => router.push('/mis-trabajos')} className="w-full py-3 bg-gray-50 text-[#00355f] font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">
                  Ver historial completo
                </button>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className={`p-5 border rounded-2xl flex items-center justify-between transition-colors ${
              isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shadow-sm transition-colors ${
                  isAvailable ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-bold transition-colors ${
                  isAvailable ? 'text-green-800' : 'text-gray-600'
                }`}>
                  Disponible para urgencias
                </span>
              </div>
              <button 
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isAvailable ? 'bg-[#00355f]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </aside>
        </div>

        {/* Nueva Sección: Calendario de Notas, FAQ de Iconos y Buzón de Sugerencias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 pt-12 border-t border-gray-200">
          
          {/* Calendario con Notas (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#00355f]" />
                <h3 className="font-extrabold text-xl text-[#00355f]">Agenda & Notas</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[#00355f] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
                  {monthsList[currentMonth]} {currentYear}
                </span>
                <button 
                  onClick={handleNextMonth} 
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[#00355f] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid de Días de la Semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 border-b border-gray-100 pb-2">
              <span>Dom</span>
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
            </div>

            {/* Grid de Días del Mes */}
            <div className="grid grid-cols-7 gap-2">
              {totalCells.map((cell, idx) => {
                if (cell === null) {
                  return <div key={`blank-${idx}`} className="aspect-square" />;
                }

                const cellDate = new Date(currentYear, currentMonth, cell);
                const isSelected = selectedDate.getDate() === cell && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                
                const cellKey = `${currentYear}-${currentMonth + 1}-${cell}`;
                const hasNote = !!notes[cellKey];

                const today = new Date();
                const isToday = today.getDate() === cell && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                return (
                  <button
                    key={`day-${cell}`}
                    onClick={() => setSelectedDate(cellDate)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                      isSelected 
                        ? 'bg-[#00355f] text-white shadow-md font-bold' 
                        : isToday 
                          ? 'bg-orange-50 text-[#fc8127] border border-[#fc8127] font-bold'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">{cell}</span>
                    {hasNote && (
                      <span className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 bg-[#fc8127]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Área de Nota del Día Seleccionado */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00355f] uppercase tracking-wider">
                  Notas del {selectedDate.getDate()} de {monthsList[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                {notes[`${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`] && (
                  <button 
                    onClick={handleDeleteNote}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Borrar
                  </button>
                )}
              </div>

              <textarea
                value={activeNote}
                onChange={(e) => setActiveNote(e.target.value)}
                placeholder="Añadí recordatorios, tareas, nombres de clientes o presupuestos..."
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#00355f] transition-all resize-none leading-relaxed"
                rows={2}
              />

              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#00355f] text-white text-[11px] font-bold rounded-xl hover:bg-[#0f4c81] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 w-fit cursor-pointer"
              >
                <Send className="w-3 h-3" /> Guardar Nota
              </button>
            </div>
          </div>

          {/* Guía de Iconos FAQ y Buzón de Sugerencias (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* FAQ / Guía de Iconos */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-6 h-6 text-[#00355f]" />
                <h3 className="font-extrabold text-xl text-[#00355f]">Guía de Iconos</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <div className="p-2.5 bg-blue-50 text-[#00355f] rounded-xl shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Muro de Trabajos</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Espacio donde los clientes publican los trabajos que necesitan realizar. Desde aquí podés postularte y enviar el presupuesto por tu mano de obra para que el cliente lo revise y te elija.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="p-2.5 bg-orange-50 text-[#fc8127] rounded-xl shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Mis Trabajos</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Administrá tus cotizaciones enviadas, hacé seguimiento a los trabajos activos e indicá cuando termines un servicio.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="p-2.5 bg-purple-50 text-purple-750 rounded-xl shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Mensajes (Chat)</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Hablá de manera directa y segura con tus clientes. Coordiná las visitas técnicas y los materiales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="p-2.5 bg-green-50 text-green-750 rounded-xl shrink-0">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">Soporte y Ayuda</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      Resolvé inconvenientes con pagos, cuenta o clientes. Además, podés realizar sugerencias al equipo administrador.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buzón de Sugerencias CTA */}
            <div className="bg-gradient-to-br from-[#fc8127] to-[#e67320] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-full min-h-[180px]">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-white" />
                  <h4 className="font-extrabold text-lg">¿Tenés ideas de mejora?</h4>
                </div>
                <p className="text-xs text-orange-50 leading-relaxed">
                  Queremos darte las mejores herramientas para tu oficio. Proponenos mejoras o utilidades que te sirvan para tu día a día desde el canal de sugerencias de soporte.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSupportType('Sugerencia');
                  setShowSupportModal(true);
                }}
                className="mt-4 relative z-10 w-fit px-5 py-2.5 bg-white text-[#fc8127] font-bold text-xs rounded-xl shadow-md hover:bg-orange-50 transition-colors active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" /> Proponer una Sugerencia
              </button>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Lightbulb className="w-36 h-36" />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <Tooltip text="Ver muro de trabajos" position="top">
        <button onClick={() => router.push('/muro-trabajos')} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#fc8127] text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform">
          <Grid className="w-7 h-7" />
        </button>
      </Tooltip>

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 px-4 z-50 border-t border-gray-200 shadow-lg">
        <div className="flex flex-col items-center justify-center bg-[#fc8127] text-white rounded-2xl px-4 py-1.5 shadow-sm">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Dashboard</span>
        </div>
        <div onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Muro</span>
        </div>
        <div onClick={() => setShowSupportModal(true)} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Soporte</span>
        </div>
        <div onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Ajustes</span>
        </div>
      </nav>


      {/* ── MODAL: SOPORTE Y AYUDA DESDE EL PANEL PRO ── */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#00355f]">Soporte Técnico de Oficios<span className="text-[#fc8127]">Ya</span></h3>
              <p className="text-xs text-gray-400 mt-1">Reporta quejas, sugerencias o dudas. Mira aquí mismo las respuestas de la administración.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Formulario a la izquierda */}
              <form onSubmit={handleSendTicket} className="space-y-4">
                <p className="text-xs font-bold text-[#00355f] uppercase tracking-wider border-b border-gray-100 pb-2">Nueva Consulta</p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Motivo</label>
                  <select 
                    value={supportType} 
                    onChange={(e) => setSupportType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00355f] text-xs font-bold"
                  >
                    <option value="Pregunta">Pregunta / Consulta general</option>
                    <option value="Sugerencia">Sugerencia de mejora</option>
                    <option value="Queja">Queja / Reclamo de servicio</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Tu mensaje</label>
                  <textarea 
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Escribe aquí tu consulta..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00355f] text-xs leading-relaxed"
                  ></textarea>
                </div>
                
                {/* Adjuntar Imagen */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Adjuntar Imagen (Opcional)</label>
                  <div className="flex gap-2 items-center">
                    <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#00355f] font-bold text-[10px] rounded-xl cursor-pointer transition-colors shadow-sm">
                      Elegir Imagen
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSupportFileChange}
                        className="hidden" 
                      />
                    </label>
                    {nombreArchivo && (
                      <span className="text-[10px] text-gray-500 font-semibold truncate max-w-[120px]">{nombreArchivo}</span>
                    )}
                  </div>
                  {archivoBase64 && (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                      <img src={archivoBase64} alt="Previsualización" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => { setArchivoBase64(''); setNombreArchivo(''); }}
                        className="absolute top-0.5 right-0.5 bg-black/50 text-white p-0.5 rounded-full text-[8px] hover:bg-black/75"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSendingTicket}
                  className="w-full py-2.5 bg-[#fc8127] text-white rounded-xl text-xs font-bold hover:bg-[#e67320] transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                >
                  {isSendingTicket ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Enviar a Administración
                    </>
                  )}
                </button>
              </form>

              {/* Listado a la derecha */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#00355f] uppercase tracking-wider border-b border-gray-100 pb-2">Mis Mensajes Previos</p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {myTickets.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No has enviado consultas todavía.</p>
                  ) : (
                    myTickets.map((t: any) => (
                      <div key={t.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            t.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t.estado}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold">{t.fecha}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed"><strong className="text-gray-900 uppercase text-[9px]">{t.tipo}:</strong> {t.mensaje}</p>
                        
                        {t.archivoBase64 && (
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm mt-1">
                            <a href={t.archivoBase64} target="_blank" rel="noreferrer">
                              <img src={t.archivoBase64} alt="Adjunto" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            </a>
                          </div>
                        )}

                        {t.respuesta && (
                          <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg space-y-1">
                            <p className="text-[9px] font-bold text-green-800">Respuesta de Oficios<span className="text-[#fc8127]">Ya</span>:</p>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">"{t.respuesta}"</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <button 
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      )}
    </main>
  );
}