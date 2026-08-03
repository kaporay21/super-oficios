"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BarChart3, Send, MessageSquare, Check, Trash2,
  Settings, LogOut, Search, Filter, ShieldCheck, CheckCircle2,
  TrendingUp, AlertCircle, Crown, Info, RefreshCw, X, ShieldAlert,
  Edit2, Eye, Shield, UserX, UserCheck, Award, FileText, CheckCircle,
  Activity, Zap, Ban, Clock, TriangleAlert, CreditCard, DollarSign, Wallet,
  Sliders, ListPlus, Target, History, Star, Megaphone, Image, CalendarDays,
  ToggleLeft, ToggleRight, ChevronRight, Lightbulb, Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminContent />
    </AuthGuard>
  );
}

function AdminContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [clearing, setClearing] = useState(false);
  const handlePurgeAllData = async () => {
    if (!confirm('⚠️ ¿Estás seguro de BORRAR TODOS LOS DATOS de la plataforma? Esto eliminará usuarios, trabajos, postulaciones, reseñas y chats para dejar la plataforma 100% vacía.')) return;
    setClearing(true);
    try {
      await dbHelper.cleanAllData();
      alert('✅ Se borraron todos los datos correctamente. La plataforma quedó en cero.');
      window.location.reload();
    } catch (err) {
      console.error('Error al vaciar BD:', err);
      alert('Ocurrió un error al vaciar los datos.');
    } finally {
      setClearing(false);
    }
  };
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'analiticas' | 'usuarios' | 'verificaciones' | 'trabajos' |
    'marketing' | 'soporte' | 'seguridad' | 'financiero' | 'configuracion' |
    'feedback' | 'campanas'
  >('resumen');

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // State arrays from database
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [denuncias, setDenuncias] = useState<any[]>([]);

  // Sub-tabs and selectors for Bolsa de Empleo
  const [jobSubTab, setJobSubTab] = useState<'muro' | 'bolsa'>('muro');
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any | null>(null);

  // Selected items for modal interaction
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null);
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Marketing campaign form
  const [marketingTarget, setMarketingTarget] = useState('Todos');
  const [marketingTitle, setMarketingTitle] = useState('');
  const [marketingBody, setMarketingBody] = useState('');
  const [marketingSuccess, setMarketingSuccess] = useState(false);
  const [marketingSending, setMarketingSending] = useState(false);
  const [marketingError, setMarketingError] = useState('');

  // Marketing sub-tabs
  const [marketingSubTab, setMarketingSubTab] = useState<'notificaciones' | 'campanas'>('notificaciones');

  // Campaign form state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignForm, setCampaignForm] = useState({
    nombre: '', banner: '', fechaInicio: '', fechaFin: '',
    categoria: 'Todos', beneficio: '', botonTexto: '', botonUrl: '',
    tipo: 'Campaña', activa: true
  });

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Initialize data
  useEffect(() => {
    // 1. Load users from dbHelper
    const loadUsers = async () => {
      try {
        const dbUsers = await dbHelper.getAllUsers();
        setUsers(dbUsers);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    loadUsers();

    // 2. Load tickets from soporte (real Supabase data)
    const loadTickets = async () => {
      try {
        const allTickets = await dbHelper.getTodosLosTicketsAdmin();
        const formatted = allTickets.map((t: any) => ({
          id: t.id,
          codigo: t.codigo_ticket || `#SO-${t.id.slice(0, 6)}`,
          tipo: t.categoria || 'Consulta',
          mensaje: t.mensaje,
          nombre: t.usuario?.nombre || 'Usuario',
          email: t.usuario?.email || '',
          fecha: t.created_at ? new Date(t.created_at).toLocaleDateString('es-AR') : 'Reciente',
          estado: t.estado || 'Recibida',
          respuesta: t.respuesta_admin || ''
        }));
        setTickets(formatted);
      } catch (err) {
        console.error("Error al cargar tickets en admin:", err);
      }
    };
    loadTickets();

    // 3. Load jobs from database
    const loadJobs = async () => {
      try {
        const dbJobs = await dbHelper.getJobs();
        setJobs(dbJobs);
      } catch (err) {
        console.error("Error al cargar trabajos:", err);
      }
    };
    loadJobs();

    // 4. Load all applications (postulaciones) from database
    const loadPostulaciones = async () => {
      try {
        const allPostulaciones = await dbHelper.getAllPostulaciones();
        setPostulaciones(allPostulaciones);
      } catch (err) {
        console.error("Error al cargar postulaciones:", err);
      }
    };
    loadPostulaciones();

    // 5. Load announcements from Supabase (stored as sistema notifications with no user filter)
    // We'll track sent campaigns in state from users' notifications.
    // For now: load from admin's own notification list as reference
    setAnnouncements([]);

    // 6. Load denuncias/reportes (tickets of type Denuncia)
    const loadDenuncias = async () => {
      try {
        const allTickets = await dbHelper.getTodosLosTicketsAdmin();
        const soloReportes = allTickets
          .filter((t: any) => t.categoria === 'Denuncia' || t.categoria === 'Reporte')
          .map((t: any) => ({
            id: t.id,
            codigo: t.codigo_ticket || `#D-${t.id.slice(0, 6).toUpperCase()}`,
            tipo: t.categoria || 'Denuncia',
            mensaje: t.mensaje,
            nombre: t.usuario?.nombre || 'Usuario',
            email: t.usuario?.email || '',
            fecha: t.created_at ? new Date(t.created_at).toLocaleDateString('es-AR') : 'Reciente',
            estado: t.estado || 'Recibida',
          }));
        setDenuncias(soloReportes);
      } catch (err) {
        console.error('Error al cargar denuncias:', err);
      }
    };
    loadDenuncias();

    // 7. Load feedbacks (sugerencias)
    const loadFeedbacks = async () => {
      try {
        const allTickets = await dbHelper.getTodosLosTicketsAdmin();
        const soloSugerencias = allTickets
          .filter((t: any) => t.categoria === 'Sugerencia' || t.categoria === 'Feedback')
          .map((t: any) => ({
            id: t.id,
            titulo: t.asunto || t.mensaje?.slice(0, 60) || 'Sugerencia',
            mensaje: t.mensaje,
            nombre: t.usuario?.nombre || 'Usuario',
            email: t.usuario?.email || '',
            fecha: t.created_at ? new Date(t.created_at).toLocaleDateString('es-AR') : 'Reciente',
            estado: t.estado || 'Recibida',
            rol: t.usuario?.role || 'cliente',
          }));
        setFeedbacks(soloSugerencias);
      } catch (err) {
        console.error('Error al cargar feedbacks:', err);
      }
    };
    loadFeedbacks();

    // 8. Load audit logs from Supabase
    const loadAuditLogs = async () => {
      try {
        const logs = await dbHelper.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Error al cargar logs de auditoría:', err);
      }
    };
    loadAuditLogs();
  }, []);

  // Update lists
  const saveUsers = async (updatedList: any[]) => {
    setUsers(updatedList);
  };

  const saveTickets = (updatedList: any[]) => {
    setTickets(updatedList);
  };

  const saveJobs = (updatedList: any[]) => {
    setJobs(updatedList);
  };

  // User Actions
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Activo' ? 'Suspendido' : 'Activo';
    const updated = users.map(u => u.id === id ? { ...u, status: nextStatus } : u);
    saveUsers(updated);
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }

    try {
      await dbHelper.updateUserStatus(id, nextStatus);
    } catch (e) {
      console.error("Error al suspender/habilitar usuario en BD:", e);
    }
  };

  const handleChangePlan = async (id: string, newPlan: string) => {
    const updated = users.map(u => u.id === id ? { ...u, plan: newPlan } : u);
    saveUsers(updated);
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, plan: newPlan });
    }

    // Sincronizar el plan en el perfil del profesional
    const targetUser = updated.find(u => u.id === id);
    if (targetUser && targetUser.email === 'roberto@gmail.com') {
      const storedProfile = localStorage.getItem('oficiosya_profesional_perfil');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        parsed.plan = newPlan;
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(parsed));
      }
    }

    try {
      await dbHelper.updateUserPlan(id, newPlan);
    } catch (e) {
      console.error("Error al actualizar plan en BD:", e);
    }
  };

  // Verification actions for DNI & Certificates
  const handleApproveDNI = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, verificacion: 'Verificado', estadoDNI: 'Validado' } : u);
    saveUsers(updated);
    if (selectedVerification?.id === id) {
      setSelectedVerification({ ...selectedVerification, verificacion: 'Verificado', estadoDNI: 'Validado' });
    }

    try {
      await dbHelper.updateUserVerification(id, true, 'Validado');
      // Notificar al profesional que su identidad fue verificada
      await dbHelper.crearNotificacion({
        usuario_id: id,
        tipo: 'sistema',
        titulo: '✅ Identidad Verificada',
        descripcion: '¡Felicitaciones! Tu identidad (DNI) fue revisada y aprobada por el equipo de OficiosYa. Ahora tenés el sello de profesional verificado.',
      });
      alert('✅ Insignia de Identidad Verificada (DNI) otorgada con éxito.');
    } catch (e) {
      console.error("Error al validar DNI en BD:", e);
    }
  };

  const handleApproveCertificates = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, matriculadoVerificado: true, estadoCertificados: 'Validado' } : u);
    saveUsers(updated);
    if (selectedVerification?.id === id) {
      setSelectedVerification({ ...selectedVerification, matriculadoVerificado: true, estadoCertificados: 'Validado' });
    }

    try {
      await dbHelper.updateUserVerification(id, true, undefined, true, 'Validado');
      // Notificar al profesional que sus certificados fueron aprobados
      await dbHelper.crearNotificacion({
        usuario_id: id,
        tipo: 'sistema',
        titulo: '🏆 Certificados Aprobados',
        descripcion: '¡Tu expediente y certificados fueron aprobados! Ya contás con el sello de Profesional Matriculado / Certificado en tu perfil.',
      });
      alert('🏆 Insignia de Profesional Matriculado / Certificado otorgada con éxito.');
    } catch (e) {
      console.error("Error al validar certificados en BD:", e);
    }
  };

  const handleRejectVerification = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, verificacion: 'Rechazado', estadoDNI: 'Pendiente', matriculadoVerificado: false, estadoCertificados: 'Pendiente' } : u);
    saveUsers(updated);
    setSelectedVerification(null);

    try {
      await dbHelper.updateUserVerification(id, false, 'Pendiente', false, 'Pendiente');
      alert('Solicitud rechazada.');
    } catch (e) {
      console.error("Error al rechazar verificación en BD:", e);
    }
  };

  // Moderation actions
  const handleDeleteJob = async (id: number | string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este trabajo por infracción de normas?')) return;
    const updated = jobs.filter(j => j.id !== id);
    saveJobs(updated);

    try {
      await dbHelper.deleteJob(id);
    } catch (e) {
      console.error("Error al eliminar trabajo en BD:", e);
    }
  };

  // Marketing submit — sends real notifications to Supabase for all target users
  const handleSendMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketingTitle || !marketingBody) return;

    setMarketingSending(true);
    setMarketingError('');

    try {
      // Determine which users should receive the notification
      let targetUsers: any[] = [];
      if (marketingTarget === 'Todos') {
        targetUsers = users;
      } else if (marketingTarget === 'Cliente') {
        targetUsers = users.filter(u => u.role === 'Cliente');
      } else if (marketingTarget === 'Profesional') {
        targetUsers = users.filter(u => u.role === 'Profesional');
      }

      if (targetUsers.length === 0) {
        setMarketingError('No hay usuarios en el segmento seleccionado.');
        setMarketingSending(false);
        return;
      }

      // Send a real notification to each target user in Supabase
      const promises = targetUsers.map(u =>
        dbHelper.crearNotificacion({
          usuario_id: u.id,
          tipo: 'sistema',
          titulo: `📢 ${marketingTitle}`,
          descripcion: marketingBody,
        })
      );
      await Promise.all(promises);

      // Track in local state for the history panel
      const newAnnouncement = {
        id: Date.now().toString(),
        titulo: marketingTitle,
        mensaje: marketingBody,
        destinatarios: marketingTarget,
        fecha: new Date().toLocaleDateString('es-AR'),
        tipo: 'Promo',
        enviados: targetUsers.length,
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);

      setMarketingSuccess(true);
      setMarketingTitle('');
      setMarketingBody('');
      setTimeout(() => setMarketingSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error enviando campaña:', err);
      setMarketingError('Ocurrió un error al enviar la campaña. Intenta nuevamente.');
    } finally {
      setMarketingSending(false);
    }
  };

  // Support ticket actions
  const handleResolveTicket = (id: string) => {
    const updated = tickets.map(t => t.id === id ? { ...t, estado: 'Resuelto' } : t);
    saveTickets(updated);
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await dbHelper.responderTicketAdmin(id, replyText.trim(), 'Resuelto');
      setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: 'Resuelto', respuesta: replyText.trim() } : t));
      setReplyingTicketId(null);
      setReplyText('');
    } catch (err) {
      console.error('Error al responder ticket:', err);
    }
  };

  const handleDeleteTicket = (id: string) => {
    if (!confirm('¿Deseas eliminar este ticket de la lista de administración?')) return;
    const updated = tickets.filter(t => t.id !== id);
    saveTickets(updated);
  };

  // Filtered Users logic
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                        user.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                        (user.trade && user.trade.toLowerCase().includes(userSearch.toLowerCase()));
    const matchRole = roleFilter === 'Todos' || user.role === roleFilter;
    const matchStatus = statusFilter === 'Todos' || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Calculate dynamic stats
  const totalUsersCount = users.length;
  const activeProsCount = users.filter(u => u.role === 'Profesional' && u.status === 'Activo').length;
  const activeSubsCount = users.filter(u => u.plan === 'Pro' || u.plan === 'Master').length;
  const pendingVerificationsCount = users.filter(u => u.verificacion === 'Pendiente').length;

  const handleLogout = async () => {
    await dbHelper.logout();
    router.push('/login');
  };

  // Feedback status update
  const handleFeedbackStatus = async (id: string, nuevoEstado: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, estado: nuevoEstado } : f));
    try {
      await dbHelper.responderTicketAdmin(id, '', nuevoEstado);
    } catch (e) {
      console.error('Error al actualizar estado del feedback:', e);
    }
  };

  // Campaign actions
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.nombre) return;
    const newCampaign = {
      id: Date.now().toString(),
      ...campaignForm,
      fechaCreacion: new Date().toLocaleDateString('es-AR'),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    setCampaignForm({ nombre: '', banner: '', fechaInicio: '', fechaFin: '', categoria: 'Todos', beneficio: '', botonTexto: '', botonUrl: '', tipo: 'Campaña', activa: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-[#0f4c81] selection:text-white">
      
      {/* Sidebar Admin — Rediseño con secciones agrupadas */}
      <aside className="w-64 bg-[#00355f] text-white hidden md:flex flex-col shadow-xl z-20 shrink-0">
        {/* Logo y badge admin */}
        <div className="p-5 border-b border-white/10 flex flex-col gap-2">
          <Logo theme="dark" size="md" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-black bg-[#fc8127] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Super Admin</span>
            <span className="text-[10px] text-blue-300 font-medium truncate">{profile?.nombre || user?.email}</span>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1 scrollbar-thin">

          {/* SECCIÓN: OPERACIONES */}
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-3 pt-3 pb-1">Operaciones</p>
          
          <button onClick={() => setActiveTab('resumen')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'resumen' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <BarChart3 className="w-4 h-4 shrink-0" /> Resumen General
          </button>

          <button onClick={() => setActiveTab('analiticas')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analiticas' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <TrendingUp className="w-4 h-4 shrink-0" /> Métricas y Analíticas
          </button>

          {/* SECCIÓN: COMUNIDAD */}
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-3 pt-4 pb-1">Comunidad</p>

          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'usuarios' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Users className="w-4 h-4 shrink-0" /> Gestión de Usuarios
          </button>

          <button onClick={() => setActiveTab('verificaciones')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'verificaciones' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 shrink-0" /> Verificaciones</div>
            {pendingVerificationsCount > 0 && <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingVerificationsCount}</span>}
          </button>

          <button onClick={() => setActiveTab('trabajos')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'trabajos' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><Settings className="w-4 h-4 shrink-0" /> Moderar Trabajos</div>
            {jobs.filter(j => j.reportes > 0).length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{jobs.filter(j => j.reportes > 0).length}</span>}
          </button>

          {/* SECCIÓN: COMUNICACIÓN */}
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-3 pt-4 pb-1">Comunicación</p>

          <button onClick={() => { setActiveTab('marketing'); setMarketingSubTab('notificaciones'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'marketing' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Megaphone className="w-4 h-4 shrink-0" /> Notificaciones
          </button>

          <button onClick={() => { setActiveTab('campanas'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'campanas' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Sparkles className="w-4 h-4 shrink-0" /> Campañas y Banners
            {campaigns.filter(c => c.activa).length > 0 && <span className="ml-auto bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{campaigns.filter(c => c.activa).length}</span>}
          </button>

          <button onClick={() => setActiveTab('soporte')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'soporte' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4 shrink-0" /> Buzón de Soporte</div>
            {tickets.filter(t => t.estado === 'Pendiente' || t.estado === 'Recibida').length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{tickets.filter(t => t.estado === 'Pendiente' || t.estado === 'Recibida').length}</span>}
          </button>

          <button onClick={() => setActiveTab('feedback')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'feedback' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><Star className="w-4 h-4 shrink-0" /> Centro de Feedback</div>
            {feedbacks.filter(f => f.estado === 'Recibida').length > 0 && <span className="bg-yellow-400 text-gray-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">{feedbacks.filter(f => f.estado === 'Recibida').length}</span>}
          </button>

          {/* SECCIÓN: PLATAFORMA */}
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-3 pt-4 pb-1">Plataforma</p>

          <button onClick={() => setActiveTab('seguridad')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'seguridad' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><Shield className="w-4 h-4 shrink-0" /> Centro de Seguridad</div>
            {denuncias.filter(d => d.estado === 'Recibida').length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{denuncias.filter(d => d.estado === 'Recibida').length}</span>}
          </button>

          <button onClick={() => setActiveTab('financiero')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'financiero' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Wallet className="w-4 h-4 shrink-0" /> Finanzas y Planes
          </button>

          <button onClick={() => setActiveTab('configuracion')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'configuracion' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Sliders className="w-4 h-4 shrink-0" /> Ajustes y Reglas
          </button>

        </nav>

        {/* Footer del sidebar */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button onClick={handlePurgeAllData} disabled={clearing} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> {clearing ? 'Borrando...' : 'Vaciar DB'}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-white/10 transition-colors text-xs font-bold">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Admin */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-xl font-extrabold text-[#00355f] capitalize">
            {activeTab === 'resumen' ? 'Resumen General' : 
           activeTab === 'analiticas' ? 'Métricas Analíticas y Tráfico' : 
           activeTab === 'trabajos' ? 'Moderación de Solicitudes' : 
           activeTab === 'usuarios' ? 'Gestión de Usuarios' : 
           activeTab === 'seguridad' ? 'Centro de Seguridad y Denuncias' :
           activeTab === 'financiero' ? 'Panel Financiero y Suscripciones' :
           activeTab === 'configuracion' ? 'Configuración Global de la App' :
           activeTab === 'feedback' ? 'Centro de Feedback ⭐' :
           activeTab === 'campanas' ? 'Campañas y Banners ✨' :
           activeTab === 'marketing' ? 'Notificaciones Masivas 📢' :
           activeTab === 'soporte' ? 'Buzón de Soporte 💬' :
           activeTab === 'verificaciones' ? 'Verificaciones de Identidad' :
           activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePurgeAllData}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              {clearing ? 'Vaciando...' : 'Vaciar Todos los Datos'}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{profile?.nombre || profile?.name || 'Administrador'}</p>
              <p className="text-xs text-[#fc8127] font-bold">Super Administrador</p>
            </div>
            <div className="w-10 h-10 bg-[#00355f] rounded-full flex items-center justify-center text-white font-bold">
              {(profile?.nombre || profile?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Content Frame */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          
          {/* TAB 1: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuarios Registrados</p>
                    <p className="text-3xl font-black text-[#00355f]">{totalUsersCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profesionales Activos</p>
                    <p className="text-3xl font-black text-[#00355f]">{activeProsCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suscripciones Pro/Master</p>
                    <p className="text-3xl font-black text-[#00355f]">{activeSubsCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verificaciones Pendientes</p>
                    <p className="text-3xl font-black text-[#00355f]">{pendingVerificationsCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Secciones de alerta rápidos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Alertas de soporte */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#00355f] flex items-center justify-between">
                    Tickets de Soporte Activos
                    <span className="text-xs font-bold text-gray-400">Total: {tickets.filter(t => t.estado === 'Pendiente').length}</span>
                  </h3>
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto space-y-3">
                    {tickets.filter(t => t.estado === 'Pendiente').length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No hay quejas ni sugerencias pendientes.</p>
                    ) : (
                      tickets.filter(t => t.estado === 'Pendiente').slice(0, 3).map(ticket => (
                        <div key={ticket.id} className="pt-3 flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{ticket.tipo}</span>
                            <p className="text-sm font-bold text-gray-900 mt-1">{ticket.nombre}</p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{ticket.mensaje}</p>
                          </div>
                          <button onClick={() => { setActiveTab('soporte'); setReplyingTicketId(ticket.id); }} className="text-xs text-[#00355f] font-bold hover:underline">Resolver</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reportes de trabajos */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#00355f] flex items-center justify-between">
                    Solicitudes de Verificación en Espera
                    <span className="text-xs font-bold text-gray-400">Pendientes: {pendingVerificationsCount}</span>
                  </h3>
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto space-y-3">
                    {users.filter(u => u.verificacion === 'Pendiente').length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">Todos los profesionales están validados.</p>
                    ) : (
                      users.filter(u => u.verificacion === 'Pendiente').slice(0, 3).map(user => (
                        <div key={user.id} className="pt-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-[#fc8127] font-bold">{user.trade}</p>
                          </div>
                          <button onClick={() => { setActiveTab('verificaciones'); setSelectedVerification(user); }} className="text-xs bg-[#00355f] text-white font-bold px-3 py-1.5 rounded-xl">Validar</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: MÉTRICAS ANALÍTICAS */}
          {activeTab === 'analiticas' && (() => {
            const diasSemanaMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const diasOrdenados = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

            // Conteo real por día de la semana desde registros de Supabase
            const actividadRealSemana = diasOrdenados.map(diaNombre => {
              const accesos = users.filter(u => {
                const fecha = u.created_at || u.fechaRegistro;
                if (!fecha) return false;
                return diasSemanaMap[new Date(fecha).getDay()] === diaNombre;
              }).length;

              const presupuestos = postulaciones.filter(p => {
                const fecha = p.created_at || p.fecha;
                if (!fecha) return false;
                return diasSemanaMap[new Date(fecha).getDay()] === diaNombre;
              }).length;

              return { dia: diaNombre, accesos, solicitudes: presupuestos };
            });

            const maxAccesosSemana = Math.max(...actividadRealSemana.map(a => a.accesos), 1);
            const maxSolicitudesSemana = Math.max(...actividadRealSemana.map(a => a.solicitudes), 1);

            return (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* Tarjetas Principales de Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profesionales Registrados</p>
                      <p className="text-3xl font-black text-[#00355f]">{users.filter(u => u.role === 'Profesional').length}</p>
                      <p className="text-[11px] text-green-600 font-bold">100% Real (Base de Datos Supabase)</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bajas / Inactivos</p>
                      <p className="text-3xl font-black text-red-600">{users.filter(u => u.role === 'Profesional' && u.status !== 'Activo').length}</p>
                      <p className="text-[11px] text-gray-500 font-bold">Estado suspendido / inactivo en BD</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                      <UserX className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accesos Registrados</p>
                      <p className="text-3xl font-black text-[#00355f]">{users.length}</p>
                      <p className="text-[11px] text-orange-600 font-bold">Cuentas activas en la BD</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registros Totales Plataforma</p>
                      <p className="text-3xl font-black text-[#00355f]">{users.length + jobs.length}</p>
                      <p className="text-[11px] text-green-600 font-bold">Usuarios + Trabajos en BD</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>

                </div>

                {/* Gráfico y Estadísticas de Interacción */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Gráfico de Actividad Semanal */}
                  <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-[#00355f]">Actividad Semanal Real</h3>
                        <p className="text-xs text-gray-500">Nuevos usuarios y presupuestos enviados por día según la BD</p>
                      </div>
                      <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">Datos Reales Supabase</span>
                    </div>

                    {/* Visual Bar Chart Real */}
                    <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-gray-100">
                      {actividadRealSemana.map((item, i) => {
                        const heightAccesos = item.accesos === 0 ? 4 : Math.round((item.accesos / maxAccesosSemana) * 100);
                        const heightSolicitudes = item.solicitudes === 0 ? 4 : Math.round((item.solicitudes / maxSolicitudesSemana) * 100);

                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="w-full flex items-end justify-center gap-1.5 h-full">
                              <div 
                                style={{ height: `${heightAccesos}%` }} 
                                className={`w-full max-w-[18px] rounded-t-md transition-all relative ${item.accesos > 0 ? 'bg-[#00355f] group-hover:bg-[#0f4c81]' : 'bg-gray-200'}`}
                              >
                                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                                  {item.accesos} registros
                                </span>
                              </div>
                              <div 
                                style={{ height: `${heightSolicitudes}%` }} 
                                className={`w-full max-w-[18px] rounded-t-md transition-all relative ${item.solicitudes > 0 ? 'bg-[#fc8127] group-hover:bg-[#e67320]' : 'bg-gray-200'}`}
                              >
                                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                                  {item.solicitudes} presupuestos
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-gray-500 mt-1">{item.dia}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-6 text-xs font-bold">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#00355f] rounded"></span> Registros de Usuarios</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#fc8127] rounded"></span> Presupuestos Enviados</div>
                    </div>
                  </div>

                {/* Resumen de Conversión */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-[#00355f]">Conversión de la Plataforma</h3>
                  
                  <div className="space-y-4 divide-y divide-gray-100">
                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Solicitudes Totales</span>
                      <span className="text-sm font-black text-[#00355f]">{jobs.length}</span>
                    </div>
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Presupuestos Enviados</span>
                      <span className="text-sm font-black text-[#fc8127]">{postulaciones.length}</span>
                    </div>
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Promedio Presupuestos / Trabajo</span>
                      <span className="text-sm font-black text-[#00355f]">
                        {jobs.length > 0 ? (postulaciones.length / jobs.length).toFixed(1) : '0'}
                      </span>
                    </div>
                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">Obras Adjudicadas</span>
                      <span className="text-sm font-black text-green-600">
                        {postulaciones.filter(p => p.estado === 'Aceptado').length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Tasa de Conversión Solicitud / Obra</p>
                    <p className="text-3xl font-black text-[#00355f] mt-1">
                      {jobs.length > 0 ? Math.round((postulaciones.filter(p => p.estado === 'Aceptado').length / jobs.length) * 100) : 0}%
                    </p>
                  </div>
                </div>

              </div>

              {/* Distribución por Rubros / Oficios */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-[#00355f]">Distribución de Profesionales por Oficio</h3>
                {users.filter(u => u.role === 'Profesional').length === 0 ? (
                  <p className="text-xs text-gray-400 py-4">No hay profesionales registrados en la base de datos aún.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
                    {(() => {
                      const counts: Record<string, number> = {};
                      users.filter(u => u.role === 'Profesional').forEach(u => {
                        const tradeList = u.oficios || (u.trade ? u.trade.split(',') : []);
                        if (tradeList.length === 0) {
                          counts['Sin clasificar'] = (counts['Sin clasificar'] || 0) + 1;
                        } else {
                          tradeList.forEach((t: string) => {
                            const key = t.trim() || 'General';
                            counts[key] = (counts[key] || 0) + 1;
                          });
                        }
                      });
                      return Object.entries(counts).map(([rubro, cantidad]) => (
                        <div key={rubro} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                          <span className="text-xs font-bold text-gray-500 truncate">{rubro}</span>
                          <span className="text-xl font-black text-[#00355f] mt-2">{cantidad}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

          {/* TAB 2: GESTIÓN DE USUARIOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filtros */}
                <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-gray-50/50">
                  <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, email o rubro..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm shadow-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">Rol:</span>
                      <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold focus:outline-none"
                      >
                        <option value="Todos">Todos</option>
                        <option value="Cliente">Clientes</option>
                        <option value="Profesional">Profesionales</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">Estado:</span>
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold focus:outline-none"
                      >
                        <option value="Todos">Todos</option>
                        <option value="Activo">Activos</option>
                        <option value="Inactivo">Inactivos</option>
                        <option value="Suspendido">Suspendidos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Rol / Oficio</th>
                        <th className="p-4">Suscripción</th>
                        <th className="p-4">Validación</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400 font-medium">No se encontraron usuarios con esos filtros.</td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-extrabold text-[#00355f]">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'Profesional' ? 'bg-orange-50 text-[#fc8127]' : 'bg-blue-50 text-[#00355f]'}`}>
                                {u.role}
                              </span>
                              {u.trade && <p className="text-xs text-gray-500 mt-1 font-semibold">{u.trade}</p>}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                u.plan === 'Master' ? 'bg-purple-100 text-purple-700' :
                                u.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {u.plan}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                u.verificacion === 'Verificado' ? 'bg-green-100 text-green-700' :
                                u.verificacion === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {u.verificacion}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                u.status === 'Activo' ? 'bg-green-100 text-green-700' : 
                                u.status === 'Suspendido' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => setSelectedUser(u)}
                                className="text-xs bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-xl hover:bg-gray-200 transition-colors"
                              >
                                Administrar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICACIONES */}
          {activeTab === 'verificaciones' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-4">
                {users.filter(u => u.verificacion === 'Pendiente').length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center shadow-sm">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#00355f]">¡Todas las solicitudes resueltas!</h3>
                    <p className="text-sm text-gray-500 mt-1">No hay matrículas ni credenciales esperando revisión en este momento.</p>
                  </div>
                ) : (
                  users.filter(u => u.verificacion === 'Pendiente').map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-extrabold text-[#00355f]">{user.name}</h4>
                          <span className="text-[10px] font-bold bg-orange-100 text-[#fc8127] px-2 py-0.5 rounded-full uppercase">{user.trade}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Registrado el {user.date} · Correo: {user.email}</p>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mt-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-600 font-medium"><strong>Documento/Matrícula adjunta:</strong> {user.docMatricula}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button 
                          onClick={() => setSelectedVerification(user)}
                          className="bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" /> Cotejar y Revisar Insignias
                        </button>
                        <button 
                          onClick={() => handleRejectVerification(user.id)}
                          className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MODERACIÓN DE TRABAJOS */}
          {activeTab === 'trabajos' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Listado de Solicitudes y Ofertas</h3>
                    <p className="text-xs text-gray-500">Supervisa las solicitudes express del muro y las ofertas de empleo tradicionales.</p>
                  </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex border-b border-gray-100 mb-6 gap-2">
                  <button 
                    onClick={() => { setJobSubTab('muro'); setSelectedJobForApplicants(null); }}
                    className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${jobSubTab === 'muro' ? 'border-[#fc8127] text-[#fc8127]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    Muro Express ({jobs.filter(j => !j.tipo && !j.salario).length})
                  </button>
                  <button 
                    onClick={() => { setJobSubTab('bolsa'); setSelectedJobForApplicants(null); }}
                    className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${jobSubTab === 'bolsa' ? 'border-[#fc8127] text-[#fc8127]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    Bolsa de Empleo ({jobs.filter(j => j.tipo || j.salario).length})
                  </button>
                </div>

                {/* Sub Tab Content 1: Muro Express */}
                {jobSubTab === 'muro' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {jobs.filter(j => !j.tipo && !j.salario).length === 0 ? (
                      <p className="text-center py-8 text-gray-400 font-medium">No hay trabajos activos en el muro express.</p>
                    ) : (
                      jobs.filter(j => !j.tipo && !j.salario).map(job => (
                        <div key={job.id} className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold bg-blue-100 text-[#00355f] px-2 py-0.5 rounded-full uppercase">{job.categoria || job.oficio}</span>
                              {job.urgente && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Urgente</span>}
                              {job.reportes > 0 && <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">⚠️ {job.reportes} reportes</span>}
                            </div>
                            <h4 className="font-extrabold text-sm text-gray-900 mt-1">{job.titulo}</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{job.descripcion}</p>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold">{job.ubicacion || job.ciudad} · {job.tiempo || 'Reciente'}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar Trabajo
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub Tab Content 2: Bolsa de Empleo */}
                {jobSubTab === 'bolsa' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {jobs.filter(j => j.tipo || j.salario).length === 0 ? (
                      <p className="text-center py-8 text-gray-400 font-medium">No hay empleos activos en la bolsa.</p>
                    ) : (
                      jobs.filter(j => j.tipo || j.salario).map(job => {
                        const jobApps = postulaciones.filter(p => p.empleoId === job.id || p.idPostulacion === job.id);
                        return (
                          <div key={job.id} className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold bg-blue-100 text-[#00355f] px-2 py-0.5 rounded-full uppercase">{job.oficio || job.categoria}</span>
                                  {job.tipo && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{job.tipo}</span>}
                                  {job.salario && <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{job.salario}</span>}
                                </div>
                                <h4 className="font-extrabold text-sm text-gray-900 mt-1">{job.titulo}</h4>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{job.descripcion}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold">
                                  Publicado por: {job.empleador} · {job.ciudad || 'Centro'}, {job.provincia || 'Tucumán'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button 
                                  onClick={() => setSelectedJobForApplicants(selectedJobForApplicants?.id === job.id ? null : job)}
                                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#00355f] font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                                >
                                  <Users className="w-3.5 h-3.5" /> Postulantes ({jobApps.length})
                                </button>
                                <button 
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                              </div>
                            </div>

                            {/* Expandable Applicants list for this job */}
                            {selectedJobForApplicants?.id === job.id && (
                              <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <h5 className="text-xs font-bold text-[#00355f] uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" /> Candidatos Postulados
                                </h5>
                                <div className="divide-y divide-gray-100 space-y-3">
                                  {jobApps.length === 0 ? (
                                    <p className="text-xs text-gray-400 py-2">Nadie se ha postulado todavía a esta vacante.</p>
                                  ) : (
                                    jobApps.map(app => (
                                      <div key={app.id} className="pt-3 flex items-start justify-between gap-3 text-xs">
                                        <div className="flex items-start gap-3">
                                          <img 
                                            src={app.candidatoAvatar || 'https://i.pravatar.cc/150'} 
                                            alt={app.candidato} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                          />
                                          <div>
                                            <p className="font-extrabold text-gray-900">{app.candidato}</p>
                                            <p className="text-[10px] text-gray-400 font-semibold">{app.candidatoOficio || 'Profesional'}</p>
                                            <p className="text-[11px] text-gray-600 mt-1 italic">"{app.mensaje}"</p>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                            app.estado === 'Aceptado' ? 'bg-green-100 text-green-700' :
                                            app.estado === 'Rechazado' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                          }`}>
                                            {app.estado}
                                          </span>
                                          <span className="text-[9px] text-gray-400 font-bold">
                                            {app.fecha ? new Date(app.fecha).toLocaleDateString('es-AR') : 'Reciente'}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 5: CAMPAÑAS DE MARKETING */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Formulario */}
                <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Enviar Campaña Masiva</h3>
                    <p className="text-xs text-gray-500 mt-1">El mensaje enviado aparecerá de inmediato en el centro de notificaciones de los destinatarios.</p>
                  </div>

                  {marketingSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> ¡Notificación masiva enviada a Supabase con éxito! Los usuarios ya la pueden ver.
                    </div>
                  )}

                  {marketingError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {marketingError}
                    </div>
                  )}

                  <form onSubmit={handleSendMarketing} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Destinatarios</label>
                      <select 
                        value={marketingTarget}
                        onChange={(e) => setMarketingTarget(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm font-bold text-gray-700"
                      >
                        <option value="Todos">Todos los Usuarios</option>
                        <option value="Cliente">Solo Clientes</option>
                        <option value="Profesional">Solo Profesionales</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Asunto / Título</label>
                      <input 
                        type="text" 
                        required
                        value={marketingTitle}
                        onChange={(e) => setMarketingTitle(e.target.value)}
                        placeholder="Ej: Nuevo beneficio: ¡Sello de garantía OficiosYa!" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mensaje de Notificación</label>
                      <textarea 
                        required
                        rows={5}
                        value={marketingBody}
                        onChange={(e) => setMarketingBody(e.target.value)}
                        placeholder="Escribe el mensaje publicitario o informativo..." 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={marketingSending}
                      className="w-full py-3.5 bg-[#fc8127] hover:bg-[#e67320] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {marketingSending ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando a usuarios...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar Notificación Masiva</>
                      )}
                    </button>
                  </form>
                </div>

                {/* Historial */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#00355f]">Historial de Campañas</h3>
                  <div className="divide-y divide-gray-100 space-y-3 max-h-[450px] overflow-y-auto">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">Aún no se han enviado campañas en esta sesión.</p>
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="pt-3 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold bg-[#fc8127]/10 text-[#fc8127] px-2 py-0.5 rounded-full">{ann.destinatarios}</span>
                            <span className="text-[9px] text-gray-400 font-bold">{ann.fecha}</span>
                          </div>
                          <p className="text-xs font-extrabold text-gray-900 mt-1">{ann.titulo}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{ann.mensaje}</p>
                          {ann.enviados && (
                            <p className="text-[10px] text-green-600 font-bold">✅ Enviado a {ann.enviados} usuario(s) en Supabase</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: BUZÓN DE SOPORTE */}
          {activeTab === 'soporte' && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px] animate-in fade-in duration-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#00355f]">Buzón de Consultas y Reclamos</h3>
                  <p className="text-xs text-gray-500">Administra los mensajes recibidos desde el formulario de soporte.</p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const allTickets = await dbHelper.getTodosLosTicketsAdmin();
                      const formatted = allTickets.map((t: any) => ({
                        id: t.id,
                        codigo: t.codigo_ticket || `#SO-${t.id.slice(0, 6)}`,
                        tipo: t.categoria || 'Consulta',
                        mensaje: t.mensaje,
                        nombre: t.usuario?.nombre || 'Usuario',
                        email: t.usuario?.email || '',
                        fecha: t.created_at ? new Date(t.created_at).toLocaleDateString('es-AR') : 'Reciente',
                        estado: t.estado || 'Recibida',
                        respuesta: t.respuesta_admin || ''
                      }));
                      setTickets(formatted);
                    } catch (e) { console.error(e); }
                  }}
                  className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                  title="Actualizar consultas"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 font-medium">No hay consultas de soporte registradas.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        ticket.estado === 'Resuelto' 
                          ? 'bg-gray-50/50 border-gray-100 opacity-80' 
                          : ticket.tipo === 'Queja'
                          ? 'bg-red-50/50 border-red-100'
                          : ticket.tipo === 'Sugerencia'
                          ? 'bg-blue-50/50 border-blue-100'
                          : 'bg-orange-50/50 border-orange-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              ticket.tipo === 'Queja' ? 'bg-red-100 text-red-700' :
                              ticket.tipo === 'Sugerencia' ? 'bg-blue-100 text-[#00355f]' :
                              'bg-orange-100 text-[#fc8127]'
                            }`}>
                              {ticket.tipo}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ticket.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {ticket.estado}
                            </span>
                          </div>
                          <p className="font-extrabold text-sm text-gray-900 mt-2">
                            {ticket.nombre} <span className="font-normal text-xs text-gray-400">({ticket.email})</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{ticket.fecha}</span>
                      </div>

                      <p className="text-sm text-gray-700 bg-white/70 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                        {ticket.mensaje}
                      </p>

                      {ticket.archivoBase64 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-gray-400 mb-1">Imagen adjunta de error:</p>
                          <div className="w-48 h-32 rounded-2xl overflow-hidden border border-gray-250 shadow-sm bg-gray-100">
                            <a href={ticket.archivoBase64} target="_blank" rel="noreferrer">
                              <img src={ticket.archivoBase64} alt="Error adjunto" className="w-full h-full object-cover hover:scale-105 transition-transform duration-250" />
                            </a>
                          </div>
                        </div>
                      )}

                      {ticket.respuesta && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-xs font-bold text-green-800">Respuesta enviada:</p>
                          <p className="text-xs text-gray-600 mt-1 italic">"{ticket.respuesta}"</p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-3 justify-end">
                        {ticket.estado === 'Pendiente' && (
                          <>
                            <button 
                              onClick={() => {
                                setReplyingTicketId(ticket.id);
                                setReplyText('');
                              }}
                              className="text-xs bg-[#00355f] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#0f4c81] transition-all"
                            >
                              Responder
                            </button>
                            <button 
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="text-xs border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Resolver sin responder
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1.5 flex items-center gap-1"
                          title="Eliminar ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>

                      {replyingTicketId === ticket.id && (
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-3">
                          <textarea 
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escribe la respuesta..."
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#00355f] focus:outline-none bg-gray-50"
                          ></textarea>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setReplyingTicketId(null)}
                              className="text-[11px] text-gray-500 font-bold px-3 py-1.5 hover:underline"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={() => handleSendReply(ticket.id)}
                              className="text-[11px] bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
                            >
                              Enviar Respuesta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: CENTRO DE SEGURIDAD Y DENUNCIAS */}
          {activeTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Alertas de seguridad automáticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                  users.filter(u => u.status === 'Suspendido').length > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Ban className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Cuentas Suspendidas</p>
                    <p className="text-2xl font-black text-gray-900">{users.filter(u => u.status === 'Suspendido').length}</p>
                  </div>
                </div>

                <div className={`p-5 rounded-3xl border flex items-center gap-4 ${
                  denuncias.filter(d => d.estado === 'Recibida').length > 0
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <TriangleAlert className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Denuncias Abiertas</p>
                    <p className="text-2xl font-black text-gray-900">{denuncias.filter(d => d.estado === 'Recibida').length}</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl border bg-blue-50 border-blue-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Shield className="w-6 h-6 text-[#00355f]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Denuncias</p>
                    <p className="text-2xl font-black text-gray-900">{denuncias.length}</p>
                  </div>
                </div>
              </div>

              {/* Reglas de alerta automática */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#fc8127]" />
                  <h3 className="text-base font-bold text-[#00355f]">Alertas Automáticas del Sistema</h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icono: <Clock className="w-4 h-4 text-yellow-500" />,
                      color: 'bg-yellow-50 border-yellow-200',
                      titulo: 'Profesionales con múltiples cancelaciones',
                      detalle: `${users.filter(u => u.role === 'Profesional' && u.status === 'Suspendido').length} profesional(es) suspendidos en la plataforma.`,
                      accion: () => setActiveTab('usuarios'),
                      textoAccion: 'Ver usuarios',
                    },
                    {
                      icono: <AlertCircle className="w-4 h-4 text-red-500" />,
                      color: 'bg-red-50 border-red-200',
                      titulo: 'Denuncias sin responder',
                      detalle: `${denuncias.filter(d => d.estado === 'Recibida').length} denuncia(s) esperando revisión del equipo.`,
                      accion: null,
                      textoAccion: null,
                    },
                    {
                      icono: <ShieldCheck className="w-4 h-4 text-orange-500" />,
                      color: 'bg-orange-50 border-orange-200',
                      titulo: 'Verificaciones de identidad pendientes',
                      detalle: `${pendingVerificationsCount} profesional(es) esperan aprobación de DNI o certificados.`,
                      accion: () => setActiveTab('verificaciones'),
                      textoAccion: 'Ir a Verificaciones',
                    },
                  ].map((alerta, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${alerta.color}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">{alerta.icono}</div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{alerta.titulo}</p>
                          <p className="text-[11px] text-gray-500">{alerta.detalle}</p>
                        </div>
                      </div>
                      {alerta.accion && (
                        <button
                          onClick={alerta.accion}
                          className="text-[11px] text-[#00355f] font-bold hover:underline shrink-0 ml-4"
                        >
                          {alerta.textoAccion} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Denuncias */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Denuncias y Reportes</h3>
                    <p className="text-xs text-gray-500">Reportes categorizados como 'Denuncia' o 'Reporte' en el buzón de soporte.</p>
                  </div>
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
                    {denuncias.length} total
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {denuncias.length === 0 ? (
                    <div className="text-center py-16">
                      <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">Sin denuncias activas</p>
                      <p className="text-xs text-gray-400 mt-1">La plataforma está en orden. No hay reportes pendientes.</p>
                    </div>
                  ) : (
                    denuncias.map(d => (
                      <div key={d.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <TriangleAlert className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{d.tipo}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                d.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 
                                d.estado === 'Recibida' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                              }`}>{d.estado}</span>
                              <span className="text-[10px] text-gray-400">{d.codigo}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{d.nombre} <span className="font-normal text-xs text-gray-400">({d.email})</span></p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{d.mensaje}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400">{d.fecha}</span>
                          <button
                            onClick={() => {
                              const target = users.find(u => u.email === d.email);
                              if (target) {
                                setSelectedUser(target);
                              } else {
                                alert('No se encontró el usuario en la base de datos.');
                              }
                            }}
                            className="text-[11px] bg-[#00355f] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#0f4c81] transition-colors"
                          >
                            Ver usuario
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Centro de Salud de la Plataforma */}
              <div className="bg-gradient-to-br from-[#00355f] to-[#0f4c81] p-6 rounded-3xl shadow-md space-y-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Centro de Salud de la Plataforma</h3>
                    <p className="text-xs text-blue-200">Indicadores críticos en tiempo real</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-orange-300" />
                      <span className="text-xs font-bold text-blue-100">Verificaciones pendientes</span>
                    </div>
                    <span className={`text-sm font-black ${pendingVerificationsCount > 0 ? 'text-orange-300' : 'text-green-300'}`}>
                      {pendingVerificationsCount > 0 ? `⚠️ ${pendingVerificationsCount}` : '✅ 0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs font-bold text-blue-100">Tickets sin responder</span>
                    </div>
                    <span className={`text-sm font-black ${tickets.filter(t => t.estado === 'Pendiente').length > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
                      {tickets.filter(t => t.estado === 'Pendiente').length > 0 ? `⚠️ ${tickets.filter(t => t.estado === 'Pendiente').length}` : '✅ 0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-bold text-blue-100">Denuncias abiertas</span>
                    </div>
                    <span className={`text-sm font-black ${denuncias.filter(d => d.estado === 'Recibida').length > 0 ? 'text-red-300' : 'text-green-300'}`}>
                      {denuncias.filter(d => d.estado === 'Recibida').length > 0 ? `🚨 ${denuncias.filter(d => d.estado === 'Recibida').length}` : '✅ 0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Ban className="w-4 h-4 text-red-300" />
                      <span className="text-xs font-bold text-blue-100">Cuentas suspendidas</span>
                    </div>
                    <span className={`text-sm font-black ${users.filter(u => u.status === 'Suspendido').length > 0 ? 'text-red-300' : 'text-green-300'}`}>
                      {users.filter(u => u.status === 'Suspendido').length > 0 ? users.filter(u => u.status === 'Suspendido').length : '✅ 0'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('seguridad')}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Ver Centro de Seguridad →
                </button>
              </div>

            </div>
          )}

          {/* TAB 8: PANEL FINANCIERO Y PLANES */}
          {activeTab === 'financiero' && (() => {
            const profesionales = users.filter(u => u.role === 'Profesional');
            const totalPro = profesionales.filter(u => u.plan === 'Pro').length;
            const totalMaster = profesionales.filter(u => u.plan === 'Master').length;
            const ingresosEstimados = (totalPro * 5000) + (totalMaster * 10000);

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Resumen Financiero */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl border bg-green-50 border-green-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Ingresos Mensuales</p>
                      <p className="text-2xl font-black text-gray-900">${ingresosEstimados.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl border bg-blue-50 border-blue-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Suscripciones Pro</p>
                      <p className="text-2xl font-black text-gray-900">{totalPro}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <CreditCard className="w-6 h-6 text-[#00355f]" />
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl border bg-orange-50 border-orange-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Suscripciones Master</p>
                      <p className="text-2xl font-black text-gray-900">{totalMaster}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Crown className="w-6 h-6 text-[#fc8127]" />
                    </div>
                  </div>
                </div>

                {/* Profesionales Premium */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                  <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-[#00355f]">Gestión de Suscripciones Premium</h3>
                    <p className="text-xs text-gray-500">Administra los planes de los profesionales desde aquí. Puedes mejorar o degradar sus cuentas.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                        <tr>
                          <th className="p-4 font-bold text-gray-600">Profesional</th>
                          <th className="p-4 font-bold text-gray-600">Plan Actual</th>
                          <th className="p-4 font-bold text-gray-600">Estado</th>
                          <th className="p-4 font-bold text-gray-600 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {profesionales.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-8 text-gray-400 font-medium">No hay profesionales registrados.</td></tr>
                        ) : (
                          profesionales.map(pro => (
                            <tr key={pro.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <p className="font-bold text-gray-900">{pro.name}</p>
                                <p className="text-xs text-gray-500">{pro.email}</p>
                              </td>
                              <td className="p-4">
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                  pro.plan === 'Master' ? 'bg-[#fc8127]/10 text-[#fc8127]' :
                                  pro.plan === 'Pro' ? 'bg-[#00355f]/10 text-[#00355f]' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {pro.plan || 'Gratis'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  pro.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>{pro.status}</span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => setSelectedUser(pro)}
                                  className="text-xs bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Cambiar plan
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* TAB 9: CONFIGURACIÓN GLOBAL */}
          {activeTab === 'configuracion' && (
            <div className="space-y-6 animate-in fade-in duration-200 h-full overflow-y-auto pb-8 pr-2">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gestión de Categorías */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <ListPlus className="w-5 h-5 text-[#00355f]" />
                    <div>
                      <h3 className="text-base font-bold text-[#00355f]">Gestión de Oficios</h3>
                      <p className="text-xs text-gray-500">Administra las categorías disponibles</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nuevo oficio (ej: Jardinero)" className="flex-1 p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                    <button className="bg-[#fc8127] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#e67320]">Añadir</button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Electricista', 'Plomero', 'Albañil', 'Pintor', 'Gasista', 'Carpintero', 'Técnico PC'].map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full">
                        {cat}
                        <button className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sistema de Puntos y Gamificación */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <Target className="w-5 h-5 text-[#fc8127]" />
                    <div>
                      <h3 className="text-base font-bold text-[#00355f]">Reglas de Puntos y Fidelización</h3>
                      <p className="text-xs text-gray-500">¿Cuántos puntos otorga cada acción?</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { accion: 'Completar perfil al 100%', puntos: 50 },
                      { accion: 'Publicar un trabajo (Cliente)', puntos: 10 },
                      { accion: 'Recibir reseña 5 estrellas', puntos: 25 },
                      { accion: 'Denuncia confirmada (Penalización)', puntos: -100 }
                    ].map((regla, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">{regla.accion}</span>
                        <div className="flex items-center gap-2">
                          <input type="number" defaultValue={regla.puntos} className="w-16 p-1.5 text-center text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg" />
                          <span className="text-[10px] font-bold text-gray-400">pts</span>
                        </div>
                      </div>
                    ))}
                    <button className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors">Guardar Reglas</button>
                  </div>
                </div>
              </div>

              {/* Registro de Auditoría */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <History className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="text-base font-bold text-[#00355f]">Log de Auditoría</h3>
                    <p className="text-xs text-gray-500">Registro inmutable de las acciones críticas de los administradores.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 font-bold text-gray-600 text-xs">Fecha y Hora</th>
                        <th className="p-3 font-bold text-gray-600 text-xs">Admin</th>
                        <th className="p-3 font-bold text-gray-600 text-xs">Acción Realizada</th>
                        <th className="p-3 font-bold text-gray-600 text-xs">Nivel Riesgo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-xs font-medium text-gray-400">
                            No hay registros de auditoría registrados en la plataforma.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log, i) => {
                          const riesgoColor = log.riesgo === 'Alto' ? 'bg-red-100 text-red-700' :
                            log.riesgo === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700';
                          return (
                            <tr key={log.id || i} className="hover:bg-gray-50">
                              <td className="p-3 text-[11px] font-bold text-gray-500">
                                {log.created_at ? new Date(log.created_at).toLocaleString('es-AR') : 'Reciente'}
                              </td>
                              <td className="p-3 text-xs text-[#00355f] font-bold">{log.admin_email || 'Admin'}</td>
                              <td className="p-3 text-xs text-gray-700">{log.accion}</td>
                              <td className="p-3">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${riesgoColor}`}>{log.riesgo || 'Bajo'}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: CENTRO DE FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Recibidas', count: feedbacks.filter(f => f.estado === 'Recibida').length, color: 'bg-gray-50 border-gray-200', tc: 'text-gray-700' },
                  { label: 'En análisis', count: feedbacks.filter(f => f.estado === 'En análisis').length, color: 'bg-blue-50 border-blue-200', tc: 'text-blue-700' },
                  { label: 'Aprobadas', count: feedbacks.filter(f => f.estado === 'Aprobada').length, color: 'bg-green-50 border-green-200', tc: 'text-green-700' },
                  { label: 'Implementadas', count: feedbacks.filter(f => f.estado === 'Implementada').length, color: 'bg-purple-50 border-purple-200', tc: 'text-purple-700' },
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-3xl border ${stat.color} flex items-center justify-between`}>
                    <p className={`text-xs font-bold ${stat.tc}`}>{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.tc}`}>{stat.count}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Sugerencias y Propuestas</h3>
                    <p className="text-xs text-gray-500">Tickets con categoría "Sugerencia". Actualizá el estado para mantener a los usuarios informados.</p>
                  </div>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">{feedbacks.length} total</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-16">
                      <Lightbulb className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">Sin sugerencias todavía</p>
                      <p className="text-xs text-gray-400 mt-1">Cuando los usuarios envíen sugerencias aparecerán aquí.</p>
                    </div>
                  ) : (
                    feedbacks.map(fb => {
                      const estadoConfig: Record<string, { bg: string; text: string }> = {
                        'Recibida':      { bg: 'bg-gray-100',    text: 'text-gray-600' },
                        'En análisis':   { bg: 'bg-blue-100',    text: 'text-blue-700' },
                        'Aprobada':      { bg: 'bg-green-100',   text: 'text-green-700' },
                        'Planificada':   { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
                        'En desarrollo': { bg: 'bg-orange-100',  text: 'text-orange-700' },
                        'Implementada':  { bg: 'bg-purple-100',  text: 'text-purple-700' },
                        'Rechazada':     { bg: 'bg-red-100',     text: 'text-red-700' },
                      };
                      const cfg = estadoConfig[fb.estado] || estadoConfig['Recibida'];
                      return (
                        <div key={fb.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                                <Lightbulb className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{fb.estado}</span>
                                  <span className="text-[10px] font-bold text-blue-600 capitalize">{fb.rol}</span>
                                  <span className="text-[10px] text-gray-400">{fb.fecha}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{fb.nombre} <span className="font-normal text-xs text-gray-400">({fb.email})</span></p>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{fb.mensaje}</p>
                              </div>
                            </div>
                            <select
                              value={fb.estado}
                              onChange={e => handleFeedbackStatus(fb.id, e.target.value)}
                              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fc8127] shrink-0"
                            >
                              {['Recibida','En análisis','Aprobada','Planificada','En desarrollo','Implementada','Rechazada'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAMPAÑAS Y BANNERS */}
          {activeTab === 'campanas' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Crear Campaña */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#fc8127]/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#fc8127]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#00355f]">Nueva Campaña / Banner</h3>
                      <p className="text-xs text-gray-500">Crea campañas, popups, banners y anuncios.</p>
                    </div>
                  </div>
                  <form onSubmit={handleCreateCampaign} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre de la Campaña *</label>
                        <input value={campaignForm.nombre} onChange={e => setCampaignForm(p => ({ ...p, nombre: e.target.value }))} placeholder="ej: 🔥 Semana del Plomero" required className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo</label>
                        <select value={campaignForm.tipo} onChange={e => setCampaignForm(p => ({ ...p, tipo: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]">
                          {['Campaña','Popup','Banner','Anuncio','Noticia'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Público Objetivo</label>
                        <select value={campaignForm.categoria} onChange={e => setCampaignForm(p => ({ ...p, categoria: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]">
                          {['Todos','Clientes','Profesionales','Premium','Por oficio','Por ciudad'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Inicio</label>
                        <input type="date" value={campaignForm.fechaInicio} onChange={e => setCampaignForm(p => ({ ...p, fechaInicio: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Fin</label>
                        <input type="date" value={campaignForm.fechaFin} onChange={e => setCampaignForm(p => ({ ...p, fechaFin: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">URL del Banner / Imagen</label>
                        <input value={campaignForm.banner} onChange={e => setCampaignForm(p => ({ ...p, banner: e.target.value }))} placeholder="https://..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción / Beneficio</label>
                        <textarea rows={2} value={campaignForm.beneficio} onChange={e => setCampaignForm(p => ({ ...p, beneficio: e.target.value }))} placeholder="ej: 20% OFF en trabajos de plomería" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127] resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Texto del Botón</label>
                        <input value={campaignForm.botonTexto} onChange={e => setCampaignForm(p => ({ ...p, botonTexto: e.target.value }))} placeholder="ej: Ver plomeros" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">URL del Botón</label>
                        <input value={campaignForm.botonUrl} onChange={e => setCampaignForm(p => ({ ...p, botonUrl: e.target.value }))} placeholder="/buscar?oficio=plomero" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Crear Campaña
                    </button>
                  </form>
                </div>

                {/* Lista de Campañas */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#00355f]">Campañas Creadas</h3>
                    <span className="text-[10px] font-black bg-[#fc8127]/10 text-[#fc8127] px-2 py-1 rounded-full">{campaigns.filter(c => c.activa).length} activas</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {campaigns.length === 0 ? (
                      <div className="text-center py-16">
                        <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">No hay campañas creadas</p>
                        <p className="text-xs text-gray-400 mt-1">Creá tu primera campaña con el formulario.</p>
                      </div>
                    ) : (
                      campaigns.map(camp => (
                        <div key={camp.id} className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            {camp.banner ? (
                              <img src={camp.banner} alt="banner" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#fc8127] to-[#00355f] flex items-center justify-center shrink-0">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black bg-[#00355f]/10 text-[#00355f] px-2 py-0.5 rounded-full">{camp.tipo}</span>
                                <span className="text-[9px] font-bold text-gray-500">{camp.categoria}</span>
                              </div>
                              <p className="text-xs font-bold text-gray-900">{camp.nombre}</p>
                              {camp.beneficio && <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{camp.beneficio}</p>}
                              {camp.fechaInicio && <p className="text-[9px] text-gray-400 mt-0.5">📅 {camp.fechaInicio} → {camp.fechaFin}</p>}
                            </div>
                          </div>
                          <button onClick={() => setCampaigns(prev => prev.map(c => c.id === camp.id ? { ...c, activa: !c.activa } : c))} className={`shrink-0 p-1 rounded-lg transition-colors ${camp.activa ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {camp.activa ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MODAL: ADMINISTRAR DETALLES DE USUARIO ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#00355f] mb-1">Administrar Usuario</h3>
              <p className="text-xs text-gray-400">Modifica los permisos, estado y suscripción de {selectedUser.name}.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Datos del perfil</p>
                <p className="text-sm font-bold text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                <p className="text-xs font-semibold text-[#fc8127] mt-1">{selectedUser.trade || 'Cliente general'}</p>
              </div>

              {/* Controles de estado */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Estado de cuenta:</span>
                <button 
                  onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                    selectedUser.status === 'Activo' 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedUser.status === 'Activo' ? (
                    <>
                      <UserX className="w-4 h-4" /> Suspender
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> Habilitar
                    </>
                  )}
                </button>
              </div>

              {/* Controles de Plan (Solo profesionales) */}
              {selectedUser.role === 'Profesional' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 block">Cambiar Plan de Suscripción:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Gratis', 'Pro', 'Master'].map(plan => (
                      <button 
                        key={plan}
                        onClick={() => handleChangePlan(selectedUser.id, plan)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                          selectedUser.plan === plan
                            ? 'bg-[#00355f] text-white border-[#00355f] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedUser(null)}
              className="w-full py-3 bg-gray-150 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: VERIFICACIÓN Y COTEJO DE IDENTIDAD / CERTIFICADOS ── */}
      {selectedVerification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedVerification(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#00355f]" />
                <h3 className="text-xl font-bold text-[#00355f]">Cotejo y Asignación de Insignias</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Verifica que los datos del registro coincidan con la documentación subida antes de autorizar las insignias públicas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Columna Izquierda: Datos Registrados por el Profesional */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <span className="block text-xs font-bold text-[#00355f] uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#fc8127]" /> Datos Registrados en Perfil
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">Nombre Completo:</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedVerification.name || selectedVerification.nombre} {selectedVerification.apellido}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">Correo Electrónico:</span>
                    <span className="font-bold text-gray-800">{selectedVerification.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Teléfono / Celular:</span>
                      <span className="font-bold text-gray-800">{selectedVerification.telefono || 'No indicado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Fecha Nacimiento:</span>
                      <span className="font-bold text-gray-800">{selectedVerification.fechaNacimiento || 'No indicada'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Provincia / Cobertura:</span>
                      <span className="font-bold text-gray-800">{selectedVerification.provincia || selectedVerification.location || 'Argentina'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block text-[10px] uppercase">Ciudad:</span>
                      <span className="font-bold text-gray-800">{selectedVerification.ciudad || '-'}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">Oficios Inscriptos:</span>
                    <span className="font-extrabold text-[#00355f]">{selectedVerification.trade || selectedVerification.oficios?.join(', ') || 'General'}</span>
                  </div>

                  <div className="pt-1">
                    <span className="text-gray-400 font-semibold block text-[10px] uppercase">N° Matrícula Declarado:</span>
                    <span className="font-extrabold text-[#fc8127]">{selectedVerification.nroMatricula || selectedVerification.docMatricula || 'Sin Matrícula'}</span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Documentos Subidos */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <span className="block text-xs font-bold text-[#00355f] uppercase tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00355f]" /> Documentación Adjunta Subida
                </span>

                {/* DNI Document */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">1. Documento DNI (Identidad)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedVerification.estadoDNI === 'Validado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedVerification.estadoDNI || 'Pendiente'}
                    </span>
                  </div>

                  {selectedVerification.dniFrontal || selectedVerification.dniDorso ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedVerification.dniFrontal && (
                        <a href={selectedVerification.dniFrontal} target="_blank" rel="noreferrer" className="block border border-gray-300 rounded-xl overflow-hidden h-24 bg-white hover:opacity-90">
                          <img src={selectedVerification.dniFrontal} alt="DNI Frente" className="w-full h-full object-cover" />
                        </a>
                      )}
                      {selectedVerification.dniDorso && (
                        <a href={selectedVerification.dniDorso} target="_blank" rel="noreferrer" className="block border border-gray-300 rounded-xl overflow-hidden h-24 bg-white hover:opacity-90">
                          <img src={selectedVerification.dniDorso} alt="DNI Dorso" className="w-full h-full object-cover" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-white border border-dashed border-gray-300 rounded-xl text-center">
                      <p className="text-xs text-gray-400">DNI subido / pendiente de verificación visual.</p>
                    </div>
                  )}

                  <button 
                    onClick={() => handleApproveDNI(selectedVerification.id)}
                    disabled={selectedVerification.estadoDNI === 'Validado'}
                    className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> 
                    {selectedVerification.estadoDNI === 'Validado' ? 'Identidad DNI Ya Validada' : 'Otorgar Insignia "Identidad Verificada"'}
                  </button>
                </div>

                {/* Certificados / Matrícula */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">2. Certificados & Matrícula</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedVerification.matriculadoVerificado ? 'bg-orange-100 text-[#fc8127]' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {selectedVerification.matriculadoVerificado ? 'Matriculado Aprobado' : 'Pendiente'}
                    </span>
                  </div>

                  {selectedVerification.certificados && selectedVerification.certificados.length > 0 ? (
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {selectedVerification.certificados.map((cert: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg text-xs">
                          <span className="truncate font-bold text-gray-700 pr-2">{cert.nombre || `Certificado ${idx + 1}`}</span>
                          {cert.archivoBase64 && (
                            <a href={cert.archivoBase64} target="_blank" rel="noreferrer" className="text-[#00355f] font-bold hover:underline shrink-0">
                              Ver Documento
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No hay certificados adjuntos en la cuenta.</p>
                  )}

                  <button 
                    onClick={() => handleApproveCertificates(selectedVerification.id)}
                    disabled={selectedVerification.matriculadoVerificado}
                    className="w-full py-2 px-3 bg-[#fc8127] hover:bg-[#e67320] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Award className="w-4 h-4" /> 
                    {selectedVerification.matriculadoVerificado ? 'Matrícula Ya Aprobada' : 'Otorgar Insignia "Matriculado / Certificado"'}
                  </button>
                </div>

              </div>

            </div>

            {/* Pie del modal de verificaciones */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button 
                onClick={() => handleRejectVerification(selectedVerification.id)}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
              >
                Rechazar Solicitud
              </button>

              <button 
                onClick={() => setSelectedVerification(null)}
                className="px-6 py-2.5 bg-[#00355f] text-white rounded-xl text-xs font-bold hover:bg-[#0f4c81] transition-colors"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Aux icon
function WrenchIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}