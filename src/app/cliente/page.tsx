"use client";

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, MessageSquare, Plus, Bell, Menu, Home, ClipboardList, User, Sparkles, Wrench, Zap, Paintbrush, Building, ChevronRight, ShieldAlert } from 'lucide-react';
import { Screen, Professional, Job } from '@/types';
import { useRouter } from 'next/navigation';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';

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

  const [clientProfile, setClientProfile] = useState<any>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

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
        const [allJobs, allPostulaciones] = await Promise.all([
          dbHelper.getJobs().catch(() => []),
          dbHelper.getAllPostulaciones().catch(() => [])
        ]);

        const clientJobs = (clientName || userId
          ? allJobs.filter((j: any) => j.empleador === clientName || j.user_id === userId)
          : allJobs
        ).map((j: any) => {
          const count = allPostulaciones.filter((p: any) => String(p.empleoId) === String(j.id) || String(p.trabajoId) === String(j.id)).length;
          return {
            ...j,
            presupuestosCount: count
          };
        });
        setMyJobs(clientJobs);
      } catch (error) {
        console.error("Error al cargar trabajos:", error);
      }

      if (userId) {
        try {
          const notifs = await dbHelper.getNotificaciones(userId);
          const unread = notifs.filter((n: any) => !n.leida).length;
          setUnreadNotifsCount(unread);
        } catch (e) {
          setUnreadNotifsCount(0);
        }
      }

      try {
        const users = await dbHelper.getAllUsers();
        const pros = users.filter((u: any) => u.role === 'Profesional');
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
              <img src={clientProfile?.fotoPerfil || "https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas"} alt="Perfil" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
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

      {/* Navegación Inferior */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 z-50 pb-safe">
        <div className="max-w-7xl mx-auto w-full flex justify-between md:justify-center md:gap-24 items-center">
          <Tooltip text="Explorar" position="top">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="text-[#00355f] p-1.5">
                <Home className="w-6 h-6 fill-current" />
              </div>
              <span className="text-[11px] font-bold text-[#00355f]">Explorar</span>
            </div>
          </Tooltip>

          <Tooltip text="Mi Hogar" position="top">
            <div 
              onClick={() => router.push('/mi-hogar')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#fc8127] cursor-pointer transition-colors active:scale-95"
            >
              <div className="p-1.5">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium">Mi Hogar</span>
            </div>
          </Tooltip>

          <Tooltip text="Publicar trabajo" position="top">
            <div 
              onClick={() => handleNavigate('publish_job')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#fc8127] cursor-pointer transition-colors active:scale-95"
            >
              <div className="p-1.5">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium">Publicar</span>
            </div>
          </Tooltip>

          <Tooltip text="Notificaciones" position="top">
            <div 
              onClick={() => router.push('/notificaciones')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer relative"
            >
              <div className="p-1.5 relative">
                <Bell className="w-6 h-6" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <span className="text-[11px] font-medium">Notificaciones</span>
            </div>
          </Tooltip>

          <Tooltip text="Mi perfil" position="top">
            <div 
              onClick={() => router.push('/perfil-cliente')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00355f] cursor-pointer transition-colors active:scale-95"
            >
              <div className="p-1.5 relative">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-medium">Perfil</span>
            </div>
          </Tooltip>
        </div>
      </nav>

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
    { id: 'plomeria', label: 'Plomería' },
    { id: 'electricidad', label: 'Electricidad' },
    { id: 'albanileria', label: 'Albañilería' },
    { id: 'pintura', label: 'Pintura' },
    { id: 'carpinteria', label: 'Carpintería' },
  ];

  const CAROUSEL_CARDS = [
    { id: 'plomeria', label: 'Plomería', img: '/images/oficio_plomeria_m_1784427462868.png', color: 'from-[#00355f]/90' },
    { id: 'electricidad', label: 'Electricidad', img: '/images/oficio_electricidad_m_1784427470881.png', color: 'from-[#fc8127]/90' },
    { id: 'albanileria', label: 'Albañilería', img: '/images/oficio_albanileria_m_1784427479131.png', color: 'from-[#00355f]/90' },
    { id: 'pintura', label: 'Pintura', img: '/images/oficio_pintura_m_1784427486978.png', color: 'from-[#fc8127]/90' },
    { id: 'carpinteria', label: 'Carpintería', img: '/images/oficio_carpinteria_1784426158760.png', color: 'from-[#00355f]/90' },
    { id: 'jardineria', label: 'Jardinería', img: '/images/oficio_jardineria_1784426924675.png', color: 'from-[#fc8127]/90' },
    { id: 'limpieza', label: 'Limpieza', img: '/images/oficio_limpieza_1784426932346.png', color: 'from-[#00355f]/90' },
  ];

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
      <section className="text-center bg-white py-12 px-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#00355f] leading-tight">
          Encontrá al profesional que necesitás hoy
        </h1>
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          Conectamos tus necesidades con expertos verificados y de confianza en tu zona.
        </p>
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

      {/* Tus Pedidos Activos */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-gray-200 pb-2">
          <h3 className="text-xl font-bold text-[#00355f]">Tus Pedidos Activos</h3>
          <button onClick={() => onNavigate('profile_client')} className="font-bold text-sm hover:underline text-[#00355f]">
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          {postedJobs.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-white border border-gray-100 rounded-2xl text-gray-500">
              Todavía no has publicado ningún trabajo. ¡Publicá uno para empezar!
            </div>
          ) : postedJobs.map((job: any, index: number) => (
            <div 
              key={job.id}
              onClick={() => onNavigate('job_detail')}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-[#fc8127]/50 transition-all cursor-pointer flex flex-col justify-between relative"
            >
              {/* Globo de notificaciones de presupuestos reales desde Supabase */}
              {job.presupuestosCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-[#fc8127] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white z-10 animate-pulse">
                  {job.presupuestosCount} {job.presupuestosCount === 1 ? 'Presupuesto' : 'Presupuestos'}
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-[#00355f]" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    job.urgente ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#00355f]'
                  }`}>
                    {job.urgente ? 'Urgente' : 'Normal'}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{job.titulo || job.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{job.descripcion || job.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-50">
                <span className="text-[11px] text-gray-400">{job.tiempo || job.timeAgo || 'Reciente'}</span>
                <span className="text-[#00355f] font-bold text-xs hover:underline">Detalles</span>
              </div>
            </div>
          ))}
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
                      <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-green-700 text-green-700" />
                        <span className="font-bold text-xs text-green-700">{pro.rating.toFixed(1)}</span>
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
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-3 mb-5">
                          <MapPin className="w-4 h-4 text-[#00355f]" />
                          <span>{pro.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2.5 bg-[#00355f] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#0f4c81] transition-colors active:scale-95">
                          Contactar
                        </button>
                        <button className="px-4 py-2.5 border border-gray-200 rounded-xl text-[#00355f] hover:bg-gray-50 transition-colors active:scale-95 flex items-center justify-center">
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