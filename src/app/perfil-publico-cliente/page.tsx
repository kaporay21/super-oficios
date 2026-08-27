"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, MapPin, Calendar, Star, StarHalf, 
  Lock, BookmarkPlus, LayoutDashboard, Briefcase,
  MessageSquare, User, CheckCircle
} from 'lucide-react';
import Logo from '@/components/Logo';

import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function PerfilPublicoClientePage() {
  const router = useRouter();
  const { user, profile: authProfile } = useAuth();
  
  // Perfil del cliente dinámico
  const [perfil, setPerfil] = useState<any>({
    nombre: 'Cliente',
    ubicacion: 'Argentina',
    verificado: false,
    trabajosSolicitados: 0,
    presupuestosRecibidos: 0,
    avatar: 'https://i.pravatar.cc/150?u=user',
    miembroDesde: 'Reciente',
    descripcion: ''
  });

  useEffect(() => {
    if (!authProfile) return;
    const loadRealClientProfile = async () => {
      try {
        const allJobs = await dbHelper.getJobs();
        const myJobs = allJobs.filter((j: any) => j.empleador === authProfile.nombre || j.empleador_id === authProfile.id);
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
          descripcion: authProfile.biografia || 'Cliente registrado en la plataforma OficiosYa.'
        });
      } catch (e) {
        console.error("Error al cargar perfil público de cliente:", e);
      }
    };
    loadRealClientProfile();
  }, [authProfile]);

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0 selection:bg-[#0f4c81] selection:text-white">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 text-[#00355f]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="sm" theme="light" />
        </div>
        <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Profile Header Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm bg-gray-100">
                <img 
                  className="w-full h-full object-cover" 
                  src={perfil.avatar} 
                  alt="Perfil del Cliente" 
                />
              </div>
              {perfil.verificado && (
                <div className="absolute bottom-1 -right-2 bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1 shadow-md border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-700" />
                  <span className="text-[10px] font-bold tracking-wider">VERIFICADO</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f]">{perfil.nombre}</h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#fc8127]" />
                  <span className="font-semibold">{perfil.ubicacion}</span>
                </div>
                <span className="hidden md:inline">•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">Miembro desde {perfil.miembroDesde}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed pt-2">
                {perfil.descripcion || 'Sin descripción disponible.'}
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-[#00355f] text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-lg">
            <h3 className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest mb-4">Reputación Cliente</h3>
            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-5xl font-extrabold leading-none">4.9</span>
                <div className="flex text-[#fc8127] pb-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <StarHalf className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-sm text-blue-100">Basado en 24 valoraciones</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-100">Trabajos Publicados</span>
                <span className="text-2xl font-bold">{perfil.trabajosSolicitados}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Reviews & Feedback */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#00355f]">Opiniones de Profesionales</h3>
            <button className="text-[#fc8127] font-bold text-sm hover:underline">Ver todas</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Review 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#00355f] font-bold text-sm">CP</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Carlos P.</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Electricista</p>
                  </div>
                </div>
                <div className="flex text-[#fc8127]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed">"Muy claro con lo que necesitaba. El pago fue inmediato una vez finalizado el trabajo. Recomiendo."</p>
            </div>

            {/* Review 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm">ML</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Maria L.</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Pintora</p>
                  </div>
                </div>
                <div className="flex text-[#fc8127]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed">"Respetuoso y puntual. Los materiales estaban listos tal como acordamos. Gran cliente."</p>
            </div>

            {/* Review 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#fc8127] font-bold text-sm">JS</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Jorge S.</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Plomero</p>
                  </div>
                </div>
                <div className="flex text-[#fc8127]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed">"Buena comunicación aunque tardó un poco en responder al principio. El resto excelente."</p>
            </div>

          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-10 p-6 bg-blue-50 border border-dashed border-blue-200 rounded-2xl flex items-start gap-4">
          <Lock className="w-6 h-6 text-[#00355f] shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-[#00355f] mb-1">Información Protegida</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Los datos de contacto (teléfono y email) solo serán visibles una vez que {perfil.nombre.split(' ')[0]} acepte tu presupuesto o se inicie una contratación formal para proteger la privacidad de ambas partes.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <button className="flex-1 border-2 border-[#00355f] text-[#00355f] hover:bg-blue-50 py-4 px-6 rounded-xl font-bold active:scale-[0.98] transition-all flex justify-center items-center gap-2">
            <BookmarkPlus className="w-5 h-5" /> Guardar Perfil
          </button>
        </div>

      </main>

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Dashboard</span>
        </button>
        <button onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center text-[#fc8127] cursor-pointer">
          <Briefcase className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Muro</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] cursor-pointer">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-1">Mensajes</span>
        </button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f] cursor-pointer">
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}