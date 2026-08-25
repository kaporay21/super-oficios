"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, Home, Briefcase, MessageSquare, 
  User, PlusCircle, Grid, Wrench, Zap, Paintbrush, 
  Hammer, Sparkles, MapPin, Clock, LayoutDashboard, Send,
  HelpCircle, ChevronDown, ChevronUp, CheckCircle, Loader2
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, HerramientasIcon } from '@/components/ModernIcons';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, supabase } from '@/lib/supabase';
import { OFICIOS_CORE } from '@/lib/constants';

export default function MuroTrabajosPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <MuroTrabajosContent />
    </AuthGuard>
  );
}

function MuroTrabajosContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [presupuestosCount, setPresupuestosCount] = useState(0);
  const [obrasGanadasCount, setObrasGanadasCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Estados para Preguntas y Respuestas Pre-Presupuesto
  const [expandedJobQuestionsId, setExpandedJobQuestionsId] = useState<number | string | null>(null);
  const [preguntasMap, setPreguntasMap] = useState<{ [jobId: string]: any[] }>({});
  const [nuevaPreguntaTextoMap, setNuevaPreguntaTextoMap] = useState<{ [jobId: string]: string }>({});
  const [sendingMap, setSendingMap] = useState<{ [jobId: string]: boolean }>({});
  const [sentMap, setSentMap] = useState<{ [jobId: string]: boolean }>({});

  const [userPlan, setUserPlan] = useState<'Gratis' | 'Pro' | 'Master'>('Gratis');

  // Estado para el Modal de Presupuesto
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedJobForBudget, setSelectedJobForBudget] = useState<any>(null);
  const [budgetForm, setBudgetForm] = useState({
    monto: '',
    tiempoEstimado: '',
    garantia: '30_dias',
    detalle: '',
    materialesIncluidos: false
  });
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false);

  useEffect(() => {
    const storedPerfil = localStorage.getItem('oficiosya_profesional_perfil');
    if (storedPerfil) {
      try {
        const parsed = JSON.parse(storedPerfil);
        if (parsed.plan) setUserPlan(parsed.plan);
      } catch (e) {}
    }
  }, []);

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    if (user?.id) {
      dbHelper.getUnreadNotificationsCount(user.id).then(setUnreadCount).catch(() => {});
    }
  }, [user?.id]);

  const defaultImages: Record<string, string> = {
    'Plomería': '/images/oficio_plomeria_m_1784427462868.png',
    'Electricidad': '/images/oficio_electricidad_m_1784427470881.png',
    'Albañilería': '/images/oficio_albanileria_m_1784427479131.png',
    'Pintura': '/images/oficio_pintura_m_1784427486978.png',
    'Carpintería': '/images/oficio_carpinteria_1784426158760.png',
    'Gasista': '/images/oficio_gasista_1786058953543.png',
    'Cerrajería': '/images/oficio_cerrajeria_1786058962290.png',
    'Durlock / Yeso': '/images/oficio_durlock_1786058972139.png',
    'Aire Acondicionado': '/images/oficio_aire_acondicionado_1786058980622.png',
    'Jardinería': '/images/oficio_jardineria_1784426924675.png',
    'Fumigación': '/images/oficio_fumigacion_1786058989722.png',
    'Herrería': '/images/oficio_herreria_1786058999047.png',
    'Techista / Impermeabilización': '/images/oficio_techista_1786059008272.png',
    'Fletes y Mudanzas': '/images/oficio_fletes_1786059017459.png',
    'Limpieza': '/images/oficio_limpieza_1784426932346.png',
    'Otro': '/images/oficio_otro_1786059026661.png',
  };
  const getDefaultImage = (cat: string) => defaultImages[cat] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop';

  const toggleQuestions = async (jobId: number | string) => {
    if (expandedJobQuestionsId === jobId) {
      setExpandedJobQuestionsId(null);
    } else {
      setExpandedJobQuestionsId(jobId);
      const pregs = await dbHelper.getPreguntasTrabajo(jobId);
      setPreguntasMap(prev => ({ ...prev, [String(jobId)]: pregs }));
    }
  };

  const handleSendPregunta = async (jobId: number | string) => {
    const text = (nuevaPreguntaTextoMap[String(jobId)] || '').trim();
    if (!text) return;

    setSendingMap(prev => ({ ...prev, [String(jobId)]: true }));
    const ok = await dbHelper.addPreguntaTrabajo(jobId, text);
    const updatedPregs = await dbHelper.getPreguntasTrabajo(jobId);
    setPreguntasMap(prev => ({ ...prev, [String(jobId)]: updatedPregs }));
    setNuevaPreguntaTextoMap(prev => ({ ...prev, [String(jobId)]: '' }));
    setSendingMap(prev => ({ ...prev, [String(jobId)]: false }));
    if (ok) {
      setSentMap(prev => ({ ...prev, [String(jobId)]: true }));
      setTimeout(() => setSentMap(prev => ({ ...prev, [String(jobId)]: false })), 3000);
    }
  };

  useEffect(() => {
    const loadJobsAndStats = async () => {
      try {
        const allJobs = typeof dbHelper.getJobs === 'function' ? await dbHelper.getJobs() : [];
        // Filtramos para mostrar solo trabajos solicitados por clientes (NO empleos)
        const clientRequests = (allJobs || []).filter((j: any) => !j.esempleo);
        setTrabajos(clientRequests);

        if (typeof dbHelper.getPresupuestosEnviados === 'function') {
          const presupuestos = await dbHelper.getPresupuestosEnviados(user?.id || '');
          setPresupuestosCount(presupuestos ? presupuestos.length : 0);
        } else {
          setPresupuestosCount(0);
        }

        if (typeof dbHelper.getObras === 'function') {
          const obras = await dbHelper.getObras();
          const ganadas = (obras || []).filter((o: any) => o.estado === 'en-curso' || o.estado === 'finalizada');
          setObrasGanadasCount(ganadas.length);
        } else {
          const stored = JSON.parse(localStorage.getItem('oficiosya_obras_v2') || '[]');
          const ganadas = stored.filter((o: any) => o.estado === 'en-curso' || o.estado === 'finalizada');
          setObrasGanadasCount(ganadas.length);
        }
      } catch (error) {
        console.error("Error al cargar muro de trabajos:", error);
      }
    };
    loadJobsAndStats();
  }, []);

  const handleOpenBudgetModal = (job: any) => {
    setSelectedJobForBudget(job);
    setBudgetForm({
      monto: '',
      tiempoEstimado: '',
      garantia: '30_dias',
      detalle: 'Hola, te envío mi presupuesto inicial por el trabajo publicado. Quedo a disposición por cualquier consulta.',
      materialesIncluidos: false
    });
    setShowBudgetModal(true);
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForBudget || !user?.id) return;

    try {
      setIsSubmittingBudget(true);
      // 1. Obtener o crear conversación entre Profesional y Cliente
      const conv = await dbHelper.getOrCreateConversation(user.id, selectedJobForBudget.cliente_id || selectedJobForBudget.empleador_id);
      
      // 2. Crear presupuesto estructurado asociado a la conversación
      await dbHelper.crearPresupuestoEstructurado({
        conversacion_id: conv.id,
        profesional_id: user.id,
        cliente_id: selectedJobForBudget.cliente_id || selectedJobForBudget.empleador_id,
        trabajo_id: selectedJobForBudget.id,
        monto: Number(budgetForm.monto),
        tiempo_estimado: budgetForm.tiempoEstimado,
        garantia: budgetForm.garantia,
        detalle: budgetForm.detalle,
        materiales_incluidos: budgetForm.materialesIncluidos,
        observaciones: `Presupuesto enviado desde publicación: ${selectedJobForBudget.titulo}`
      });

      // 3. Notificar al cliente
      await supabase.from('notificaciones').insert([{
        usuario_id: selectedJobForBudget.cliente_id || selectedJobForBudget.empleador_id,
        tipo: 'presupuesto',
        titulo: 'Nuevo Presupuesto Recibido',
        descripcion: `${user.user_metadata?.nombre || 'Un profesional'} te envió un presupuesto por "${selectedJobForBudget.titulo}". Revisa tus mensajes.`,
        leida: false
      }]);

      setShowBudgetModal(false);
      alert('¡Presupuesto enviado con éxito! Puedes hacer seguimiento en tus Mensajes.');
    } catch (err: any) {
      console.error('Error enviando presupuesto - message:', err.message, 'details:', err.details, 'hint:', err.hint, 'code:', err.code, 'full:', err);
      alert('Hubo un error al enviar el presupuesto. Inténtalo de nuevo.');
    } finally {
      setIsSubmittingBudget(false);
    }
  };

  // Lógica de filtrado en tiempo real
  const trabajosFiltrados = categoriaActiva === 'Todos' 
    ? trabajos 
    : trabajos.filter(trabajo => trabajo.categoria === categoriaActiva);

  const sugeridosTrabajos = trabajos.slice(0, 3);

  const categorias = ['Todos', ...OFICIOS_CORE];

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-24 pb-24 md:pb-0">
      
      {/* Top AppBar Consistente */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer md:pl-24" onClick={() => router.push('/panel-profesional')}>
          <Logo size="md" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
            <button onClick={() => router.push('/notificaciones')} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
              )}
            </button>
          </Tooltip>
          <Tooltip title="Mi Perfil" text="Actualizá tus datos personales, especialidades, coberturas y subí certificados profesionales." position="bottom">
            <div onClick={() => router.push('/configuracion-profesional')} className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold text-sm border border-gray-200 cursor-pointer">
              JP
            </div>
          </Tooltip>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-4 gap-3 select-none shadow-sm overflow-y-auto scrollbar-none">
        
        <Tooltip title="Panel" text="Hacé clic para ver el resumen de tu actividad, trabajos activos y ganancias del mes." position="right">
          <button 
            onClick={() => router.push('/panel-profesional')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <PanelIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Panel</span>
          </button>
        </Tooltip>

        <Tooltip title="Muro de trabajos" text="Explorá el muro de solicitudes publicadas por clientes y postulá tus presupuestos." position="right">
          <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
              <MuroIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Muro</span>
          </button>
        </Tooltip>

        {(userPlan === 'Pro' || userPlan === 'Master') && (
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
            onClick={() => router.push('/panel-profesional?support=true')}
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-8 flex-grow w-full space-y-8">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00355f] mb-2">Muro de Trabajos</h1>
            <p className="text-base text-gray-500 max-w-2xl">Explora las solicitudes recientes en tu zona. Envía presupuestos para ganar el proyecto.</p>
          </div>
          {/* El botón "Publicar un Trabajo" se oculta en esta vista si es exclusiva del profesional, pero lo mantenemos si la plataforma permite dualidad */}
          <button onClick={() => router.push('/publicar-trabajo')} className="bg-[#fc8127] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#e67320] active:scale-95 transition-all w-fit">
            <PlusCircle className="w-5 h-5" /> Publicar Solicitud
          </button>
        </section>

        {/* Categorías (Filtros horizontales Funcionales) */}
        <section className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <div className="flex gap-3">
            {categorias.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategoriaActiva(cat)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  categoriaActiva === cat 
                    ? 'bg-[#00355f] text-white shadow-sm' 
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Listado principal de Trabajos (Filtrado) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-8 space-y-6">
            {trabajosFiltrados.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-[#00355f]">No hay trabajos en esta categoría</h3>
                <p className="text-sm text-gray-500 mt-2">Intenta seleccionando "Todos" o busca en otro momento.</p>
              </div>
            ) : (
              trabajosFiltrados.map((job) => (
                <article key={job.id} className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${expandedJobQuestionsId === job.id ? 'grid grid-cols-1 lg:grid-cols-3' : 'flex flex-col md:flex-row p-5 gap-6'}`}>
                  
                  {/* Cabecera / Info del trabajo (Izquierda cuando está expandido) */}
                  <div className={`${expandedJobQuestionsId === job.id ? 'p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100' : 'flex flex-col md:flex-row gap-6 w-full relative'}`}>
                    {job.urgente && (
                      <div className="absolute top-0 right-0 z-10">
                        <span className="bg-[#fc8127] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-wider shadow-sm">Urgente</span>
                      </div>
                    )}
                    
                    <div className={`overflow-hidden rounded-xl bg-gray-100 relative shrink-0 ${expandedJobQuestionsId === job.id ? 'w-full h-32 mb-4' : 'w-full md:w-56 h-48 md:h-auto'}`}>
                      <img className="absolute inset-0 w-full h-full object-cover" src={job.imagen || getDefaultImage(job.categoria || job.oficio)} alt={job.titulo} />
                      <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <span className="text-xs font-black text-[#00355f] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{job.categoria || job.oficio || 'General'}</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-3">{job.titulo}</h3>
                        <p className={`text-sm text-gray-600 mt-2 leading-relaxed ${expandedJobQuestionsId === job.id ? 'line-clamp-4' : 'line-clamp-3'}`}>{job.descripcion}</p>
                      </div>
                      
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 ${expandedJobQuestionsId === job.id ? 'flex-col sm:flex-col items-stretch sm:items-stretch' : ''}`}>
                        <div className="flex flex-col gap-1.5 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {job.ubicacion || job.ciudad || 'Sin ubicación'}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {job.tiempo || 'Hace un momento'}</span>
                        </div>
                        
                        <div className={`flex items-center gap-2 ${expandedJobQuestionsId === job.id ? 'w-full mt-2' : 'sm:w-auto w-full'}`}>
                          <button 
                            onClick={() => toggleQuestions(job.id)}
                            className={`bg-blue-50 hover:bg-blue-100 text-[#00355f] border border-blue-200 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${expandedJobQuestionsId === job.id ? 'w-full' : 'px-3.5'}`}
                          >
                            <HelpCircle className="w-4 h-4 text-[#fc8127]" /> 
                            {expandedJobQuestionsId === job.id ? 'Cerrar Panel' : `Preguntas (${preguntasMap[String(job.id)]?.length || 0})`}
                          </button>
                          {!expandedJobQuestionsId && (
                            <button onClick={() => handleOpenBudgetModal(job)} className="bg-[#00355f] hover:bg-[#0f4c81] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm flex-1 sm:flex-initial flex justify-center">
                              Presupuestar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel de preguntas (Derecha cuando está expandido) */}
                  {expandedJobQuestionsId === job.id && (
                    <div className="lg:col-span-2 bg-[#f8fafc] p-5 md:p-6 flex flex-col h-full max-h-[550px]">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4 shrink-0">
                        <h5 className="text-sm font-bold text-[#00355f] flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#fc8127]" /> 
                          Bandeja de Consultas con el Cliente
                        </h5>
                        <button onClick={() => handleOpenBudgetModal(job)} className="bg-[#fc8127] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#e67320]">Presupuestar Trabajo</button>
                      </div>

                      {/* Historial de Preguntas y Respuestas */}
                      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 pr-2 pb-4">
                        {(!preguntasMap[String(job.id)] || preguntasMap[String(job.id)].length === 0) ? (
                           <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                             <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
                             <p className="text-sm text-gray-500 max-w-xs">Nadie ha hecho preguntas aún sobre esta solicitud. ¡Sé el primero en consultar!</p>
                           </div>
                        ) : (
                          preguntasMap[String(job.id)].map((p: any) => (
                            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-4 space-y-3">
                              {/* Burbuja del Profesional (Tú u otros) */}
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-bold text-xs shrink-0 border border-gray-200">
                                  {p.profesionalNombre?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 border border-gray-100">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-black text-[#00355f]">
                                      {p.profesional_id === user?.id ? 'Tú' : p.profesionalNombre}
                                    </p>
                                    <span className="text-[9px] text-gray-400 font-bold">{new Date(p.fecha).toLocaleDateString('es-AR')}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">"{p.pregunta}"</p>
                                </div>
                              </div>

                              {/* Burbuja del Cliente o Esperando */}
                              {p.respuesta ? (
                                <div className="flex items-start gap-3 justify-end ml-8">
                                  <div className="flex-1 bg-blue-50/50 rounded-2xl rounded-tr-none p-3 border border-blue-100/50">
                                    <div className="flex justify-between items-start mb-1">
                                      <p className="text-[10px] font-black text-[#00355f] uppercase tracking-wide">Respuesta del Cliente</p>
                                      <span className="text-[9px] text-blue-400 font-bold">✔✔</span>
                                    </div>
                                    <p className="text-sm text-[#00355f]">{p.respuesta}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-end ml-8">
                                  <span className="text-[10px] text-orange-500/80 italic font-medium bg-orange-50 px-2 py-1 rounded-lg">Esperando respuesta del cliente...</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input para hacer una pregunta */}
                      <div className="mt-4 pt-4 border-t border-gray-200 shrink-0 bg-[#f8fafc]">
                        <div className="flex items-end gap-2">
                          <div className="flex-1 bg-white border border-[#fc8127]/30 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#fc8127] focus-within:border-transparent transition-all">
                            <textarea
                              rows={2}
                              value={nuevaPreguntaTextoMap[String(job.id)] || ''}
                              onChange={(e) => setNuevaPreguntaTextoMap(prev => ({ ...prev, [String(job.id)]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendPregunta(job.id); } }}
                              placeholder="Escribe tu consulta previa (ej: ¿Es casa o dpto?)..."
                              className="w-full px-3 py-2.5 text-xs outline-none resize-none bg-transparent"
                            />
                          </div>
                          <button 
                            onClick={() => handleSendPregunta(job.id)}
                            disabled={sendingMap[String(job.id)] || !(nuevaPreguntaTextoMap[String(job.id)] || '').trim()}
                            className="bg-[#fc8127] hover:bg-[#e67320] disabled:bg-gray-300 disabled:opacity-50 text-white font-bold p-3 rounded-xl transition-colors shrink-0 shadow-sm"
                          >
                            {sendingMap[String(job.id)] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : sentMap[String(job.id)] ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Send className="w-4 h-4 translate-x-px" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6">
            <div className="bg-[#00355f] text-white p-6 rounded-2xl shadow-lg space-y-4">
              <h4 className="text-lg font-bold">Tu Actividad</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Presupuestos enviados</span><span className="font-bold text-lg text-[#fc8127]">{presupuestosCount}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="opacity-80">Trabajos ganados</span><span className="font-bold text-lg text-[#fc8127]">{obrasGanadasCount}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-[#00355f]">Sugeridos cerca tuyo</h4>
              {sugeridosTrabajos.length === 0 ? (
                <p className="text-xs text-gray-500">No hay trabajos sugeridos por el momento.</p>
              ) : (
                <div className="space-y-4 text-sm divide-y divide-gray-100">
                  {sugeridosTrabajos.map((job, idx) => (
                    <div key={job.id || idx} className={idx > 0 ? "pt-3" : "pt-1"}>
                      <p className="font-bold text-gray-900 cursor-pointer hover:text-[#fc8127] line-clamp-1">{job.titulo}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" /> {job.ubicacion || job.ciudad || 'Sin ubicación'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Dashboard</span></button>
        <button className="flex flex-col items-center text-[#fc8127]"><Grid className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Muro</span></button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><MessageSquare className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Chat</span></button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><User className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Perfil</span></button>
      </nav>
      {/* Modal de Presupuesto */}
      {showBudgetModal && selectedJobForBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#00355f] p-5 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#fc8127]" /> Armar Presupuesto</h3>
                <p className="text-xs text-blue-200 mt-1">Para: {selectedJobForBudget.titulo}</p>
              </div>
              <button onClick={() => setShowBudgetModal(false)} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"><ChevronUp className="w-6 h-6 rotate-180" /></button>
            </div>
            
            <form onSubmit={handleSubmitBudget} className="p-6 flex-1 overflow-y-auto space-y-5 bg-gray-50/50">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Monto Total Estimado ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full bg-white border border-gray-300 pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none font-medium"
                    placeholder="Ej: 50000"
                    value={budgetForm.monto}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, monto: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tiempo Estimado</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none text-sm"
                    placeholder="Ej: 2 días"
                    value={budgetForm.tiempoEstimado}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, tiempoEstimado: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Garantía</label>
                  <select 
                    className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none text-sm"
                    value={budgetForm.garantia}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, garantia: e.target.value }))}
                  >
                    <option value="sin_garantia">Sin garantía</option>
                    <option value="7_dias">7 días</option>
                    <option value="15_dias">15 días</option>
                    <option value="30_dias">30 días</option>
                    <option value="60_dias">60 días</option>
                    <option value="90_dias">90 días</option>
                    <option value="6_meses">6 meses</option>
                    <option value="1_ano">1 año</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-[#00355f] rounded" 
                  checked={budgetForm.materialesIncluidos}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, materialesIncluidos: e.target.checked }))}
                />
                <span className="text-sm font-bold text-gray-700">El precio incluye materiales</span>
              </label>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje para el Cliente</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none resize-none text-sm"
                  placeholder="Detalla qué incluye el trabajo, cómo lo vas a hacer..."
                  value={budgetForm.detalle}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, detalle: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Este presupuesto se enviará directamente al chat del cliente para que pueda aceptarlo o rechazarlo.</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmittingBudget}
                  className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingBudget ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Enviar Presupuesto Formal</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}