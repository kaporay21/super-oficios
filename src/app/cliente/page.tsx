"use client";

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, MessageSquare, Plus, Bell, Menu, Home, ClipboardList, User, Sparkles, Wrench, Zap, Paintbrush, Building, ChevronRight, ShieldAlert, HelpCircle, ChevronDown, ChevronUp, Send, Loader2, Receipt, Wallet, Heart, AlertCircle, MessageCircle } from 'lucide-react';
import { Screen, Professional, Job } from '@/types';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';
import { OFICIOS_CORE } from '@/lib/constants';
import confetti from 'canvas-confetti';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { useNotification } from '@/providers/NotificationProvider';

export default function HomePage() {
  return (
    <AuthGuard requiredRole="cliente">
      <HomePageContent />
    </AuthGuard>
  );
}

function HomePageContent() {
  const router = useRouter();
  const { profile: authProfile } = useAuth();

  const { unreadNotificationsCount: unreadNotifsCount } = useNotification();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  React.useEffect(() => {
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
      setClientProfile(authProfile);
    }
  }, [authProfile]);

  React.useEffect(() => {
    const loadClientData = async () => {
      const clientName = clientProfile?.nombre || authProfile?.nombre || '';
      const userId = authProfile?.id;
      
      try {
        const allJobs = await dbHelper.getJobs().catch(() => []);

        // Filtramos por cliente_id real (antes usaba una columna
        // `user_id` que no existe en `trabajos`, y de respaldo comparaba
        // por nombre de perfil como texto -- si el cliente cambiaba su
        // nombre, sus propios trabajos "desaparecían" de este listado).
        let clientJobs = userId
          ? allJobs.filter((j: any) => j.cliente_id === userId)
          : allJobs;

        // Ofertas reales del Muro (antes leía presupuestos_estructurados,
        // una tabla de otro flujo -- el badge de "tenés ofertas" nunca se
        // activaba aunque hubiera ofertas esperando en comparar-presupuestos).
        const jobsWithPresupuestos = await Promise.all(clientJobs.map(async (j: any) => {
          let count = 0;
          try {
            const ofertas = await dbHelper.getPresupuestosMuroByTrabajo(j.id);
            // Solo las pendientes de revisar -- antes contaba también las ya
            // aceptadas/rechazadas, así que el badge seguía mostrando
            // "N Presupuestos" después de haber resuelto todas.
            count = ofertas.filter((o: any) => o.estado === 'pendiente').length;
          } catch (e) {
            console.error('Error fetching presupuestos for job', j.id);
          }
          return {
            ...j,
            presupuestosCount: count
          };
        }));
        setMyJobs(jobsWithPresupuestos);
      } catch (error) {
        console.error("Error al cargar trabajos:", error);
      }


      try {
        const users = await dbHelper.getAllUsers();
        // getAllUsers trae todos los perfiles sin filtrar (la usa el admin
        // para gestionar cuentas de cualquier estado) -- acá, de cara al
        // cliente, hay que sacar los suspendidos/eliminados a mano, cosa
        // que el buscador ya hace pero esta pantalla no.
        const pros = users.filter((u: any) => u.role === 'Profesional' && u.status === 'Activo');
        setProfessionals(pros);
      } catch (error) {
        console.error("Error al cargar profesionales:", error);
      }
    };
    loadClientData();
  }, [clientProfile, authProfile]);

  // Función actualizada para manejar la navegación
  const handleNavigate = (screen: Screen | 'publish_job') => {
    if (screen === 'profile_client') router.push('/perfil-cliente'); // Ajustado a la ruta correcta
    if (screen === 'register_pro') router.push('/registro-profesional');
    
    // AHORA REDIRIGE DIRECTO A COMPARAR PRESUPUESTOS
    if (screen === 'job_detail') router.push('/comparar-presupuestos'); 
    
    if (screen === 'publish_job') router.push('/publicar-trabajo'); // Nueva ruta agregada
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 selection:bg-[#0f4c81] selection:text-white">
      {/* Cabecera Superior (Full Width con contenedor interno) */}
      <header className="bg-white px-4 py-3 sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          {/* Logo y Menú */}
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-600 cursor-pointer md:hidden" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <Logo size="md" theme="light" />
            </div>
          </div>
          
          {/* Iconos derechos y Usuario */}
          <div className="flex items-center gap-5">
            <Search className="text-[#00355f] w-5 h-5 cursor-pointer hidden md:block" />
            <div className="relative cursor-pointer" onClick={() => router.push('/notificaciones')}>
              <Bell className="text-[#00355f] w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
            <div 
              className="hidden md:flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/perfil-cliente')}
            >
              <img src={clientProfile?.foto_perfil || clientProfile?.fotoPerfil || 'https://i.pravatar.cc/150?u=' + (clientProfile?.id || 'cliente')} alt="Perfil" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
              <span className="text-sm font-semibold text-gray-700">{clientProfile?.nombre?.split(' ')[0] || 'Usuario'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal (Limitado en ancho para pantallas grandes) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        <HomeClient 
          onNavigate={handleNavigate} 
          postedJobs={myJobs}
          clientProfile={clientProfile}
          professionals={professionals}
        />
      </div>

      {/* Botón Flotante Naranja conectado con borde animado de alta interacción */}
      <Tooltip text="Publicar trabajo" position="top">
        <button
          onClick={() => handleNavigate('publish_job')}
          className="fixed bottom-24 right-6 md:right-12 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 relative p-[2px] overflow-hidden"
        >
          <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_70%,#fc8127_90%,#d946ef_100%)]" />
          <div className="relative w-full h-full rounded-full bg-[#fc8127] hover:bg-[#e67320] text-white flex items-center justify-center transition-colors">
            <Plus className="w-8 h-8" />
          </div>
        </button>
      </Tooltip>
    </main>
  );
}

// --- COMPONENTE CLIENTE --- //

interface HomeClientProps {
  onNavigate: (screen: Screen | 'publish_job') => void;
  onSelectPro?: (pro: Professional) => void;
  postedJobs: Job[];
  clientProfile?: any;
  professionals: any[];
}

const HomeClient: React.FC<HomeClientProps> = ({
  onNavigate,
  onSelectPro,
  postedJobs,
  clientProfile,
  professionals
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedScreen] = useState<string>('todos');
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  // Favoritos: guardados sin re-buscar (ver también Bug 5 -- estos mismos
  // botones de "Contactar" no tenían ninguna acción propia).
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());
  const [contactandoId, setContactandoId] = useState<string | null>(null);

  // "Cosas pendientes": resumen de lo que necesita tu atención, arriba de todo.
  const { unreadMessagesCount } = useNotification();
  const [pendientes, setPendientes] = useState<{ ofertasNuevas: number; preguntasSinResponder: number; trabajosSinResena: number } | null>(null);

  React.useEffect(() => {
    if (!clientProfile?.id) return;
    dbHelper.getResumenPendientesCliente(clientProfile.id).then(setPendientes).catch(() => {});
  }, [clientProfile?.id]);

  const scrollToPedidos = () => {
    document.getElementById('pedidos-activos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  React.useEffect(() => {
    if (!clientProfile?.id) return;
    dbHelper.getFavoritosIds(clientProfile.id).then(ids => setFavoritosIds(new Set(ids))).catch(() => {});
  }, [clientProfile?.id]);

  const handleToggleFavorito = async (e: React.MouseEvent, proId: string) => {
    e.stopPropagation();
    if (!clientProfile?.id) return;
    const yaEsFavorito = favoritosIds.has(proId);
    setFavoritosIds(prev => {
      const next = new Set(prev);
      if (yaEsFavorito) next.delete(proId); else next.add(proId);
      return next;
    });
    try {
      await dbHelper.toggleFavorito(clientProfile.id, proId, !yaEsFavorito);
    } catch (err) {
      console.error('Error al guardar favorito:', err);
      // revertimos si falló
      setFavoritosIds(prev => {
        const next = new Set(prev);
        if (yaEsFavorito) next.add(proId); else next.delete(proId);
        return next;
      });
    }
  };

  const handleContactarProfesional = async (e: React.MouseEvent, proId: string) => {
    e.stopPropagation();
    if (!clientProfile?.id || clientProfile.id === proId) return;
    setContactandoId(proId);
    try {
      const conv = await dbHelper.getOrCreateConversation(clientProfile.id, proId);
      if (conv?.id) router.push(`/chat/${conv.id}`);
    } catch (err: any) {
      alert(err?.message || 'No pudimos abrir el chat. Intentá de nuevo en un momento.');
    } finally {
      setContactandoId(null);
    }
  };

  // Estado para el panel de preguntas por trabajo
  const [expandedJobId, setExpandedJobId] = useState<string | number | null>(null);
  const [preguntasMap, setPreguntasMap] = useState<{ [jobId: string]: any[] }>({});
  const [presupuestosMap, setPresupuestosMap] = useState<{ [jobId: string]: any[] }>({});
  const [respuestasMap, setRespuestasMap] = useState<{ [pregId: string]: string }>({});
  const [respondingMap, setRespondingMap] = useState<{ [pregId: string]: boolean }>({});

  const handleVerEnChatPresupuesto = async (pres: any) => {
    const userId = clientProfile?.id;
    if (!userId) return;
    const proId = pres.profesionalId || pres.profesional?.id || pres.profesional_id;
    if (!proId) return;

    try {
      let convId = pres.conversacion_id || pres.conversacionId;
      if (!convId) {
        const conv = await dbHelper.getOrCreateConversation(userId, proId);
        convId = conv?.id;
      }
      if (convId) {
        router.push(`/chat/${convId}`);
      }
    } catch (err) {
      console.error('Error al abrir chat de presupuesto:', err);
    }
  };


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

  const handleTogglePreguntas = async (jobId: string | number) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
      return;
    }
    setExpandedJobId(jobId);
    const [pregs, presupuestos] = await Promise.all([
      dbHelper.getPreguntasTrabajo(jobId),
      dbHelper.getPresupuestosMuroByTrabajo(jobId)
    ]);
    setPreguntasMap(prev => ({ ...prev, [String(jobId)]: pregs }));
    setPresupuestosMap(prev => ({ ...prev, [String(jobId)]: presupuestos }));
  };

  const handleResponder = async (preguntaId: string, jobId: string | number) => {
    const texto = (respuestasMap[preguntaId] || '').trim();
    if (!texto) return;
    setRespondingMap(prev => ({ ...prev, [preguntaId]: true }));
    const ok = await dbHelper.responderPreguntaTrabajo(preguntaId, texto);
    if (!ok) {
      alert('No pudimos guardar tu respuesta. Probá de nuevo en un momento.');
      setRespondingMap(prev => ({ ...prev, [preguntaId]: false }));
      return;
    }
    const updatedPregs = await dbHelper.getPreguntasTrabajo(jobId);
    setPreguntasMap(prev => ({ ...prev, [String(jobId)]: updatedPregs }));
    setRespuestasMap(prev => ({ ...prev, [preguntaId]: '' }));
    setRespondingMap(prev => ({ ...prev, [preguntaId]: false }));
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('oficio') || 'todos';
      const prov = params.get('provincia') || '';
      setSelectedScreen(cat);
      setSelectedProvince(prov);
    }
  }, []);

  const categories = [
    { id: 'todos', label: 'Todos' },
    ...OFICIOS_CORE.map(oficio => ({
      id: oficio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      label: oficio
    }))
  ];

  const CAROUSEL_CARDS = OFICIOS_CORE.filter(oficio => oficio !== 'Otro').map((oficio, index) => ({
    id: oficio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    label: oficio,
    img: getDefaultImage(oficio),
    color: index % 2 === 0 ? 'from-[#00355f]/90' : 'from-[#fc8127]/90'
  }));

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((pro) => {
      const matchesCategory = selectedCategory === 'todos' || pro.category === selectedCategory;
      const matchesLocation = selectedProvince === '' || pro.location.toLowerCase().includes(selectedProvince.toLowerCase()) || selectedProvince.toLowerCase().includes(pro.location.toLowerCase().split(',')[1]?.trim() || '');
      return matchesCategory && matchesLocation;
    });
  }, [professionals, selectedCategory, selectedProvince]);

  const isMasterPlan = (proId: string | number) => {
    const pro = professionals.find(p => p.id === proId);
    if (pro) {
      return pro.plan === 'Master';
    }
    return false;
  };

  return (
    <div className="space-y-10 pb-10">
      
      {/* Título de Bienvenida */}
      <section className="text-center bg-white py-12 px-4 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#00355f] leading-tight">
            Encontrá al profesional que necesitás hoy
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
            Conectamos tus necesidades con expertos verificados y de confianza en tu zona.
          </p>
        </div>
        <button
          onClick={() => onNavigate('publish_job')}
          className="inline-flex items-center gap-2 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Publicar Trabajo
        </button>
      </section>

      {/* Carrusel Visual de Oficios (Marquee Continuo) */}
      <section className="w-full overflow-hidden">
        <div className="animate-marquee gap-4 pb-4 px-2">
          {[...CAROUSEL_CARDS, ...CAROUSEL_CARDS].map((card, i) => (
            <div key={`${card.id}-${i}`} className="shrink-0 w-64 h-40 md:w-80 md:h-48 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <img src={card.img} alt={card.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className={`absolute inset-0 bg-gradient-to-t ${card.color} to-transparent flex items-end p-5`}>
                <span className="text-white font-bold text-lg">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- BANNER DESTACADO: MI HOGAR --- */}
      <section 
        onClick={() => router.push('/mi-hogar')}
        className="bg-gradient-to-r from-slate-900 via-[#001529] to-slate-900 text-white p-6 rounded-3xl border border-slate-700/60 shadow-md cursor-pointer hover:border-[#fc8127]/50 transition-all group relative overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#fc8127] to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">Mi Hogar</h3>
                <span className="bg-[#fc8127]/20 text-[#fc8127] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#fc8127]/30 uppercase">Centro Digital</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Guardá propiedades, comprobantes, garantías y mantenimientos de tu casa en un solo lugar.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#fc8127] group-hover:translate-x-1 transition-transform shrink-0">
            <span>Abrir Mi Hogar</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Buscador y Filtros */}
      <section className="space-y-4">
        <div className="bg-[#00355f] rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-md">
          <h2 className="text-xl md:text-2xl font-bold mb-4">¿Dónde necesitás al profesional?</h2>
          <div className="relative flex items-center bg-white rounded-xl shadow-sm">
            <MapPin className="absolute left-4 w-5 h-5 md:w-6 md:h-6 text-[#fc8127]" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full h-12 md:h-14 pl-12 pr-4 bg-transparent border-none outline-none focus:ring-2 focus:ring-[#fc8127] rounded-xl text-gray-800 text-sm md:text-base appearance-none cursor-pointer font-medium"
            >
              <option value="">Todas las ubicaciones</option>
              <option value="CABA">CABA (Ciudad Autónoma de Buenos Aires)</option>
              <option value="GBA">GBA (Gran Buenos Aires)</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
            <div className="absolute right-4 pointer-events-none">
              <span className="text-gray-400 text-xs">▼</span>
            </div>
          </div>
        </div>

        {/* Categorías (Botones estilo píldora) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0 w-full pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedScreen(cat.id)}
              className={`px-5 py-2 md:py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-[#fc8127] text-white font-bold'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ¿Cómo funciona OficiosYa? */}
      <section className="bg-white py-12 px-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-black text-[#00355f] mb-10 text-center tracking-tight">¿Cómo funciona Oficios<span className="text-[#fc8127]">Ya</span>?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Paso 1 */}
          <div className="flex flex-col items-center space-y-4 group/step">
            <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 overflow-hidden relative group-hover/step:from-orange-50/40 transition-all duration-300">
              {/* Floating mini-trade cards */}
              <div className="flex gap-2">
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,53,95,0.06)] border border-slate-100/80 -rotate-6 translate-y-1 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#00355f] mb-1">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-700">Plomería</span>
                </div>
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.08)] border border-[#fc8127]/20 z-10 -translate-y-2 hover:-translate-y-3 transition-all duration-300 cursor-pointer scale-105">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#fc8127] mb-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-extrabold text-[#fc8127]">Electricidad</span>
                </div>
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,53,95,0.06)] border border-slate-100/80 rotate-6 translate-y-1 hover:rotate-0 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-1">
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-700">Pintura</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-xs">1</div>
              <h4 className="font-extrabold text-gray-900 text-sm">Busca tu oficio</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed px-4 text-center">Encontrá exactamente lo que necesitás entre cientos de categorías.</p>
          </div>

          {/* Paso 2 */}
          <div className="flex flex-col items-center space-y-4 group/step">
            <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
              {/* Mini Pro Profile Card */}
              <div className="w-48 bg-white rounded-xl shadow-[0_6px_16px_rgba(0,53,95,0.06)] border border-slate-100 p-2.5 relative flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD85pw1lweYxj9ZY758PmA-0PGM0q1wtL0dMOXlgKBD-eceH1UryKCy1mEoZ5jUVDHFU8WoXTd4EqiDhNzyh7eo-lvfyk9fk2EFupZ6Zvt_3y1dK2Hx72DsYSXEULFtCIOGfXFOQOyufsmHsfNTu3VL6NYRVMZ1WZzXYsCXr60o_ZHYewQ7-aozdL2YFUpmfxCHyFH4p7HMIjdTONG31bA0JhNzewarvNNZ_clLNY6vsyuFnGQL_lm3EW5Oz-SKQYNPYBh4oU178oXy" alt="Roberto" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-bold text-[10px] text-[#00355f] truncate">Roberto Gómez</div>
                  <div className="text-[7.5px] text-gray-400 font-bold uppercase tracking-wide">Plomería y Gas</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-[#fc8127] text-[10px]">★</span>
                    <span className="text-[9px] font-extrabold text-gray-600">4.9</span>
                    <span className="text-[8px] text-gray-400 font-semibold">(146 res)</span>
                  </div>
                </div>
                
                {/* Arrow clicker indicator */}
                <div className="absolute right-3.5 -bottom-1.5 animate-pulse">
                  <svg className="w-5 h-5 text-[#fc8127] fill-current drop-shadow-md" viewBox="0 0 24 24">
                    <path d="M4.5 2v15.5l4-3.5h7.5L4.5 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-xs">2</div>
              <h4 className="font-extrabold text-gray-900 text-sm">Mirá perfiles y reseñas</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed px-4 text-center">Elegí con confianza basándote en la experiencia de otros usuarios.</p>
          </div>

          {/* Paso 3 */}
          <div className="flex flex-col items-center space-y-4 group/step">
            <div className="w-full h-32 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-100 flex flex-col justify-center gap-1.5 p-3 overflow-hidden relative">
              {/* Chat message bubbles */}
              <div className="flex flex-col gap-1.5 w-full max-w-[210px] mx-auto text-left">
                {/* Client Message */}
                <div className="bg-slate-100 text-slate-800 text-[8.5px] font-semibold py-1 px-2.5 rounded-2xl rounded-bl-none max-w-[85%] self-start border border-slate-200/50">
                  Hola! ¿Cuándo podés pasar?
                </div>
                {/* Pro Message & Budget */}
                <div className="bg-blue-50 text-[#00355f] text-[8.5px] font-bold py-1 px-2.5 rounded-2xl rounded-br-none max-w-[90%] self-end border border-blue-100 flex flex-col gap-1">
                  <span>¡Hola! Hoy mismo.</span>
                  <span className="flex items-center gap-1 text-[8.5px] text-[#fc8127] bg-white px-1.5 py-0.5 rounded-lg border border-orange-100/50 shadow-[2px_2px_0px_rgba(252,129,39,0.1)] shrink-0">
                    💼 Presupuesto: $12.000 <span className="text-green-500 font-extrabold ml-auto">✔</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00355f] text-white flex items-center justify-center font-bold text-xs">3</div>
              <h4 className="font-extrabold text-gray-900 text-sm">Contactalo y recibí presupuestos</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed px-4 text-center">Chateá directamente y coordiná el trabajo en minutos.</p>
          </div>

        </div>
      </section>

      {/* Cosas pendientes: solo se muestra si hay algo que requiera atención */}
      {pendientes && (pendientes.ofertasNuevas > 0 || pendientes.preguntasSinResponder > 0 || pendientes.trabajosSinResena > 0 || unreadMessagesCount > 0) && (
        <section className="bg-white border border-orange-100 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#fc8127]" />
            <h3 className="font-bold text-[#00355f]">Cosas pendientes</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendientes.ofertasNuevas > 0 && (
              <button onClick={scrollToPedidos} className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-[#c85a0f] text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                <Receipt className="w-3.5 h-3.5" /> {pendientes.ofertasNuevas} {pendientes.ofertasNuevas === 1 ? 'oferta nueva' : 'ofertas nuevas'}
              </button>
            )}
            {pendientes.preguntasSinResponder > 0 && (
              <button onClick={scrollToPedidos} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> {pendientes.preguntasSinResponder} {pendientes.preguntasSinResponder === 1 ? 'pregunta sin responder' : 'preguntas sin responder'}
              </button>
            )}
            {pendientes.trabajosSinResena > 0 && (
              <button onClick={() => router.push('/perfil-cliente?tab=expedientes')} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                <Star className="w-3.5 h-3.5" /> {pendientes.trabajosSinResena} {pendientes.trabajosSinResena === 1 ? 'trabajo sin calificar' : 'trabajos sin calificar'}
              </button>
            )}
            {unreadMessagesCount > 0 && (
              <button onClick={() => router.push('/chat')} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> {unreadMessagesCount} {unreadMessagesCount === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Tus Pedidos Activos */}
      <section id="pedidos-activos" className="space-y-4">
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-[#00355f]">Tus Pedidos Activos</h3>
          <button onClick={() => onNavigate('profile_client')} className="font-bold text-sm hover:underline text-[#00355f]">
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 items-start">
          {postedJobs.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-white border border-gray-100 rounded-2xl text-gray-500">
              Todavía no has publicado ningún trabajo. ¡Publicá uno para empezar!
            </div>
          ) : postedJobs.map((job: any) => {
            const jobPregs = preguntasMap[String(job.id)];
            const pregsSinRespuesta = (jobPregs || []).filter((p: any) => !p.respuesta).length;
            const isExpanded = expandedJobId === job.id;
            
            return (
              <div
                key={job.id}

                className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                  job.presupuestosCount > 0 ? 'border-2 border-[#fc8127] shadow-lg shadow-[#fc8127]/10' : 'border-gray-200'
                } ${isExpanded ? 'md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-3' : 'col-span-1'}`}
              >
                {/* Cabecera Visual con Imagen del Oficio */}
                <div className="h-32 w-full relative overflow-hidden bg-gradient-to-r from-[#00355f] to-[#0f4c81]">
                  <img
                    src={job.imagenes?.[0] || getDefaultImage(job.categoria || job.oficio)}
                    alt={job.titulo}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges de Urgencia y Categoría */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      job.urgente ? 'bg-red-500 text-white' : 'bg-[#00355f]/90 backdrop-blur-sm text-white border border-white/20'
                    }`}>
                      {job.urgente ? '🔥 Urgente' : '⏱️ Normal'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 backdrop-blur-sm text-[#00355f] shadow-sm">
                      {job.categoria || job.oficio || 'General'}
                    </span>
                  </div>

                  {job.presupuestosCount > 0 && (
                    <div className="absolute top-3 right-3 bg-[#fc8127] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/40 flex items-center gap-1 animate-pulse">
                      <span>💰 {job.presupuestosCount} {job.presupuestosCount === 1 ? 'Presupuesto' : 'Presupuestos'}</span>
                    </div>
                  )}
                </div>

                {/* Contenido / Info del Trabajo */}
                <div
                  className={`p-5 flex flex-col justify-between cursor-pointer hover:bg-gray-50/50 transition-colors ${
                    isExpanded ? 'lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-100' : ''
                  }`}
                  onClick={() => handleTogglePreguntas(job.id)}
                >
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-base leading-snug">
                      {job.titulo || job.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {job.descripcion || 'Sin descripción adicional.'}
                    </p>
                    <span className="inline-block text-[11px] text-gray-400 font-bold mt-2">
                      📍 {job.provincia || 'Zona'} · {job.tiempo || 'Hace unos instantes'}
                    </span>
                  </div>

                  {/* Pie de Tarjeta Interactivo */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#00355f] bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-100">
                      <MessageSquare className="w-3.5 h-3.5 text-[#fc8127]" />
                      <span>{jobPregs && jobPregs.length > 0 ? `${jobPregs.length} consulta${jobPregs.length > 1 ? 's' : ''}` : 'Sin consultas'}</span>
                    </div>

                    <button className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all ${
                      job.presupuestosCount > 0 ? 'bg-[#fc8127] text-white hover:bg-[#e67320]' : 'bg-[#00355f] text-white hover:bg-[#0f4c81]'
                    }`}>
                      {isExpanded ? (
                        <>Cerrar <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Ver Ofertas {job.presupuestosCount > 0 ? `(${job.presupuestosCount})` : ''} <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>


                {/* Panel de preguntas y presupuestos (Derecha cuando está expandido) */}
                {isExpanded && (
                  <div className="lg:col-span-2 bg-[#f8fafc] p-5 md:p-6 flex flex-col h-full max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    
                    {/* PRESUPUESTOS RECIBIDOS */}
                    {presupuestosMap[job.id] && presupuestosMap[job.id].length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4 shrink-0">
                          <h5 className="text-sm font-bold text-[#fc8127] flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-[#fc8127]" /> 
                            Presupuestos Recibidos
                          </h5>
                        </div>
                        <div className="space-y-4">
                          {presupuestosMap[job.id].map((pres: any) => (
                            <div key={pres.id} className="bg-white border-2 border-[#fc8127]/20 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-[#fc8127] transition-colors cursor-pointer" onClick={() => handleVerEnChatPresupuesto(pres)}>

                              <div className="flex items-center gap-3">
                                <img src={pres.profesional?.fotoPerfil || 'https://i.pravatar.cc/150'} className="w-10 h-10 rounded-full border border-gray-200 object-cover" alt="Pro" />
                                <div>
                                  <p className="text-xs font-black text-[#00355f]">{pres.profesional?.nombre || 'Profesional'}</p>
                                  <p className="text-[10px] text-gray-500 line-clamp-1">{pres.descripcion}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-[#fc8127]">${parseFloat(pres.monto).toLocaleString('es-AR')}</p>
                                <span className="text-[9px] font-bold text-[#00355f] bg-blue-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                                  <MessageSquare className="w-3 h-3" /> Ver en Chat
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4 shrink-0">
                      <h5 className="text-sm font-bold text-[#00355f] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#fc8127]" /> 
                        Bandeja de Consultas
                      </h5>
                    </div>

                    <div className="flex-1 space-y-4">
                      {!jobPregs || jobPregs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center opacity-60 py-8">
                           <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                           <p className="text-sm text-gray-500 max-w-xs">Aún no hay consultas de profesionales para este trabajo.</p>
                        </div>
                      ) : (
                        jobPregs.map((p: any) => (
                          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-4 space-y-3">
                            {/* Burbuja del Profesional */}
                            <div className="flex items-start gap-3">
                              <img src={p.profesionalAvatar || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full border border-gray-200 shrink-0 object-cover" alt="Pro" />
                              <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-xs font-black text-[#00355f]">{p.profesionalNombre}</p>
                                  <span className="text-[9px] text-gray-400 font-bold">{new Date(p.fecha).toLocaleDateString('es-AR')}</span>
                                </div>
                                <p className="text-sm text-gray-700">"{p.pregunta}"</p>
                              </div>
                            </div>

                            {/* Burbuja tuya o Input de respuesta */}
                            {p.respuesta ? (
                              <div className="flex items-start gap-3 justify-end ml-8">
                                <div className="flex-1 bg-blue-50/50 rounded-2xl rounded-tr-none p-3 border border-blue-100/50">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-[#00355f] uppercase tracking-wide">Tu Respuesta</p>
                                    <span className="text-[9px] text-blue-300 font-bold">Enviado ✔</span>
                                  </div>
                                  <p className="text-sm text-[#00355f]">{p.respuesta}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="ml-11 flex items-end gap-2 mt-2">
                                <div className="flex-1 bg-white border border-[#fc8127]/30 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#fc8127] focus-within:border-transparent transition-all">
                                  <textarea
                                    rows={1}
                                    value={respuestasMap[p.id] || ''}
                                    onChange={(e) => setRespuestasMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResponder(p.id, job.id); } }}
                                    placeholder="Escribí tu respuesta acá..."
                                    className="w-full px-3 py-2.5 text-xs outline-none resize-none bg-transparent"
                                  />
                                </div>
                                <button
                                  onClick={() => handleResponder(p.id, job.id)}
                                  disabled={respondingMap[p.id] || !(respuestasMap[p.id] || '').trim()}
                                  className="bg-[#00355f] hover:bg-[#0f4c81] disabled:bg-gray-300 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shrink-0 shadow-sm"
                                >
                                  {respondingMap[p.id]
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Send className="w-4 h-4 translate-x-px -translate-y-px" />
                                  }
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Profesionales Destacados */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-[#00355f] leading-tight">Profesionales Destacados</h3>
          <button onClick={() => setSelectedScreen('todos')} className="font-bold text-sm text-[#00355f] hover:underline">
            Explorar más
          </button>
        </div>

        {filteredProfessionals.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
            <p className="text-gray-500">No se encontraron profesionales para esta búsqueda.</p>
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
                    onClick={() => {
                      if (onSelectPro) onSelectPro(pro);
                      router.push(`/profesional/${pro.id}`);
                    }}
                    className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group h-full"
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
                      <button
                        onClick={(e) => handleToggleFavorito(e, pro.id)}
                        title={favoritosIds.has(pro.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-white/95 rounded-full shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                      >
                        <Heart className={`w-4 h-4 ${favoritosIds.has(pro.id) ? 'fill-[#fc8127] text-[#fc8127]' : 'text-gray-400'}`} />
                      </button>
                      {/* Rating real. Sin reseñas mostramos "Nuevo": un 0.0 en la
                          tarjeta hunde al profesional recién registrado igual que
                          un 5.0 inventado engaña al cliente. */}
                      <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        {pro.totalResenas > 0 ? (
                          <>
                            <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" />
                            <span className="font-bold text-xs text-green-700">{Number(pro.rating).toFixed(1)}</span>
                            <span className="text-[10px] text-gray-400 font-bold">({pro.totalResenas})</span>
                          </>
                        ) : (
                          <span className="font-bold text-[10px] text-[#00355f] uppercase tracking-wide">Nuevo</span>
                        )}
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
                        {(pro.cobraPresupuesto || pro.aceptaPagosSemanales) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {pro.cobraPresupuesto && (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full" title="Cobra la visita de presupuesto, sea cual sea el trabajo">
                                <Receipt className="w-3 h-3 text-gray-500" /> Cobra presupuesto
                              </span>
                            )}
                            {pro.aceptaPagosSemanales && (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full" title="Preferencia declarada por el profesional — OficiosYa no gestiona el pago">
                                <Wallet className="w-3 h-3 text-gray-500" /> Pagos en cuotas
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 mb-5">
                          <MapPin className="w-4 h-4 text-[#00355f]" />
                          <span>{pro.location}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleContactarProfesional(e, pro.id)}
                          disabled={contactandoId === pro.id}
                          className="flex-1 py-2.5 bg-[#00355f] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#0f4c81] disabled:opacity-60 transition-colors active:scale-95"
                        >
                          {contactandoId === pro.id ? 'Abriendo...' : 'Contactar'}
                        </button>
                        <button
                          onClick={(e) => handleContactarProfesional(e, pro.id)}
                          disabled={contactandoId === pro.id}
                          className="px-4 py-2.5 border border-gray-200 rounded-xl text-[#00355f] hover:bg-gray-50 disabled:opacity-60 transition-colors active:scale-95 flex items-center justify-center"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
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
      {!clientProfile && (
        <section className="bg-[#00355f] text-white p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold mb-3">¿Sos profesional?</h3>
            <p className="text-sm md:text-base text-blue-100 leading-relaxed">
              ¡Llevá tu trabajo al siguiente nivel! Unite a la red más grande de profesionales y empezá a recibir trabajos hoy mismo.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => onNavigate('register_pro')}
              className="bg-[#fc8127] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
            >
              Registrarme gratis
            </button>
          </div>
          {/* Elemento decorativo */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        </section>
      )}
    </div>
  );
};