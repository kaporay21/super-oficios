"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';

export default function BienvenidaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'client' | 'pro' | null>(null);

  const handleSelectRole = (role: 'client' | 'pro') => {
    setSelected(role);
    setTimeout(() => {
      if (role === 'client') {
        router.push('/registro-cliente'); 
      } else {
        router.push('/registro-profesional'); 
      }
    }, 400);
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#0f4c81]/5 via-transparent to-[#fc8127]/5 text-gray-900 flex flex-col font-sans selection:bg-[#00355f] selection:text-white">
      
      {/* Header / Logo */}
      <header className="w-full pt-10 pb-6 px-4 flex flex-col items-center select-none">
        <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="lg" theme="light" />
        </div>
        <p className="text-sm text-gray-500 text-center max-w-md font-medium">
          Tu conexión directa con expertos y soluciones para el hogar.
        </p>
      </header>

      {/* Main Selection Area */}
      <div className="flex-grow flex items-center justify-center px-4 pb-16">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-1.5 tracking-tight">Elige tu perfil</h2>
            <p className="text-sm text-gray-500 font-medium">Personaliza tu experiencia en la plataforma</p>
          </div>

          {/* Grid de Selección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Tarjeta: Profesional (Quiero Trabajar) */}
            <button 
              onClick={() => handleSelectRole('pro')}
              className={`group relative flex flex-col items-start p-6 bg-white rounded-2xl border transition-all duration-300 text-left h-full shadow-sm hover:-translate-y-1 hover:shadow-md ${
                selected === 'pro' 
                  ? 'border-[#00355f] ring-2 ring-[#00355f]/20 bg-blue-50/10' 
                  : 'border-gray-200 hover:border-[#fc8127]/50'
              }`}
            >
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 relative bg-[#fc8127]/5 shadow-inner">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Soy Profesional"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALmherkdYId1uWtw1SOTXlnJ0aFBOV-fhJjAIRyZudBWQV8VWzkQhHBPN8RddDw18mj94yja4xjnoU_hJ1Ric0HM9dDyjEHVSDBIcJZWmm_lpR-agYKKY3uNN01PalRJ1GJNbfwI_x_OmsY-hfRdI4EKsE7FLGKsdKiqHWZ9FTv5UhCS_XCGFVX63qaxDkZ5spUtohOJ01I1Cmg5eW1CNMXiXsUCm3TG7u8IcMF-yPuujS6liDM1uvuiYUJu_a9_NkimHu0T-tl7eR"
                />
                <div className="absolute top-4 right-4 bg-[#00355f] text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm uppercase tracking-wide">
                  SOY PROFESIONAL
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-[#00355f] rounded-xl group-hover:bg-[#00355f] group-hover:text-white transition-colors duration-300">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quiero Trabajar</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                Únete a nuestra red de especialistas. Crea tu perfil, gestiona presupuestos y haz crecer tu negocio con OficiosYa.
              </p>
              <div className="mt-6 w-full flex items-center justify-between border-t border-gray-150 pt-4">
                <span className="text-[#00355f] group-hover:text-[#fc8127] font-bold text-sm group-hover:underline transition-colors duration-300">Comenzar registro</span>
                <ArrowRight className="w-5 h-5 text-[#00355f] group-hover:text-[#fc8127] group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>

            {/* Tarjeta: Cliente (Busco Servicios) */}
            <button 
              onClick={() => handleSelectRole('client')}
              className={`group relative flex flex-col items-start p-6 bg-white rounded-2xl border transition-all duration-300 text-left h-full shadow-sm hover:-translate-y-1 hover:shadow-md ${
                selected === 'client' 
                  ? 'border-[#fc8127] ring-2 ring-[#fc8127]/20 bg-orange-50/10' 
                  : 'border-gray-200 hover:border-[#00355f]/50'
              }`}
            >
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 relative bg-[#00355f]/5 shadow-inner">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Soy Cliente"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuKhpxrNZ66sV86jKu3eaGZh_g_9ko9GjgmIY4hPWUyAjqzQjwqTKK3JevEKSlI_cAKUy8n_Xfy__QYOcNcmiReeCO0f4_cVbaJFBsk_6WftZYAh0FTf0VrknAWSrSY_jEKn-Y7LuFgLdR0h1dtYoArkB4-HNlrGrE0XwohCwZp7qcpeobazaTQQJ2H4bAcGM3gcZl-6PlDIN7DdyYyvj8v2D3yPBf0ijiWdSxwU2Wg5NUX4b6QqW-7LvvZYwNr-_jvLzKRTJQSdf3"
                />
                <div className="absolute top-4 right-4 bg-[#fc8127] text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm uppercase tracking-wide">
                  SOY CLIENTE
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-orange-50 text-[#fc8127] rounded-xl group-hover:bg-[#fc8127] group-hover:text-white transition-colors duration-300">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Busco Servicios</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed flex-grow">
                Encuentra profesionales calificados para tus reparaciones, remodelaciones o mantenimiento del hogar en segundos.
              </p>
              <div className="mt-6 w-full flex items-center justify-between border-t border-gray-150 pt-4">
                <span className="text-gray-900 group-hover:text-[#00355f] font-bold text-sm group-hover:underline transition-colors duration-300">Explorar expertos</span>
                <ArrowRight className="w-5 h-5 text-gray-900 group-hover:text-[#00355f] group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>

          </div>

          {/* Bottom Action & Login Link */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 font-medium">
              ¿Ya tienes una cuenta?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-[#fc8127] font-extrabold hover:underline ml-1 hover:text-[#e67320] transition-colors"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Identity */}
      <footer className="w-full py-6 px-4 flex flex-col items-center border-t border-gray-200 bg-gray-50 text-gray-500 font-sans mt-auto select-none">
        <div className="max-w-7xl w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-70">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold tracking-tight">Plataforma Segura &amp; Verificada</span>
          </div>
          <div className="flex gap-6">
            <a className="text-xs font-bold hover:text-[#00355f]" href="#">Términos</a>
            <a className="text-xs font-bold hover:text-[#00355f]" href="#">Privacidad</a>
            <a className="text-xs font-bold hover:text-[#00355f]" href="#">Ayuda</a>
          </div>
        </div>
      </footer>
    </main>
  );
}