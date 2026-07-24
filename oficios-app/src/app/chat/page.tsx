"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, MessageSquare, LayoutDashboard, Briefcase, 
  User, ChevronRight, Search 
} from 'lucide-react';

export default function ChatIndexPage() {
  const router = useRouter();

  // Lista simulada de chats
  const conversaciones = [
    { id: '1', nombre: 'Ricardo Gómez', ultimoMensaje: 'Nos vemos a las 14:30hs', tiempo: '10:15hs', noLeidos: 0 },
    { id: '2', nombre: 'Mariana Solís', ultimoMensaje: '¿A qué hora sale para la cañería?', tiempo: 'Ayer', noLeidos: 1 },
  ];

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/panel-profesional')}>
            <h1 className="font-extrabold text-xl text-[#00355f]">Oficios<span className="text-[#fc8127]">Ya</span></h1>
          </div>
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      {/* Navegación Lateral Desktop (Versión Profesional) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/panel-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><LayoutDashboard className="w-6 h-6" /></button>
        <button onClick={() => router.push('/mis-trabajos')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Briefcase className="w-6 h-6" /></button>
        <button className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center shadow-sm"><MessageSquare className="w-6 h-6" /></button>
        <div className="mt-auto mb-6">
          <button onClick={() => router.push('/configuracion-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 flex-grow w-full space-y-6">
        
        {/* Título y Buscador */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#00355f] mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>
        
        {/* Lista de Conversaciones */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {conversaciones.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-lg border border-gray-100">
                    {chat.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  {chat.noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#fc8127] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {chat.noLeidos}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#00355f]">{chat.nombre}</h4>
                  <p className={`text-sm mt-0.5 ${chat.noLeidos > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                    {chat.ultimoMensaje}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400">{chat.tiempo}</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom NavBar (Mobile - Profesional) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Dashboard</span>
        </button>
        <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mis Trabajos</span>
        </button>
        <button className="flex flex-col items-center text-[#fc8127] relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Mensajes</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>
    </div>
  );
}