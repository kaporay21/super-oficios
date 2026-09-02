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
  ToggleLeft, ToggleRight, ChevronRight, Lightbulb, Sparkles, Gift, Coins
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
    setClearing(true);
    try {
      const resultado = await dbHelper.cleanAllData();
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: 'Vació TODOS los datos de la plataforma',
        riesgo: 'Alto',
      });
      // Antes esto siempre decía "se borró todo correctamente" aunque
      // cleanAllData() hubiera devuelto errores por tabla -- quedaban
      // ocultos en la consola, invisibles para el admin.
      if (resultado.errors.length > 0) {
        alert(`⚠️ Se vació la mayoría de los datos, pero ${resultado.errors.length} tabla(s) tuvieron errores:\n\n${resultado.errors.join('\n')}`);
      } else {
        alert('✅ Se borraron todos los datos correctamente. La plataforma quedó en cero.');
      }
      window.location.reload();
    } catch (err) {
      console.error('Error al vaciar BD:', err);
      alert('Ocurrió un error al vaciar los datos.');
    } finally {
      setClearing(false);
      setShowPurgeModal(false);
      setPurgeConfirmText('');
    }
  };
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'analiticas' | 'usuarios' | 'verificaciones' | 'trabajos' |
    'marketing' | 'soporte' | 'seguridad' | 'financiero' | 'configuracion' |
    'feedback' | 'campanas' | 'disputas' | 'premios'
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
  const [reportesUsuarios, setReportesUsuarios] = useState<any[]>([]);
  const [oficios, setOficios] = useState<any[]>([]);
  const [nuevoOficio, setNuevoOficio] = useState('');
  const [guardandoOficio, setGuardandoOficio] = useState(false);
  const [reglasPuntos, setReglasPuntos] = useState<any[]>([]);
  const [reglasPuntosEdit, setReglasPuntosEdit] = useState<Record<string, string>>({});
  const [guardandoReglas, setGuardandoReglas] = useState(false);

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

  // Premios (tienda de canje) state
  const [premios, setPremios] = useState<any[]>([]);
  const [canjesAdmin, setCanjesAdmin] = useState<any[]>([]);
  const [premioForm, setPremioForm] = useState({ nombre: '', descripcion: '', costoPuntos: '', imagenUrl: '', stock: '' });

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Centro de Disputas
  const [disputas, setDisputas] = useState<any[]>([]);
  const [resolvingDisputaId, setResolvingDisputaId] = useState<string | null>(null);
  const [disputaResolucionTexto, setDisputaResolucionTexto] = useState('');
  const [disputaResolucionEstado, setDisputaResolucionEstado] = useState('acuerdo');

  // Suspender cuenta (requiere motivo)
  const [suspendReasonFor, setSuspendReasonFor] = useState<string | null>(null);
  const [suspendReasonText, setSuspendReasonText] = useState('');

  // Eliminar cuenta puntual (requiere motivo + escribir el nombre)
  const [showDeleteAccountForm, setShowDeleteAccountForm] = useState(false);
  const [deleteAccountReason, setDeleteAccountReason] = useState('');
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Eliminar trabajo (requiere motivo)
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [deleteJobReason, setDeleteJobReason] = useState('');

  // Vaciar DB (requiere escribir frase de confirmación)
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

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
          usuarioId: t.usuario_id || null,
          profesionalId: t.profesional_id || null,
          profesionalNombre: t.profesional?.nombre || '',
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

    // 5. Historial real de campañas masivas (antes vivía solo en useState y
    // se vaciaba en cada recarga, aunque el envío en sí ya funcionaba).
    const loadAnnouncements = async () => {
      try {
        const data = await dbHelper.getCampanasMasivasHistorial();
        setAnnouncements(data.map((c: any) => ({
          id: c.id,
          titulo: c.titulo,
          mensaje: c.mensaje,
          destinatarios: c.destinatarios,
          fecha: new Date(c.created_at).toLocaleDateString('es-AR'),
          enviados: c.enviados,
        })));
      } catch (err) {
        console.error('Error al cargar historial de campañas:', err);
      }
    };
    loadAnnouncements();

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

    // 6b. Load reportes de usuarios (tabla real reportes, cliente<->profesional)
    const loadReportesUsuarios = async () => {
      try {
        const data = await dbHelper.getReportes();
        setReportesUsuarios(data);
      } catch (err) {
        console.error('Error al cargar reportes de usuarios:', err);
      }
    };
    loadReportesUsuarios();

    // 6c. Load campañas/banners (antes vivían solo en estado local)
    const loadCampanas = async () => {
      try {
        const data = await dbHelper.getCampanasAdmin();
        setCampaigns(data);
      } catch (err) {
        console.error('Error al cargar campañas:', err);
      }
    };
    loadCampanas();

    // 6d. Load premios de la tienda de canje + canjes pendientes
    const loadPremios = async () => {
      try {
        const [premiosData, canjesData] = await Promise.all([
          dbHelper.getPremiosAdmin(),
          dbHelper.getCanjesAdmin(),
        ]);
        setPremios(premiosData);
        setCanjesAdmin(canjesData);
      } catch (err) {
        console.error('Error al cargar premios:', err);
      }
    };
    loadPremios();

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

    // 9. Load disputas (Centro de Resolución cliente <-> profesional)
    const loadDisputas = async () => {
      try {
        const data = await dbHelper.getDisputasAdmin();
        setDisputas(data);
      } catch (err) {
        console.error('Error al cargar disputas:', err);
      }
    };
    loadDisputas();

    // 10. Gestión de Oficios y Reglas de Puntos (antes eran listas
    // hardcodeadas en el componente, sin tabla ni botones conectados).
    const loadOficios = async () => {
      try {
        setOficios(await dbHelper.getOficiosAdmin());
      } catch (err) {
        console.error('Error al cargar oficios:', err);
      }
    };
    loadOficios();

    const loadReglasPuntos = async () => {
      try {
        const data = await dbHelper.getReglasPuntosAdmin();
        setReglasPuntos(data);
        setReglasPuntosEdit(Object.fromEntries(data.map((r: any) => [r.clave, String(r.puntos)])));
      } catch (err) {
        console.error('Error al cargar reglas de puntos:', err);
      }
    };
    loadReglasPuntos();
  }, []);

  const handleAgregarOficio = async () => {
    const nombre = nuevoOficio.trim();
    if (!nombre) return;
    if (oficios.some(o => o.nombre.toLowerCase() === nombre.toLowerCase())) {
      alert('Ese oficio ya existe.');
      return;
    }
    setGuardandoOficio(true);
    try {
      const creado = await dbHelper.crearOficioAdmin(nombre);
      setOficios(prev => [...prev, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNuevoOficio('');
    } catch (err: any) {
      alert('No se pudo agregar el oficio: ' + (err?.message || err));
    } finally {
      setGuardandoOficio(false);
    }
  };

  const handleEliminarOficio = async (id: string) => {
    const anterior = oficios;
    setOficios(prev => prev.filter(o => o.id !== id));
    try {
      await dbHelper.eliminarOficioAdmin(id);
    } catch (err: any) {
      setOficios(anterior);
      alert('No se pudo eliminar el oficio: ' + (err?.message || err));
    }
  };

  const handleGuardarReglasPuntos = async () => {
    setGuardandoReglas(true);
    try {
      const cambios = reglasPuntos.filter(r => Number(reglasPuntosEdit[r.clave]) !== r.puntos);
      await Promise.all(cambios.map(r => dbHelper.actualizarReglaPuntoAdmin(r.clave, Number(reglasPuntosEdit[r.clave]))));
      setReglasPuntos(prev => prev.map(r => ({ ...r, puntos: Number(reglasPuntosEdit[r.clave]) })));
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Actualizó las reglas de puntos (${cambios.length} cambio(s))`,
        riesgo: 'Bajo',
      });
      alert('Reglas de puntos guardadas.');
    } catch (err: any) {
      alert('No se pudieron guardar las reglas: ' + (err?.message || err));
    } finally {
      setGuardandoReglas(false);
    }
  };

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
  const handleToggleStatus = async (id: string, currentStatus: string, motivo?: string) => {
    const nextStatus = currentStatus === 'Activo' ? 'Suspendido' : 'Activo';
    const updated = users.map(u => u.id === id ? { ...u, status: nextStatus, motivoEstado: motivo || '' } : u);
    saveUsers(updated);
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, status: nextStatus, motivoEstado: motivo || '' });
    }

    try {
      await dbHelper.updateUserStatus(id, nextStatus, motivo);
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `${nextStatus === 'Suspendido' ? 'Suspendió' : 'Reactivó'} la cuenta de ${updated.find(u => u.id === id)?.email || id}${motivo ? ` — Motivo: ${motivo}` : ''}`,
        riesgo: nextStatus === 'Suspendido' ? 'Alto' : 'Medio',
      });
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

    try {
      await dbHelper.updateUserPlan(id, newPlan);
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Cambió el plan de ${updated.find(u => u.id === id)?.email || id} a "${newPlan}"`,
        riesgo: 'Bajo',
      });
    } catch (e) {
      console.error("Error al actualizar plan en BD:", e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedUser || !deleteAccountReason.trim()) return;
    if (deleteAccountConfirmText.trim().toLowerCase() !== (selectedUser.name || '').trim().toLowerCase()) return;
    setDeletingAccount(true);
    try {
      await dbHelper.deleteUserAccount(selectedUser.id, deleteAccountReason.trim());
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Eliminó permanentemente la cuenta de ${selectedUser.email} — Motivo: ${deleteAccountReason.trim()}`,
        riesgo: 'Alto',
      });
      setUsers(prev => prev.map(u => u.id === selectedUser.id
        ? { ...u, status: 'Eliminado', name: 'Usuario eliminado', email: `eliminado-${u.id}@oficiosya.local`, motivoEstado: deleteAccountReason.trim() }
        : u));
      setSelectedUser(null);
      setShowDeleteAccountForm(false);
      setDeleteAccountReason('');
      setDeleteAccountConfirmText('');
    } catch (e) {
      console.error('Error al eliminar cuenta:', e);
      alert('Ocurrió un error al eliminar la cuenta.');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Abre el modal de cotejo y trae las URLs firmadas del DNI (bucket privado,
  // no tiene URL pública) -- antes el modal no mostraba nada porque el DNI
  // nunca se había subido a Supabase en primer lugar.
  const abrirVerificacion = async (verifUser: any) => {
    setSelectedVerification(verifUser);
    if (!verifUser.dniFrontalPath && !verifUser.dniDorsoPath) return;
    try {
      const urls = await dbHelper.getDniSignedUrls(verifUser.dniFrontalPath, verifUser.dniDorsoPath);
      setSelectedVerification((prev: any) => (prev && prev.id === verifUser.id) ? { ...prev, dniFrontal: urls.frontal, dniDorso: urls.dorso } : prev);
    } catch (e) {
      console.warn('Error al obtener URLs firmadas del DNI:', e);
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
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Aprobó la verificación de DNI de ${updated.find(u => u.id === id)?.email || id}`,
        riesgo: 'Bajo',
      });
      await dbHelper.registrarPuntos(id, 'verificacion_dni', 100, 'Tu identidad fue verificada');
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
      // No tocamos "verificado" (identidad) acá -- aprobar el certificado
      // no implica que el DNI también esté validado, son dos cosas
      // distintas y cada una tiene su propio botón.
      await dbHelper.updateUserVerification(id, undefined, undefined, true, 'Validado');
      // Notificar al profesional que sus certificados fueron aprobados
      await dbHelper.crearNotificacion({
        usuario_id: id,
        tipo: 'sistema',
        titulo: '🏆 Certificados Aprobados',
        descripcion: '¡Tu expediente y certificados fueron aprobados! Ya contás con el sello de Profesional Matriculado / Certificado en tu perfil.',
      });
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Aprobó certificados/matrícula de ${updated.find(u => u.id === id)?.email || id}`,
        riesgo: 'Bajo',
      });
      await dbHelper.registrarPuntos(id, 'verificacion_matricula', 50, 'Tu matrícula fue aprobada');
      alert('🏆 Insignia de Profesional Matriculado / Certificado otorgada con éxito.');
    } catch (e) {
      console.error("Error al validar certificados en BD:", e);
    }
  };

  const handleRejectVerification = async (id: string) => {
    // Antes esto guardaba estadoDNI/estadoCertificados como 'Pendiente' --
    // como `verificacion` se deriva de esos mismos campos, un rechazo
    // quedaba indistinguible de "nunca pidió nada" y la solicitud volvía a
    // aparecer en la cola con cada recarga, como si el rechazo nunca
    // hubiera pasado. 'Rechazado' es un estado real y distinto: solo
    // vuelve a la cola cuando el profesional reenvía documentación nueva
    // (subirDNI / subida de certificado lo mueven a 'En Revisión').
    const updated = users.map(u => u.id === id ? { ...u, verificacion: 'Rechazado', estadoDNI: 'Rechazado', matriculadoVerificado: false, estadoCertificados: 'Rechazado' } : u);
    saveUsers(updated);
    setSelectedVerification(null);

    try {
      await dbHelper.updateUserVerification(id, false, 'Rechazado', false, 'Rechazado');
      await dbHelper.crearNotificacion({
        usuario_id: id,
        tipo: 'sistema',
        titulo: 'Verificación rechazada',
        descripcion: 'Tu solicitud de verificación fue rechazada. Revisá que el DNI y los certificados sean legibles y volvé a intentarlo, o contactanos desde Soporte.',
      });
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Rechazó la verificación de ${id}`,
        riesgo: 'Medio',
      });
      alert('Solicitud rechazada.');
    } catch (e) {
      console.error("Error al rechazar verificación en BD:", e);
    }
  };

  // Moderation actions — pide motivo y notifica al dueño del trabajo antes de borrar
  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete || !deleteJobReason.trim()) return;
    const job = jobToDelete;
    const updated = jobs.filter(j => j.id !== job.id);
    saveJobs(updated);
    setJobToDelete(null);

    try {
      await dbHelper.deleteJob(job.id);
      if (job.cliente_id) {
        await dbHelper.crearNotificacion({
          usuario_id: job.cliente_id,
          tipo: 'sistema',
          titulo: '🗑️ Tu publicación fue eliminada',
          descripcion: `"${job.titulo}" fue eliminada por un administrador. Motivo: ${deleteJobReason.trim()}`,
        });
      }
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Eliminó el trabajo "${job.titulo}" (#${job.id}) — Motivo: ${deleteJobReason.trim()}`,
        riesgo: 'Medio',
      });
    } catch (e) {
      console.error("Error al eliminar trabajo en BD:", e);
    } finally {
      setDeleteJobReason('');
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

      // Persistimos el envío para que el historial sobreviva a un refresh
      // (antes solo quedaba en useState y se perdía).
      const guardada = await dbHelper.registrarCampanaMasiva({
        titulo: marketingTitle,
        mensaje: marketingBody,
        destinatarios: marketingTarget,
        enviados: targetUsers.length,
        adminEmail: user?.email,
      });
      setAnnouncements(prev => [{
        id: guardada.id,
        titulo: guardada.titulo,
        mensaje: guardada.mensaje,
        destinatarios: guardada.destinatarios,
        fecha: new Date(guardada.created_at).toLocaleDateString('es-AR'),
        enviados: guardada.enviados,
      }, ...prev]);

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
  const handleResolveTicket = async (id: string) => {
    // Antes esto solo tocaba el estado local -- ningún cambio llegaba a
    // Supabase, así que el ticket volvía a aparecer como "Pendiente" en
    // cada recarga (mismo patrón que el bug de aprobar/rechazar DNI).
    const updated = tickets.map(t => t.id === id ? { ...t, estado: 'Resuelto' } : t);
    saveTickets(updated);
    try {
      await dbHelper.responderTicketAdmin(id, '', 'Resuelto');
    } catch (e) {
      console.error('Error al resolver ticket en BD:', e);
    }
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

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('¿Deseas eliminar este ticket de la lista de administración?')) return;
    const updated = tickets.filter(t => t.id !== id);
    saveTickets(updated);
    try {
      await dbHelper.deleteTicketAdmin(id);
    } catch (e) {
      console.error('Error al eliminar ticket en BD:', e);
    }
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

  const [escalandoTicketId, setEscalandoTicketId] = useState<string | null>(null);
  const handleEscalarADisputa = async (ticketId: string) => {
    setEscalandoTicketId(ticketId);
    try {
      await dbHelper.escalarTicketADisputa(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, estado: 'Escalado' } : t));
      const disputasActualizadas = await dbHelper.getDisputasAdmin();
      setDisputas(disputasActualizadas);
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Escaló el ticket #${ticketId.slice(0, 6)} a una disputa`,
        riesgo: 'Medio',
      });
      setActiveTab('disputas');
    } catch (e: any) {
      console.error('Error al escalar ticket:', e);
      alert(e?.message || 'No se pudo escalar este ticket a disputa.');
    } finally {
      setEscalandoTicketId(null);
    }
  };

  const handleActualizarReporte = async (id: string, nuevoEstado: string) => {
    try {
      await dbHelper.updateReporteEstado(id, nuevoEstado);
      setReportesUsuarios(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Marcó el reporte #${id.slice(0, 6)} como "${nuevoEstado}"`,
        riesgo: 'Medio',
      });
    } catch (e) {
      console.error('Error al actualizar reporte:', e);
    }
  };

  // Centro de Disputas
  const handleResolveDisputa = async (id: string) => {
    if (!disputaResolucionTexto.trim()) return;
    try {
      await dbHelper.resolverDisputaAdmin(id, disputaResolucionTexto.trim(), disputaResolucionEstado);
      setDisputas(prev => prev.map(d => d.id === id ? { ...d, estado: disputaResolucionEstado, resolucion_admin: disputaResolucionTexto.trim() } : d));
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Resolvió la disputa #${id.slice(0, 8)} como "${disputaResolucionEstado}"`,
        riesgo: 'Medio',
      });
      setResolvingDisputaId(null);
      setDisputaResolucionTexto('');
    } catch (e) {
      console.error('Error al resolver disputa:', e);
      alert('Ocurrió un error al resolver la disputa.');
    }
  };

  // Campaign actions
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.nombre) return;
    try {
      const nueva = await dbHelper.createCampanaAdmin({
        nombre: campaignForm.nombre,
        tipo: campaignForm.tipo,
        categoria: campaignForm.categoria,
        beneficio: campaignForm.beneficio,
        banner_url: campaignForm.banner,
        boton_texto: campaignForm.botonTexto,
        boton_url: campaignForm.botonUrl,
        fecha_inicio: campaignForm.fechaInicio || undefined,
        fecha_fin: campaignForm.fechaFin || undefined,
      });
      setCampaigns(prev => [nueva, ...prev]);
      setCampaignForm({ nombre: '', banner: '', fechaInicio: '', fechaFin: '', categoria: 'Todos', beneficio: '', botonTexto: '', botonUrl: '', tipo: 'Campaña', activa: true });
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Creó la campaña "${campaignForm.nombre}"`,
        riesgo: 'Bajo',
      });
    } catch (err) {
      console.error('Error al crear campaña:', err);
      alert('Ocurrió un error al crear la campaña.');
    }
  };

  const handleToggleCampana = async (id: string, activaActual: boolean) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, activa: !activaActual } : c));
    try {
      await dbHelper.toggleCampanaActiva(id, !activaActual);
    } catch (err) {
      console.error('Error al cambiar estado de campaña:', err);
    }
  };

  // Premios (tienda de canje) actions
  const handleCreatePremio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premioForm.nombre || !premioForm.costoPuntos) return;
    try {
      const nuevo = await dbHelper.createPremioAdmin({
        nombre: premioForm.nombre,
        descripcion: premioForm.descripcion,
        costoPuntos: Number(premioForm.costoPuntos),
        imagenUrl: premioForm.imagenUrl,
        stock: premioForm.stock ? Number(premioForm.stock) : null,
      });
      setPremios(prev => [nuevo, ...prev]);
      setPremioForm({ nombre: '', descripcion: '', costoPuntos: '', imagenUrl: '', stock: '' });
      await dbHelper.registrarAuditoria({
        admin_email: user?.email || 'admin',
        accion: `Creó el premio "${premioForm.nombre}"`,
        riesgo: 'Bajo',
      });
    } catch (err) {
      console.error('Error al crear premio:', err);
      alert('Ocurrió un error al crear el premio.');
    }
  };

  const handleTogglePremio = async (id: string, activoActual: boolean) => {
    setPremios(prev => prev.map(p => p.id === id ? { ...p, activo: !activoActual } : p));
    try {
      await dbHelper.togglePremioActivo(id, !activoActual);
    } catch (err) {
      console.error('Error al cambiar estado de premio:', err);
    }
  };

  const handleMarcarEntregado = async (id: string) => {
    setCanjesAdmin(prev => prev.map(c => c.id === id ? { ...c, estado: 'entregado' } : c));
    try {
      await dbHelper.marcarCanjeEntregado(id);
    } catch (err) {
      console.error('Error al marcar canje entregado:', err);
    }
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

          <button onClick={() => setActiveTab('disputas')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'disputas' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><ShieldAlert className="w-4 h-4 shrink-0" /> Centro de Disputas</div>
            {disputas.filter(d => d.estado === 'escalado_admin').length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{disputas.filter(d => d.estado === 'escalado_admin').length}</span>}
          </button>

          <button onClick={() => setActiveTab('seguridad')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'seguridad' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><Shield className="w-4 h-4 shrink-0" /> Centro de Seguridad</div>
            {denuncias.filter(d => d.estado === 'Recibida').length > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{denuncias.filter(d => d.estado === 'Recibida').length}</span>}
          </button>

          <button onClick={() => setActiveTab('financiero')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'financiero' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Wallet className="w-4 h-4 shrink-0" /> Finanzas y Planes
          </button>

          <button onClick={() => setActiveTab('premios')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'premios' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <div className="flex items-center gap-3"><Gift className="w-4 h-4 shrink-0" /> Tienda de Canje</div>
            {canjesAdmin.filter(c => c.estado === 'pendiente').length > 0 && <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{canjesAdmin.filter(c => c.estado === 'pendiente').length}</span>}
          </button>

          <button onClick={() => setActiveTab('configuracion')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'configuracion' ? 'bg-[#fc8127] text-white shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
            <Sliders className="w-4 h-4 shrink-0" /> Ajustes y Reglas
          </button>

        </nav>

        {/* Footer del sidebar */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <button onClick={() => setShowPurgeModal(true)} disabled={clearing} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors">
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
           activeTab === 'disputas' ? 'Centro de Disputas ⚖️' :
           activeTab === 'seguridad' ? 'Centro de Seguridad y Denuncias' :
           activeTab === 'financiero' ? 'Panel Financiero y Suscripciones' :
           activeTab === 'configuracion' ? 'Configuración Global de la App' :
           activeTab === 'feedback' ? 'Centro de Feedback ⭐' :
           activeTab === 'campanas' ? 'Campañas y Banners ✨' :
           activeTab === 'premios' ? 'Tienda de Canje 🎁' :
           activeTab === 'marketing' ? 'Notificaciones Masivas 📢' :
           activeTab === 'soporte' ? 'Buzón de Soporte 💬' :
           activeTab === 'verificaciones' ? 'Verificaciones de Identidad' :
           activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPurgeModal(true)}
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
                          <button onClick={() => { setActiveTab('verificaciones'); abrirVerificacion(user); }} className="text-xs bg-[#00355f] text-white font-bold px-3 py-1.5 rounded-xl">Validar</button>
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
                        <option value="Eliminado">Eliminados</option>
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
                          onClick={() => abrirVerificacion(user)}
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
                            onClick={() => setJobToDelete(job)}
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
                                  onClick={() => setJobToDelete(job)}
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
                      <p className="text-xs text-gray-400 py-4 text-center">Todavía no se envió ninguna campaña.</p>
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
                          {ticket.profesionalNombre && (
                            <span className="inline-block mt-1.5 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              ⚖️ Sobre: {ticket.profesionalNombre}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{ticket.fecha}</span>
                      </div>

                      <p className="text-sm text-gray-700 bg-white/70 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                        {ticket.mensaje}
                      </p>

                      {ticket.profesionalId && ticket.estado !== 'Escalado' && (
                        <button
                          onClick={() => handleEscalarADisputa(ticket.id)}
                          disabled={escalandoTicketId === ticket.id}
                          className="mt-3 text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {escalandoTicketId === ticket.id ? 'Escalando...' : 'Escalar a disputa'}
                        </button>
                      )}
                      {ticket.estado === 'Escalado' && (
                        <button onClick={() => setActiveTab('disputas')} className="mt-3 text-xs text-amber-700 font-bold hover:underline">
                          Ya escalado — ver en Centro de Disputas →
                        </button>
                      )}

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

          {/* TAB: CENTRO DE DISPUTAS (Centro de Resolución cliente <-> profesional) */}
          {activeTab === 'disputas' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl border bg-red-50 border-red-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><ShieldAlert className="w-6 h-6 text-red-500" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Esperando intervención</p>
                    <p className="text-2xl font-black text-gray-900">{disputas.filter(d => d.estado === 'escalado_admin').length}</p>
                  </div>
                </div>
                <div className="p-5 rounded-3xl border bg-yellow-50 border-yellow-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Clock className="w-6 h-6 text-yellow-500" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">En proceso (entre partes)</p>
                    <p className="text-2xl font-black text-gray-900">{disputas.filter(d => d.estado === 'en_proceso').length}</p>
                  </div>
                </div>
                <div className="p-5 rounded-3xl border bg-green-50 border-green-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Resueltas</p>
                    <p className="text-2xl font-black text-gray-900">{disputas.filter(d => d.estado?.startsWith('resuelto') || d.estado === 'acuerdo' || d.estado === 'rechazado').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-[#00355f]">Mediaciones y Reclamos</h3>
                  <p className="text-xs text-gray-500">Casos abiertos por clientes desde "Centro de Resolución" en su perfil. Los marcados "Intervención OficiosYa" pidieron explícitamente que decida un admin.</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {disputas.length === 0 ? (
                    <div className="text-center py-16">
                      <ShieldAlert className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">Sin disputas activas</p>
                      <p className="text-xs text-gray-400 mt-1">Cuando un cliente abra una mediación aparecerá acá.</p>
                    </div>
                  ) : (
                    disputas.map(d => (
                      <div key={d.id} className="p-5 space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                d.estado === 'escalado_admin' ? 'bg-red-100 text-red-700 animate-pulse' :
                                d.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' :
                                d.estado === 'rechazado' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
                              }`}>{d.estado?.replace('_', ' ') || 'en proceso'}</span>
                              <span className="text-[10px] font-bold text-gray-500">{d.tipo_solucion}</span>
                              {d.monto_reclamado ? <span className="text-[10px] font-black text-[#fc8127]">${Number(d.monto_reclamado).toLocaleString()}</span> : null}
                              <span className="text-[10px] text-gray-400">{d.created_at ? new Date(d.created_at).toLocaleDateString('es-AR') : ''}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              {d.cliente?.nombre || 'Cliente'} <span className="text-gray-400 font-normal">vs.</span> {d.profesional?.nombre || 'Profesional'}
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">{d.descripcion}</p>
                            {d.descripcion_profesional ? (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl max-w-2xl">
                                <p className="text-xs font-bold text-blue-800">Versión del profesional:</p>
                                <p className="text-xs text-gray-600 mt-1 italic">"{d.descripcion_profesional}"</p>
                              </div>
                            ) : !d.resolucion_admin && (
                              <p className="text-[11px] text-gray-400 italic mt-1">El profesional todavía no dio su versión.</p>
                            )}
                            {d.resolucion_admin && (
                              <div className="mt-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                                <p className="text-xs font-bold text-green-800">Resolución:</p>
                                <p className="text-xs text-gray-600 mt-1 italic">"{d.resolucion_admin}"</p>
                              </div>
                            )}
                          </div>
                          {!d.resolucion_admin && (
                            <button
                              onClick={() => { setResolvingDisputaId(resolvingDisputaId === d.id ? null : d.id); setDisputaResolucionTexto(''); }}
                              className="text-xs bg-[#00355f] text-white font-bold px-3.5 py-2 rounded-xl hover:bg-[#0f4c81] transition-colors shrink-0"
                            >
                              {resolvingDisputaId === d.id ? 'Cancelar' : 'Resolver caso'}
                            </button>
                          )}
                        </div>

                        {resolvingDisputaId === d.id && (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                            <select
                              value={disputaResolucionEstado}
                              onChange={e => setDisputaResolucionEstado(e.target.value)}
                              className="w-full sm:w-64 p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                            >
                              <option value="acuerdo">Acuerdo entre las partes</option>
                              <option value="resuelto_cliente">A favor del cliente</option>
                              <option value="resuelto_profesional">A favor del profesional</option>
                              <option value="rechazado">Reclamo rechazado</option>
                            </select>
                            <textarea
                              rows={3}
                              value={disputaResolucionTexto}
                              onChange={e => setDisputaResolucionTexto(e.target.value)}
                              placeholder="Explicá la resolución — se les notifica textualmente a ambas partes."
                              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-[#00355f] focus:outline-none bg-white"
                            />
                            <button
                              onClick={() => handleResolveDisputa(d.id)}
                              disabled={!disputaResolucionTexto.trim()}
                              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-colors"
                            >
                              Confirmar resolución y notificar
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
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

              {/* Reportes de Usuarios (tabla real "reportes", distinta de las denuncias de Soporte) */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Reportes de Usuarios</h3>
                    <p className="text-xs text-gray-500">Reportes bidireccionales enviados desde el chat (cliente ↔ profesional).</p>
                  </div>
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
                    {reportesUsuarios.length} total
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {reportesUsuarios.length === 0 ? (
                    <div className="text-center py-16">
                      <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">Sin reportes activos</p>
                      <p className="text-xs text-gray-400 mt-1">Nadie reportó a otro usuario todavía.</p>
                    </div>
                  ) : (
                    reportesUsuarios.map(r => (
                      <div key={r.id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <TriangleAlert className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{r.tipo}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                r.estado === 'resuelto' ? 'bg-green-100 text-green-700' :
                                r.estado === 'en_revision' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{r.estado}</span>
                              <span className="text-[10px] text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString('es-AR') : ''}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                              {r.reportador?.nombre || 'Usuario'} <span className="font-normal text-xs text-gray-400">reportó a</span> {r.reportado?.nombre || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.descripcion}</p>
                          </div>
                        </div>
                        {r.estado !== 'resuelto' && (
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {r.estado === 'pendiente' && (
                              <button onClick={() => handleActualizarReporte(r.id, 'en_revision')} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                Poner en revisión
                              </button>
                            )}
                            <button onClick={() => handleActualizarReporte(r.id, 'resuelto')} className="text-[11px] bg-[#00355f] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#0f4c81] transition-colors">
                              Marcar resuelto
                            </button>
                          </div>
                        )}
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
                    <input
                      type="text"
                      value={nuevoOficio}
                      onChange={e => setNuevoOficio(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAgregarOficio(); } }}
                      placeholder="Nuevo oficio (ej: Jardinero)"
                      className="flex-1 p-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fc8127]"
                    />
                    <button
                      onClick={handleAgregarOficio}
                      disabled={guardandoOficio || !nuevoOficio.trim()}
                      className="bg-[#fc8127] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#e67320] disabled:opacity-50"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {oficios.length === 0 ? (
                      <p className="text-xs text-gray-400">No hay oficios cargados.</p>
                    ) : oficios.map(o => (
                      <span key={o.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full">
                        {o.nombre}
                        <button onClick={() => handleEliminarOficio(o.id)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
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
                    {reglasPuntos.length === 0 ? (
                      <p className="text-xs text-gray-400">No hay reglas cargadas.</p>
                    ) : reglasPuntos.map((regla) => (
                      <div key={regla.clave} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">{regla.etiqueta}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={reglasPuntosEdit[regla.clave] ?? ''}
                            onChange={e => setReglasPuntosEdit(prev => ({ ...prev, [regla.clave]: e.target.value }))}
                            className="w-16 p-1.5 text-center text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg"
                          />
                          <span className="text-[10px] font-bold text-gray-400">pts</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleGuardarReglasPuntos}
                      disabled={guardandoReglas || reglasPuntos.length === 0}
                      className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {guardandoReglas ? 'Guardando...' : 'Guardar Reglas'}
                    </button>
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
                            {camp.banner_url ? (
                              <img src={camp.banner_url} alt="banner" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0" />
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
                              {camp.fecha_inicio && <p className="text-[9px] text-gray-400 mt-0.5">📅 {camp.fecha_inicio} → {camp.fecha_fin}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleToggleCampana(camp.id, camp.activa)} className={`shrink-0 p-1 rounded-lg transition-colors ${camp.activa ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
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

          {activeTab === 'premios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Crear Premio */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#fc8127]/10 rounded-2xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#fc8127]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#00355f]">Nuevo Premio</h3>
                      <p className="text-xs text-gray-500">Cargá premios que los profesionales puedan canjear con sus puntos.</p>
                    </div>
                  </div>
                  <form onSubmit={handleCreatePremio} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre del Premio *</label>
                        <input value={premioForm.nombre} onChange={e => setPremioForm(p => ({ ...p, nombre: e.target.value }))} placeholder="ej: Remera OficiosYa" required className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Costo en Puntos *</label>
                        <input type="number" min={1} value={premioForm.costoPuntos} onChange={e => setPremioForm(p => ({ ...p, costoPuntos: e.target.value }))} placeholder="ej: 200" required className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Stock (vacío = ilimitado)</label>
                        <input type="number" min={0} value={premioForm.stock} onChange={e => setPremioForm(p => ({ ...p, stock: e.target.value }))} placeholder="ej: 10" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">URL de Imagen</label>
                        <input value={premioForm.imagenUrl} onChange={e => setPremioForm(p => ({ ...p, imagenUrl: e.target.value }))} placeholder="https://..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127]" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
                        <textarea rows={2} value={premioForm.descripcion} onChange={e => setPremioForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="ej: Remera oficial de OficiosYa, talles a elección" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#fc8127] resize-none" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                      <Gift className="w-4 h-4" /> Crear Premio
                    </button>
                  </form>
                </div>

                {/* Lista de Premios */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[700px]">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#00355f]">Premios Creados</h3>
                    <span className="text-[10px] font-black bg-[#fc8127]/10 text-[#fc8127] px-2 py-1 rounded-full">{premios.filter(p => p.activo).length} activos</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {premios.length === 0 ? (
                      <div className="text-center py-16">
                        <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">No hay premios creados</p>
                        <p className="text-xs text-gray-400 mt-1">Creá tu primer premio con el formulario.</p>
                      </div>
                    ) : (
                      premios.map(premio => (
                        <div key={premio.id} className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            {premio.imagen_url ? (
                              <img src={premio.imagen_url} alt="premio" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#fc8127] to-[#00355f] flex items-center justify-center shrink-0">
                                <Gift className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black bg-[#00355f]/10 text-[#00355f] px-2 py-0.5 rounded-full">{premio.costo_puntos} pts</span>
                                {premio.stock !== null && <span className="text-[9px] font-bold text-gray-500">Stock: {premio.stock}</span>}
                              </div>
                              <p className="text-xs font-bold text-gray-900">{premio.nombre}</p>
                              {premio.descripcion && <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{premio.descripcion}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleTogglePremio(premio.id, premio.activo)} className={`shrink-0 p-1 rounded-lg transition-colors ${premio.activo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                            {premio.activo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Canjes pendientes */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#00355f]">Canjes de Profesionales</h3>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{canjesAdmin.filter(c => c.estado === 'pendiente').length} pendientes</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {canjesAdmin.length === 0 ? (
                    <div className="text-center py-16">
                      <Coins className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-400">Todavía no hay canjes</p>
                    </div>
                  ) : (
                    canjesAdmin.map(canje => (
                      <div key={canje.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{canje.premio?.nombre || 'Premio'} — {canje.puntos_gastados} pts</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{canje.profesional?.nombre || canje.profesional?.email || 'Profesional'} · {new Date(canje.created_at).toLocaleDateString('es-AR')}</p>
                        </div>
                        {canje.estado === 'entregado' ? (
                          <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-1 rounded-full shrink-0">Entregado</span>
                        ) : (
                          <button onClick={() => handleMarcarEntregado(canje.id)} className="text-[10px] font-black bg-[#fc8127]/10 text-[#fc8127] hover:bg-[#fc8127]/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
                            Marcar entregado
                          </button>
                        )}
                      </div>
                    ))
                  )}
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
                  onClick={() => {
                    if (selectedUser.status === 'Activo') {
                      setSuspendReasonFor(selectedUser.id);
                      setSuspendReasonText('');
                    } else {
                      handleToggleStatus(selectedUser.id, selectedUser.status);
                    }
                  }}
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

              {selectedUser.status === 'Suspendido' && selectedUser.motivoEstado && (
                <p className="text-[11px] text-gray-500 -mt-2 bg-red-50 border border-red-100 rounded-xl p-2.5">
                  <b className="text-red-700">Motivo de suspensión:</b> {selectedUser.motivoEstado}
                </p>
              )}

              {suspendReasonFor === selectedUser.id && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                  <label className="text-[11px] font-bold text-red-700">Motivo de la suspensión (se le notifica al usuario):</label>
                  <textarea
                    rows={2}
                    value={suspendReasonText}
                    onChange={e => setSuspendReasonText(e.target.value)}
                    placeholder="Ej: incumplimiento reiterado de trabajos acordados"
                    className="w-full p-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSuspendReasonFor(null)} className="text-[11px] text-gray-500 font-bold px-3 py-1.5 hover:underline">Cancelar</button>
                    <button
                      onClick={async () => { await handleToggleStatus(selectedUser.id, 'Activo', suspendReasonText.trim()); setSuspendReasonFor(null); }}
                      disabled={!suspendReasonText.trim()}
                      className="text-[11px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
                    >
                      Confirmar suspensión
                    </button>
                  </div>
                </div>
              )}

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

              {/* Zona de peligro: baja permanente de la cuenta */}
              <div className="pt-3 border-t border-dashed border-gray-200">
                {!showDeleteAccountForm ? (
                  <button
                    onClick={() => { setShowDeleteAccountForm(true); setDeleteAccountReason(''); setDeleteAccountConfirmText(''); }}
                    className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar cuenta permanentemente
                  </button>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2.5">
                    <p className="text-[11px] font-bold text-red-700">Esta acción es irreversible. La cuenta queda inhabilitada y sus datos identificables se anonimizan.</p>
                    <textarea
                      rows={2}
                      value={deleteAccountReason}
                      onChange={e => setDeleteAccountReason(e.target.value)}
                      placeholder="Motivo de la baja..."
                      className="w-full p-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                    <div>
                      <label className="text-[10px] font-bold text-red-700">Escribí <b>{selectedUser.name}</b> para confirmar:</label>
                      <input
                        type="text"
                        value={deleteAccountConfirmText}
                        onChange={e => setDeleteAccountConfirmText(e.target.value)}
                        className="w-full mt-1 p-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowDeleteAccountForm(false)} className="text-[11px] text-gray-500 font-bold px-3 py-1.5 hover:underline">Cancelar</button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount || !deleteAccountReason.trim() || deleteAccountConfirmText.trim().toLowerCase() !== (selectedUser.name || '').trim().toLowerCase()}
                        className="text-[11px] bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg transition-colors"
                      >
                        {deletingAccount ? 'Eliminando...' : 'Eliminar definitivamente'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => { setSelectedUser(null); setShowDeleteAccountForm(false); setSuspendReasonFor(null); }}
              className="w-full py-3 bg-gray-150 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: ELIMINAR TRABAJO (requiere motivo) ── */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#00355f]">Eliminar trabajo</h3>
            <p className="text-xs text-gray-500">"{jobToDelete.titulo}" se va a eliminar y se le va a avisar al dueño de la publicación por qué.</p>
            <textarea
              rows={3}
              value={deleteJobReason}
              onChange={e => setDeleteJobReason(e.target.value)}
              placeholder="Motivo (ej: infringe normas de la plataforma)"
              className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setJobToDelete(null); setDeleteJobReason(''); }} className="text-xs text-gray-500 font-bold px-4 py-2 hover:underline">Cancelar</button>
              <button
                onClick={handleConfirmDeleteJob}
                disabled={!deleteJobReason.trim()}
                className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Eliminar trabajo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VACIAR TODA LA PLATAFORMA (requiere frase de confirmación) ── */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-700">Vaciar toda la plataforma</h3>
            </div>
            <p className="text-xs text-gray-600">Esto borra <b>usuarios, trabajos, postulaciones, reseñas y chats de todos</b>. No se puede deshacer.</p>
            <div>
              <label className="text-[11px] font-bold text-gray-500">Escribí <b>BORRAR TODO</b> para confirmar:</label>
              <input
                type="text"
                value={purgeConfirmText}
                onChange={e => setPurgeConfirmText(e.target.value)}
                className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowPurgeModal(false); setPurgeConfirmText(''); }} className="text-xs text-gray-500 font-bold px-4 py-2 hover:underline">Cancelar</button>
              <button
                onClick={handlePurgeAllData}
                disabled={clearing || purgeConfirmText !== 'BORRAR TODO'}
                className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-colors"
              >
                {clearing ? 'Borrando...' : 'Vaciar plataforma'}
              </button>
            </div>
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

                <div className="flex items-center gap-3 pb-1">
                  <img
                    src={selectedVerification.avatar || selectedVerification.fotoPerfil || 'https://i.pravatar.cc/150?u=' + selectedVerification.id}
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-300 shrink-0"
                  />
                  <p className="text-[10px] text-gray-400">Cotejá esta foto de perfil contra la del DNI subido a la derecha.</p>
                </div>

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
                      <p className="text-xs text-gray-400">
                        {selectedVerification.dniFrontalPath || selectedVerification.dniDorsoPath
                          ? 'Cargando imágenes del DNI...'
                          : 'El profesional todavía no subió su DNI.'}
                      </p>
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