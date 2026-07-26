"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, MapPin, CheckCircle, Wrench, 
  HelpCircle, LogOut, ChevronRight, Search, 
  Briefcase, MessageSquare, User, Plus, X, Settings, Star, ArrowRight
} from 'lucide-react';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, logout as doLogout } from '@/lib/supabase';

const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

const OFICIOS = [
  { id: 'todos', label: 'Todos los oficios' },
  { id: 'plomeria', label: 'Plomería' },
  { id: 'electricidad', label: 'Electricidad' },
  { id: 'albanileria', label: 'Albañilería' },
  { id: 'pintura', label: 'Pintura' },
  { id: 'carpinteria', label: 'Carpintería' },
];

export default function PerfilClientePage() {
  return (
    <AuthGuard requiredRole="cliente">
      <PerfilClienteContent />
    </AuthGuard>
  );
}

function PerfilClienteContent() {
  const router = useRouter();
  const { profile: authProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchProvince, setSearchProvince] = useState('');
  const [searchTrade, setSearchTrade] = useState('todos');

  const handleSearchPros = () => {
    const params = new URLSearchParams();
    if (searchProvince) params.append('provincia', searchProvince);
    if (searchTrade && searchTrade !== 'todos') params.append('oficio', searchTrade);
    router.push(`/cliente?${params.toString()}`);
  };
  const [misTrabajos, setMisTrabajos] = useState<any[]>([]);
  const [perfil, setPerfil] = useState<any>({
    nombre: '',
    ubicacion: '',
    verificado: false,
    trabajosSolicitados: 0,
    presupuestosRecibidos: 0,
    avatar: '',
    miembroDesde: '',
    descripcion: ''
  });

  // Cargar perfil y datos reales desde Supabase DB
  useEffect(() => {
    if (!authProfile) return;
    const loadRealData = async () => {
      try {
        const allJobs = await dbHelper.getJobs();
        const myJobs = allJobs.filter((j: any) => j.empleador === authProfile.nombre || j.empleador_id === authProfile.id);
        setMisTrabajos(myJobs);

        const allApps = await dbHelper.getAllPostulaciones();
        const myApps = allApps.filter((p: any) => myJobs.some((j: any) => String(j.id) === String(p.empleoId)));

        setPerfil({
          nombre: authProfile.nombre || 'Cliente',
          ubicacion: authProfile.ciudad && authProfile.provincia ? `${authProfile.ciudad}, ${authProfile.provincia}` : (authProfile.provincia || 'Argentina'),
          verificado: authProfile.verificado || false,
          trabajosSolicitados: myJobs.length,
          presupuestosRecibidos: myApps.length,
          avatar: authProfile.foto_perfil || authProfile.fotoPerfil || 'https://i.pravatar.cc/150?u=' + authProfile.id,
          miembroDesde: authProfile.created_at ? new Date(authProfile.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : 'Reciente',
          descripcion: authProfile.biografia || ''
        });
      } catch (e) {
        console.error("Error al cargar datos reales del cliente:", e);
      }
    };
    loadRealData();
  }, [authProfile]);

  const handleLogout = async () => {
    await doLogout();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-[#f7fafc] pb-24 md:pb-8 font-sans text-gray-900 selection:bg-[#0f4c81] selection:text-white relative animate-fade-in flex flex-col justify-between">
      
      {/* Drawer / Menú Lateral de Hamburguesa */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMenuOpen(false)} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          ></div>
          
          {/* Contenedor del Menú */}
          <div className="relative flex flex-col w-80 max-w-sm bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {/* Header Drawer */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <Logo size="sm" theme="light" />
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Perfil Mini en Menú */}
            <div className="p-6 bg-gradient-to-br from-[#00355f] to-[#0f4c81] text-white flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shrink-0 bg-white/10">
                <img src={perfil.avatar} alt={perfil.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">{perfil.nombre}</h4>
                <div className="flex items-center gap-1 mt-0.5 text-blue-100 text-[10px]">
                  <CheckCircle className="w-3.5 h-3.5 fill-current text-[#7efba4]" />
                  <span className="font-semibold text-[#7efba4]">Cliente Verificado</span>
                </div>
              </div>
            </div>

            {/* Listado de Opciones del Sidebar */}
            <div className="flex-1 py-4 overflow-y-auto divide-y divide-gray-50">
              <div className="pb-3 px-2 space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/cliente'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#00355f] rounded-xl transition-all"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                  Buscar Oficios / Profesionales
                </button>
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/perfil-publico-cliente'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#00355f] rounded-xl transition-all"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  Ver Perfil Público
                </button>
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/configuracion-cliente'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#00355f] rounded-xl transition-all"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  Editar Perfil / Configuración
                </button>
              </div>

              <div className="pt-3 px-2 space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/soporte'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#00355f] rounded-xl transition-all"
                >
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  Centro de Ayuda / Soporte
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
            
            {/* Footer Drawer */}
            <div className="p-4 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">OficiosYa v1.2</span>
            </div>
          </div>
        </div>
      )}

      {/* Top AppBar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-40 h-16 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full text-[#00355f] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="sm" theme="light" />
          </div>
        </div>
        <div 
          onClick={() => router.push('/configuracion-cliente')}
          className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <img src={perfil.avatar} alt="Perfil" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Content Container: Responsive Dual Column on PC */}
      <div className="pt-20 px-4 max-w-6xl mx-auto w-full flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-start justify-center">
          
          {/* Left Column: Profile Card, Stats, Active Jobs, Settings */}
          <div className="lg:col-span-5 space-y-6 w-full max-w-lg mx-auto lg:mx-0">
            {/* Profile Header */}
            <section className="text-center animate-in fade-in slide-in-from-top-4 duration-500 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto">
                  <img src={perfil.avatar} alt={perfil.nombre} className="w-full h-full object-cover" />
                </div>
                {perfil.verificado && (
                  <div className="absolute bottom-0 right-0 bg-[#7efba4] text-[#003c1b] p-1 rounded-full border-2 border-white shadow-sm">
                    <CheckCircle className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#00355f]">{perfil.nombre || 'Cliente'}</h2>
              <div className="flex items-center justify-center gap-1 text-gray-500 text-xs font-semibold mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#fc8127]" />
                <span>{perfil.ubicacion || 'Argentina'}</span>
              </div>
              <div className="mt-3 inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-200">
                Cliente Verificado
              </div>
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col items-center">
                <span className="text-2xl font-black text-[#00355f]">{perfil.trabajosSolicitados}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center mt-1">Trabajos Solicitados</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col items-center">
                <span className="text-2xl font-black text-[#fc8127]">{perfil.presupuestosRecibidos}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center mt-1">Presupuestos</span>
              </div>
            </section>

            {/* --- BOTÓN PARA PUBLICAR --- */}
            <button 
              onClick={() => router.push('/publicar-trabajo')}
              className="w-full bg-[#fc8127] hover:bg-[#e06b16] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-2xl leading-none font-normal">+</span> 
              Publicar Nuevo Trabajo
            </button>

            {/* Active Jobs */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Trabajos en curso</h3>
                <button onClick={() => router.push('/muro-trabajos')} className="text-xs font-bold text-[#00355f] hover:underline cursor-pointer">Ver muro</button>
              </div>
              
              {misTrabajos.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-center">
                  <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No tenés trabajos publicados aún</p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">Publicá tu primer requerimiento para recibir presupuestos de profesionales.</p>
                  <button 
                    onClick={() => router.push('/publicar-trabajo')}
                    className="text-xs font-bold text-[#fc8127] hover:underline"
                  >
                    + Publicar Trabajo
                  </button>
                </div>
              ) : (
                misTrabajos.slice(0, 3).map((job) => (
                  <div 
                    key={job.id}
                    onClick={() => router.push('/muro-trabajos')} 
                    className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm relative cursor-pointer hover:shadow-md hover:border-[#00355f]/30 transition-all duration-200 group mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#00355f] transition-colors">{job.titulo}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{job.ciudad ? `${job.ciudad}, ${job.provincia}` : job.categoria}</p>
                      </div>
                      <span className="bg-orange-100 text-[#fc8127] font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-md">
                        {job.urgencia || 'Activo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#00355f]" />
                        <span className="text-xs font-semibold text-gray-700">Publicado</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* --- BANNER BOLSA DE EMPLEO Y BUSCADOR --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <section className="bg-gradient-to-r from-[#00355f] to-[#1a5fa8] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group cursor-pointer flex flex-col justify-between animate-in duration-200" onClick={() => router.push('/bolsa-empleo')}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-[#fc8127]" />
                    <h3 className="font-bold text-base">Bolsa de Empleo</h3>
                    <span className="bg-[#fc8127] text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full">Nuevo</span>
                  </div>
                  <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                    ¿Buscás trabajo? Postulate a cientos de ofertas de profesionales en tu zona hoy mismo.
                  </p>
                  <div className="flex gap-2.5">
                    <button onClick={(e) => { e.stopPropagation(); router.push('/bolsa-empleo'); }} className="bg-white text-[#00355f] px-3.5 py-2 rounded-xl text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                      Ver Empleos
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); router.push('/mis-postulaciones'); }} className="bg-white/20 text-white px-3.5 py-2 rounded-xl text-[11px] font-bold hover:bg-white/30 transition-colors cursor-pointer">
                      Mis Postulaciones
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-[#fc8127] to-[#e67320] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group flex flex-col justify-between animate-in duration-200">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-white" />
                      <h3 className="font-bold text-base text-white">Buscar Especialistas</h3>
                    </div>
                    <p className="text-orange-100 text-[11px] mb-3 leading-relaxed">
                      Encontrá los mejores profesionales verificados en tu zona.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <select
                      value={searchProvince}
                      onChange={(e) => setSearchProvince(e.target.value)}
                      className="w-full py-1.5 px-3 bg-white/90 backdrop-blur-sm border border-transparent rounded-lg text-gray-800 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer"
                    >
                      <option value="">Todas las provincias</option>
                      {PROVINCIAS.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>

                    <select
                      value={searchTrade}
                      onChange={(e) => setSearchTrade(e.target.value)}
                      className="w-full py-1.5 px-3 bg-white/90 backdrop-blur-sm border border-transparent rounded-lg text-gray-800 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer"
                    >
                      {OFICIOS.map((oficio) => (
                        <option key={oficio.id} value={oficio.id}>{oficio.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleSearchPros}
                    className="mt-3.5 w-full bg-white text-[#fc8127] hover:bg-orange-50/95 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Buscar Ahora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

            </div>
          </div>

          {/* Right Column: Platform Benefits Grid (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6 bg-white p-8 rounded-3xl border border-gray-150 shadow-sm animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-2">
              <span className="inline-flex px-4 py-1.5 bg-[#00355f]/10 text-[#00355f] text-xs font-black rounded-full uppercase tracking-wider">
                Beneficios Activos de tu Cuenta
              </span>
              <h3 className="text-2xl font-black text-[#00355f]">
                ¡Sácale el máximo provecho a <span className="text-[#fc8127]">OficiosYa</span>!
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Como miembro registrado, tienes acceso completo a todas nuestras herramientas diseñadas para simplificar las tareas de mantenimiento y reparaciones en tu hogar.
              </p>
            </div>

            {/* Grilla de Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-blue-50 text-[#00355f] rounded-lg shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#00355f]">Recibí múltiples presupuestos</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Publicá tu necesidad totalmente gratis y compará propuestas de mano de obra en minutos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-orange-50 text-[#fc8127] rounded-lg shrink-0">
                  <Star className="w-5 h-5 fill-[#fc8127] text-[#fc8127]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#00355f]">Elegí por mejores reseñas</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Revisá la experiencia de otros clientes, calificaciones y fotos de trabajos previos de cada profesional.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-green-50 text-green-700 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#00355f]">Profesionales en tu provincia</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Encontrá electricistas, plomeros, albañiles, pintores y más especialidades cerca de tu ubicación.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-lg shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#00355f]">Chat rápido e inmediato</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Conversá directamente con los profesionales para coordinar visitas técnicas, presupuestos y materiales.
                  </p>
                </div>
              </div>

            </div>

            {/* Info Box Decorativo */}
            <div className="mt-4 p-5 bg-gradient-to-br from-[#00355f] to-[#0f4c81] rounded-2xl text-white flex gap-4 items-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                <CheckCircle className="w-6 h-6 text-[#7efba4] fill-[#7efba4]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Tu cuenta de cliente está verificada</p>
                <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                  Disfrutás de contacto directo ilimitado con profesionales calificados y soporte local prioritario las 24 horas.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavButton icon={Search} label="Explorar" onClick={() => router.push('/cliente')} />
        <NavButton icon={Plus} label="Publicar" onClick={() => router.push('/publicar-trabajo')} />
        <NavButton icon={MessageSquare} label="Mensajes" onClick={() => router.push('/chat')} />
        <NavButton icon={User} label="Perfil" active />
      </nav>
    </main>
  );
}

function ConfigItem({ icon: Icon, label, onClick, color = "text-[#00355f]" }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left group">
      <div className={`flex items-center gap-3 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-bold text-xs text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 ${active ? 'text-[#fc8127]' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}