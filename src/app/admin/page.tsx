"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BarChart3, Send, MessageSquare, Check, Trash2,
  Settings, LogOut, Search, Filter, ShieldCheck, CheckCircle2,
  TrendingUp, AlertCircle, Crown, Info, RefreshCw, X, ShieldAlert,
  Edit2, Eye, Shield, UserX, UserCheck
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
  const [activeTab, setActiveTab] = useState<'resumen' | 'usuarios' | 'verificaciones' | 'trabajos' | 'marketing' | 'soporte'>('resumen');

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

    // 2. Load tickets from soporte
    const loadTickets = async () => {
      try {
        const allTickets = await dbHelper.getTickets();
        setTickets(allTickets);
      } catch (err) {
        console.error("Error al cargar tickets:", err);
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

    // 5. Load announcements
    const storedAnnouncements = localStorage.getItem('oficiosya_global_notifications');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    }
  }, []);

  // Update lists
  const saveUsers = async (updatedList: any[]) => {
    setUsers(updatedList);
    localStorage.setItem('oficiosya_admin_users', JSON.stringify(updatedList));
  };

  const saveTickets = (updatedList: any[]) => {
    setTickets(updatedList);
    localStorage.setItem('oficiosya_tickets', JSON.stringify(updatedList));
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

  // Verification actions
  const handleApproveVerification = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, verificacion: 'Verificado' } : u);
    saveUsers(updated);
    setSelectedVerification(null);

    const targetUser = updated.find(u => u.id === id);
    if (targetUser && targetUser.email === 'roberto@gmail.com') {
      const storedProfile = localStorage.getItem('oficiosya_profesional_perfil');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        parsed.estadoDNI = 'Validado';
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(parsed));
      }
    }

    try {
      await dbHelper.updateUserVerification(id, true, 'Validado');
    } catch (e) {
      console.error("Error al validar verificación en BD:", e);
    }
  };

  const handleRejectVerification = async (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, verificacion: 'Rechazado' } : u);
    saveUsers(updated);
    setSelectedVerification(null);

    const targetUser = updated.find(u => u.id === id);
    if (targetUser && targetUser.email === 'roberto@gmail.com') {
      const storedProfile = localStorage.getItem('oficiosya_profesional_perfil');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        parsed.estadoDNI = 'Pendiente';
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(parsed));
      }
    }

    try {
      await dbHelper.updateUserVerification(id, false, 'Pendiente');
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

  // Marketing submit
  const handleSendMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketingTitle || !marketingBody) return;

    const newAnnouncement = {
      id: Date.now().toString(),
      titulo: marketingTitle,
      mensaje: marketingBody,
      destinatarios: marketingTarget,
      fecha: new Date().toLocaleDateString('es-AR'),
      tipo: 'Promo'
    };

    // Save in global notifications
    const storedAnnouncements = JSON.parse(localStorage.getItem('oficiosya_global_notifications') || '[]');
    storedAnnouncements.unshift(newAnnouncement);
    localStorage.setItem('oficiosya_global_notifications', JSON.stringify(storedAnnouncements));
    setAnnouncements(storedAnnouncements);

    setMarketingSuccess(true);
    setMarketingTitle('');
    setMarketingBody('');
    setTimeout(() => setMarketingSuccess(false), 3000);
  };

  // Support ticket actions
  const handleResolveTicket = (id: string) => {
    const updated = tickets.map(t => t.id === id ? { ...t, estado: 'Resuelto' } : t);
    saveTickets(updated);
  };

  const handleSendReply = (id: string) => {
    if (!replyText.trim()) return;
    const updated = tickets.map(t => t.id === id ? { ...t, estado: 'Resuelto', respuesta: replyText } : t);
    saveTickets(updated);
    setReplyingTicketId(null);
    setReplyText('');
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-[#0f4c81] selection:text-white">
      
      {/* Sidebar Admin */}
      <aside className="w-64 bg-[#00355f] text-white hidden md:flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-6 border-b border-white/10 flex flex-col gap-3">
          <Logo theme="dark" size="md" />
          <span className="text-[10px] w-fit font-bold bg-[#fc8127] text-white px-2 py-0.5 rounded uppercase tracking-wider">
            Super Administrador
          </span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <button 
            onClick={() => setActiveTab('resumen')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'resumen' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <BarChart3 className="w-5 h-5" /> Resumen General
          </button>
          
          <button 
            onClick={() => setActiveTab('usuarios')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'usuarios' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" /> Gestión de Usuarios
          </button>

          <button 
            onClick={() => setActiveTab('verificaciones')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'verificaciones' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> Verificaciones
            </div>
            {pendingVerificationsCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingVerificationsCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('trabajos')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'trabajos' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" /> Moderar Trabajos
            </div>
            {jobs.filter(j => j.reportes > 0).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {jobs.filter(j => j.reportes > 0).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('marketing')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'marketing' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <Send className="w-5 h-5" /> Campañas de Marketing
          </button>

          <button 
            onClick={() => setActiveTab('soporte')} 
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'soporte' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" /> Buzón de Soporte
            </div>
            {tickets.filter(t => t.estado === 'Pendiente').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.estado === 'Pendiente').length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={handlePurgeAllData}
            disabled={clearing}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> {clearing ? 'Borrando...' : 'Vaciar DB (Plataforma en 0)'}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition-colors text-sm font-bold">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Admin */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-xl font-extrabold text-[#00355f] capitalize">
            {activeTab === 'trabajos' ? 'Moderación de Solicitudes' : activeTab === 'usuarios' ? 'Gestión de Usuarios' : activeTab}
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
                          onClick={() => handleApproveVerification(user.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Aprobar profesional
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
                      <CheckCircle2 className="w-4 h-4" /> ¡Notificación masiva inyectada con éxito!
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
                      className="w-full py-3.5 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Send className="w-4 h-4" /> Enviar Notificación Masiva
                    </button>
                  </form>
                </div>

                {/* Historial */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#00355f]">Historial de Campañas</h3>
                  <div className="divide-y divide-gray-100 space-y-3 max-h-[450px] overflow-y-auto">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No se han realizado campañas masivas.</p>
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="pt-3 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold bg-[#fc8127]/10 text-[#fc8127] px-2 py-0.5 rounded-full">{ann.destinatarios}</span>
                            <span className="text-[9px] text-gray-400 font-bold">{ann.fecha}</span>
                          </div>
                          <p className="text-xs font-extrabold text-gray-900 mt-1">{ann.titulo}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{ann.mensaje}</p>
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
                  onClick={() => {
                    const localData = localStorage.getItem('oficiosya_tickets');
                    if (localData) setTickets(JSON.parse(localData));
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

    </div>
  );
}

// Aux icon
function WrenchIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}