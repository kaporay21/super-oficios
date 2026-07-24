"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, MapPin, CheckCircle, Wrench, 
  CreditCard, HelpCircle, LogOut, ChevronRight, Search, 
  Briefcase, MessageSquare, User, Plus
} from 'lucide-react';

export default function PerfilClientePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7fafc] pb-24 md:pb-8 font-sans text-gray-900">
      
      {/* Top AppBar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-40 h-16 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full text-[#00355f]">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
               <span className="text-lg">👷🏻‍♂️</span>
            </div>
            <h1 className="font-bold text-lg text-[#00355f] leading-none">Oficios<span className="text-[#fc8127]">Ya</span></h1>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPlP1RYjs-YVXv6bhKYI80CLPfO6ZYQToOLFLwJiEhYJVIenHH0IZzwo5yHxBJFWHDYLFqbktJlGOw9hPhWwYWvHyHASULSQ3Uymklt0eieEzeY898-DjtfZBJlk4lIZRs7duluvkN-om61Ifx4Xl8tuGoeZpqRjEb4lubv0E8RxNnPC-T9Xh0dKHqY2Vh7oDHEjc2ejJkgF9TiXuidQhXc9-dcJ4vqJRN7FFG4mTmvGq0g-rFoexogpWVlATC8Q9L175SApbNC16s" alt="Perfil" className="w-full h-full object-cover" />
        </div>
      </header>

      <div className="pt-20 px-4 max-w-lg mx-auto">
        {/* Profile Header */}
        <section className="mb-8 text-center">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas" alt="Diego" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#7efba4] text-[#003c1b] p-1 rounded-full border-2 border-white">
              <CheckCircle className="w-4 h-4 fill-current" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#00355f]">Diego Martínez</h2>
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>Buenos Aires, Argentina</span>
          </div>
          <div className="mt-3 inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Cliente Verificado
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="text-2xl font-bold text-[#00355f]">24</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">Trabajos Solicitados</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="text-2xl font-bold text-[#fc8127]">12</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">Presupuestos</span>
          </div>
        </section>

        {/* --- NUEVO BOTÓN PARA PUBLICAR --- */}
        <button 
          onClick={() => router.push('/publicar-trabajo')}
          className="w-full bg-[#fc8127] hover:bg-[#e06b16] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-8 shadow-md active:scale-95 transition-all"
        >
          <span className="text-2xl leading-none font-normal">+</span> 
          Publicar Nuevo Trabajo
        </button>

        {/* Active Jobs */}
        <section className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Trabajos en curso</h3>
          <div 
            onClick={() => router.push('/chat/8821')} 
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900">Reparación de Grifería</h4>
                <p className="text-sm text-gray-500">Cocina principal - Goteo persistente</p>
              </div>
              <span className="bg-[#ffdbc8] text-[#602a00] font-bold text-[10px] px-2 py-1 rounded-md">Pendiente</span>
            </div>
            <div className="flex items-center gap-2 mt-4 border-t pt-4 text-gray-600">
              <Wrench className="w-5 h-5 text-[#00355f]" />
              <span className="text-sm">Esperando confirmación de Pro</span>
            </div>
          </div>
        </section>

        {/* Configuración */}
        <section className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3">Configuración</h3>
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            <ConfigItem icon={CreditCard} label="Métodos de Pago" />
            <ConfigItem icon={MapPin} label="Direcciones Guardadas" />
            <ConfigItem icon={HelpCircle} label="Centro de Ayuda" />
            <ConfigItem icon={LogOut} label="Cerrar Sesión" color="text-red-500" />
          </div>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 md:hidden">
        <NavButton icon={Search} label="Explorar" />
        <NavButton icon={Plus} label="Publicar" onClick={() => router.push('/publicar-trabajo')} />
        <NavButton icon={MessageSquare} label="Mensajes" />
        <NavButton icon={User} label="Perfil" active />
      </nav>
    </main>
  );
}

function ConfigItem({ icon: Icon, label, color = "text-[#00355f]" }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className={`flex items-center gap-3 ${color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 ${active ? 'text-[#fc8127]' : 'text-gray-400'}`}
    >
      <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}