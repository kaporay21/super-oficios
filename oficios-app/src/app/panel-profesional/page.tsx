"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Edit2, Calendar, FileText, TrendingUp, 
  Zap, Clock, ChevronRight, Wrench, Paintbrush, 
  CheckCircle, ShieldCheck, Timer, LayoutDashboard, 
  Briefcase, MessageSquare, User, Plus, Settings, BarChart2,
  Hammer, Grid, ImagePlus, Star, Crown
} from 'lucide-react';

export default function PanelProfesionalPage() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <main className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans overflow-x-hidden md:pl-20 pb-24 md:pb-0">
      
      {/* Top AppBar */}
      <header className="bg-white border-b border-gray-200 shadow-sm w-full top-0 sticky z-40 flex justify-between items-center px-4 md:px-8 h-16 md:h-20">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
             <span className="text-xl">👷🏻‍♂️</span>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-extrabold text-lg md:text-xl text-[#00355f] leading-none">
              Oficios<span className="text-[#fc8127]">Ya</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/notificaciones')}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer" onClick={() => router.push('/configuracion-profesional')}>
            <img 
              className="w-full h-full object-cover" 
              alt="Perfil de Roberto" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1W2fOmSq-AynqbO3ZoWLKh_XWhnamU4gzNipXAwgMd19QXjrLW74lvJpK-ZQeavvPt4luRYD7mhyI0qQuA6QCs8afpj3cqqLqgCs6S4po0rIeUYesugVkfTIMWiABeNBgEH8TIKJHiZdH_Pv9DLWbTS8ggXJkSpU6taEOfoFmwVs-S04n62fGxmqyzsGqJSR4eb_sNOrD5MTYiXByZcjscbg4QHwR8TpMzDU7dtp1JrFSPFMp9pBSecyG65yj2h2KnVBnkMvHuipY"
            />
          </div>
        </div>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <div className="hidden md:flex fixed left-0 top-20 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button className="w-12 h-12 bg-[#fc8127] text-white rounded-xl flex items-center justify-center shadow-md">
          <LayoutDashboard className="w-6 h-6" />
        </button>
        
        {/* Acceso directo al Muro de Trabajos */}
        <div className="relative group">
          <button 
            onClick={() => router.push('/muro-trabajos')}
            className="w-12 h-12 text-gray-400 hover:text-[#fc8127] hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
          >
            <Grid className="w-6 h-6" />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#00355f] text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
            Muro de trabajos
          </div>
        </div>
        
        {/* Maletita con tooltip de Mis Trabajos */}
        <div className="relative group">
          <button 
            onClick={() => router.push('/mis-trabajos')}
            className="w-12 h-12 text-gray-400 hover:text-[#fc8127] hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
          >
            <Briefcase className="w-6 h-6" />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#00355f] text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
            Mis trabajos
          </div>
        </div>

        {/* Mensajes conectado a Chat */}
        <button 
          onClick={() => router.push('/chat')}
          className="w-12 h-12 text-gray-400 hover:text-[#00355f] hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
          title="Mensajes"
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        {/* Muñequito / Perfil conectado a configuracion-profesional */}
        <div className="mt-auto mb-6 relative group">
          <button 
            onClick={() => router.push('/configuracion-profesional')} 
            className="w-12 h-12 text-gray-400 hover:text-[#00355f] hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors active:scale-95"
          >
            <User className="w-6 h-6" />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#00355f] text-white text-xs font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
            Configuración
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Welcome & Quick Actions */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Hola, Roberto</h2>
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
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
            <div className="p-4 bg-orange-50 text-[#fc8127] rounded-full shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Presupuestos</p>
              <p className="text-3xl font-bold text-gray-900">04</p>
            </div>
          </div>
          
          <div className="bg-[#00355f] text-white p-6 rounded-2xl shadow-lg flex items-center gap-6 relative overflow-hidden">
            <div className="p-4 bg-white/20 text-white rounded-full shrink-0 z-10">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="z-10">
              <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">Ganancias Mes</p>
              <p className="text-3xl font-bold text-white">$124.500</p>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10">
               <TrendingUp className="w-40 h-40" />
            </div>
          </div>
        </section>

        {/* Banner de Suscripción (Agregado) */}
        <div className="bg-gradient-to-r from-[#00355f] to-[#0f4c81] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
              <Crown className="w-7 h-7 text-[#fc8127]" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">¡Destacá tu perfil y ganá más clientes!</h3>
              <p className="text-blue-100 text-sm">Pasate a un plan superior para tener postulaciones ilimitadas y aparecer primero.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/planes')} 
            className="w-full md:w-auto shrink-0 bg-[#fc8127] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#e67320] active:scale-95 transition-all whitespace-nowrap"
          >
            Ver Planes
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Jobs Section */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Trabajos en curso</h3>
              <button onClick={() => router.push('/mis-trabajos')} className="text-[#00355f] font-bold text-sm hover:underline">Ver todos</button>
            </div>
            
            <div className="space-y-4" onClick={() => router.push('/mis-trabajos')}>
              {/* Job Card 1 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-[#00355f]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg">Instalación Eléctrica Residencial</h4>
                    <p className="text-sm text-gray-500">Calle Falsa 123, CABA</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Hoy, 14:00hs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-[11px] rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Confirmado
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench className="w-6 h-6 text-[#00355f]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg">Reparación de Cañería Cocina</h4>
                    <p className="text-sm text-gray-500">Av. Corrientes 4500, Almagro</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Mañana, 09:30hs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                  <span className="px-3 py-1 bg-orange-100 text-[#fc8127] font-bold text-[11px] rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#fc8127] rounded-full animate-pulse"></span> Pendiente Inicio
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Job Card 3 */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Paintbrush className="w-6 h-6 text-[#00355f]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg">Pintura Fachada Edificio</h4>
                    <p className="text-sm text-gray-500">Rivadavia 12000, Liniers</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Lunes 22, 08:00hs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-[11px] rounded-full">
                    Presupuestado
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
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
                  <span className="text-5xl font-bold leading-none">4.9</span>
                </div>
                <p className="text-sm text-blue-100 mt-3">¡Excelente! Estás en el top 5% de profesionales de tu zona.</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Trabajos Finalizados</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">142</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#fc8127]" />
                    <span className="text-sm font-medium text-gray-700">Reseñas Positivas</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">128</span>
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-[#00355f]" />
                    <span className="text-sm font-medium text-gray-700">Tasa de Respuesta</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">98%</span>
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
      </div>

      {/* Floating Action Button */}
      <button onClick={() => router.push('/muro-trabajos')} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#fc8127] text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform">
        <Grid className="w-7 h-7" />
      </button>

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
        <div onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </div>
        <div 
          onClick={() => router.push('/configuracion-profesional')}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Ajustes</span>
        </div>
      </nav>
    </main>
  );
}