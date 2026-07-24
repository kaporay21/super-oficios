"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, FileText, Star, Award, Zap, MessageSquare, 
  User, Home, Briefcase, PlusCircle, ArrowLeft, Loader2, ClipboardCheck
} from 'lucide-react';

export default function CompararPresupuestosPage() {
  const router = useRouter();
  const [aceptandoId, setAceptandoId] = useState<number | null>(null);

  // Lista de presupuestos recibidos (Simulados)
  const presupuestos = [
    {
      id: 1,
      nombre: 'Carlos Méndez',
      rating: 4.8,
      resenas: 124,
      precio: 12500,
      tiempo: '2 - 3 horas',
      etiqueta: 'Mejor Precio',
      etiquetaIcon: <Star className="w-4 h-4" />,
      etiquetaColor: 'bg-green-100 text-green-800',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJFksOrbm_vwGQaTq5Vuqr1acUBEH2jxptCR5CusLDf2Sb5qZ8fqxqznYXUigT9dEfKpCENJlHaLhC_WoPDhEQJYKRkRbxGiFrH2Jf4hrRkaq4pffxxwX2ietvZfajbBEyvOb665wnkChMjc88JXD3dUq70dprcIy22fOVZalBnuC390ApdZb18RNQjeSD56KQnd4KnVj3W9Vf6W_rfyL2JkZDhnRQLKr0smIh2slCZIjrr0crl5Ri-6h1zRMK70Hxc9PXqDijgpuj'
    },
    {
      id: 2,
      nombre: 'Lucía Ferreyra',
      rating: 5.0,
      resenas: 89,
      precio: 15000,
      tiempo: 'Hoy mismo',
      etiqueta: 'Más Recomendado',
      etiquetaIcon: <Award className="w-4 h-4" />,
      etiquetaColor: 'bg-orange-100 text-orange-800',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlVCn8FRzTbVmZxic91A-2Ugh1qFBfezVm0wqIKlK38GDjuh2U6BsS9cS4zgLxeCMeUJsDJTluGVvtCoxYzGLllutVL9VFc2SrplBpzopr-qWY5s5igTFagEH0SSVO1Guaku8KqEvFomdFF2iBq1jSsEvjwMlhS7AtAIIOo00YPiuGl-8phMWi49kjhbMIJlKx53XoXFj35c4I8CDVN5DTgxJLofVISU8aZNRfS6Q1mlob5-BG_hOeTLKJPogDS15WJ20ty764J5OU'
    },
    {
      id: 3,
      nombre: 'Roberto Gómez',
      rating: 4.6,
      resenas: 45,
      precio: 13800,
      tiempo: '1.5 horas',
      etiqueta: 'Más Rápido',
      etiquetaIcon: <Zap className="w-4 h-4" />,
      etiquetaColor: 'bg-blue-100 text-blue-800',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXiZUE8_fhvf-GjicTx03yLdFbwlLwUKVnmaCssfIfzN0czjPxP-_AvZc5N_Bp_ZMbeX3Redepy16tKrGYCxHSRu9VZPiYs73CHLhaWJAG9626Et5WY6Ehzzq9h-VPJ53uddMujQuXLO5bU9Sm-CYy9KqqH4InAr0ZjMbGLyImFjGmvjHTXRZvkDdMdOMa8Xx4rIgi0ltimCU_zlWg33HFoS5EnmtBiRepV3H67TzuHs9XqcsDmYvyJrgsWH0-EeCDxV1gySLESmM8'
    }
  ];

  const handleAceptar = (id: number) => {
    setAceptandoId(id);
    setTimeout(() => {
      setAceptandoId(null);
      router.push('/chat/1'); // Redirige al chat para coordinar
    }, 1500);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-20 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 md:pl-20">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          {/* Logo redirige al panel cliente */}
          <h1 onClick={() => router.push('/cliente')} className="text-xl font-black text-[#00355f] hidden sm:block cursor-pointer">
            Oficios<span className="text-[#fc8127]">Ya</span>
          </h1>
        </div>
        <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      {/* Navegación Lateral Desktop con Tooltips */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-200 z-50 flex-col items-center py-8 gap-6">
        <div className="mb-4">
           <span className="text-2xl">👷🏻‍♂️</span>
        </div>

        {/* Botón Home - Ahora apunta a /cliente */}
        <div className="relative group">
          <button onClick={() => router.push('/cliente')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
            <Home className="w-6 h-6" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#00355f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all origin-left whitespace-nowrap z-50">
            Explorar Oficios
          </span>
        </div>

        {/* Botón Mis Trabajos */}
        <div className="relative group">
          <button onClick={() => router.push('/perfil-cliente')} className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-6 h-6" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#00355f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all origin-left whitespace-nowrap z-50">
            Mis Solicitudes
          </span>
        </div>

        {/* Botón Publicar */}
        <div className="relative group">
          <button onClick={() => router.push('/publicar-trabajo')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
            <PlusCircle className="w-6 h-6" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#00355f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all origin-left whitespace-nowrap z-50">
            Publicar Trabajo
          </span>
        </div>

        {/* Botón Chat */}
        <div className="relative group">
          <button onClick={() => router.push('/chat')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
            <MessageSquare className="w-6 h-6" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#00355f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all origin-left whitespace-nowrap z-50">
            Mensajes
          </span>
        </div>

        {/* Botón Perfil */}
        <div className="mt-auto relative group">
          <button onClick={() => router.push('/perfil-cliente')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all">
            <User className="w-6 h-6" />
          </button>
          <span className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#00355f] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl transition-all origin-left whitespace-nowrap z-50">
            Mi Perfil
          </span>
        </div>
      </div>

      <main className="mt-20 flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-2 tracking-tight">Presupuestos Recibidos</h1>
          <p className="text-gray-500 text-sm mb-4 font-medium">Reparación de Cañería en Cocina</p>
          <div className="flex items-center gap-2 text-[#00355f] font-bold bg-white border border-gray-200 px-4 py-2.5 rounded-2xl w-fit shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-[#fc8127]" />
            <span>Hay {presupuestos.length} propuestas para vos</span>
          </div>
        </div>

        {/* Budget List */}
        <div className="space-y-6">
          {presupuestos.map((presu) => (
            <div key={presu.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              
              {/* Etiqueta Destacada */}
              <div className="absolute top-0 right-0">
                <span className={`${presu.etiquetaColor} font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm`}>
                  {presu.etiquetaIcon} {presu.etiqueta}
                </span>
              </div>

              {/* Perfil del Profesional */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                  <img className="w-full h-full object-cover" src={presu.avatar} alt={presu.nombre} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00355f] mb-1">{presu.nombre}</h3>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#fc8127] text-[#fc8127]" />
                    <span className="font-bold text-sm text-gray-900">{presu.rating}</span>
                    <span className="text-xs text-gray-400 font-medium">({presu.resenas} opiniones)</span>
                  </div>
                </div>
              </div>

              {/* Grid de Precio y Tiempo */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Costo Estimado</p>
                  <p className="text-2xl font-black text-[#00355f]">${presu.precio.toLocaleString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Disponibilidad</p>
                  <p className="text-lg font-bold text-gray-800">{presu.tiempo}</p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push(`/profesional/${presu.id}`)}
                  className="flex-1 border-2 border-[#00355f] text-[#00355f] font-bold text-sm py-3.5 rounded-xl hover:bg-blue-50 transition-colors active:scale-95"
                >
                  Ver Perfil
                </button>
                <button 
                  onClick={() => handleAceptar(presu.id)}
                  disabled={aceptandoId !== null}
                  className="flex-[1.5] bg-[#00355f] text-white font-bold text-sm py-3.5 rounded-xl shadow-md hover:bg-[#0f4c81] transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {aceptandoId === presu.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                  ) : (
                    'Elegir y Chatear'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-10 p-6 bg-gradient-to-br from-[#00355f] to-[#0a4270] rounded-[2rem] text-white flex gap-5 items-center shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <ClipboardCheck className="w-32 h-32" />
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-lg font-bold mb-1">Coordiná con tranquilidad</p>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed">
              Al aceptar una propuesta, se habilitará un chat privado con el profesional para que puedan coordinar la visita, los materiales y el horario del trabajo directamente.
            </p>
          </div>
        </div>

      </main>

      {/* Bottom NavBar (Mobile - Client Version) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {/* Botón Home apuntando a /cliente */}
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-[#fc8127]">
          <Briefcase className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Trabajos</span>
        </button>
        <button onClick={() => router.push('/publicar-trabajo')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Publicar</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] relative">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>

    </div>
  );
}