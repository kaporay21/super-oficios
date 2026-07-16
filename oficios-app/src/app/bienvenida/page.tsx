"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wrench, ChevronRight } from 'lucide-react';

export default function BienvenidaPage() {
  const router = useRouter();

  const handleSelectRole = (role: 'client' | 'pro') => {
    if (role === 'client') {
      router.push('/registro-cliente'); 
    } else {
      router.push('/registro-profesional'); 
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between py-10 px-4 bg-gradient-to-tr from-[#0f4c81]/5 via-transparent to-[#fc8127]/5 font-sans selection:bg-[#0f4c81] selection:text-white">
      <div className="max-w-md w-full mx-auto space-y-8 flex-grow flex flex-col justify-center">
        
        {/* Cabecera y Logo */}
        <div className="flex flex-col items-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center p-3 shadow-md border border-gray-100">
            <span className="text-5xl">👷🏻‍♂️</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f] leading-tight">
              Comienza tu camino en OficiosYa
            </h1>
            <p className="text-base text-gray-500">
              Selecciona cómo quieres unirte a nuestra comunidad
            </p>
          </div>
        </div>

        {/* Tarjetas de Selección */}
        <div className="grid grid-cols-1 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          {/* Tarjeta: Soy Cliente */}
          <button
            onClick={() => handleSelectRole('client')}
            className="w-full text-left bg-white/90 backdrop-blur-md p-6 rounded-2xl flex items-center gap-4 group border border-gray-200 hover:border-[#00355f] transition-all duration-300 shadow-sm active:scale-95"
          >
            <div className="bg-gray-50 p-3.5 rounded-xl text-[#00355f] group-hover:bg-[#00355f] group-hover:text-white transition-colors duration-300">
              <Search className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#00355f] transition-colors duration-300">
                Soy Cliente
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Quiero contratar profesionales para mis proyectos.
              </p>
            </div>
            <div className="shrink-0">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00355f] transition-colors duration-300" />
            </div>
          </button>

          {/* Tarjeta: Soy Profesional (Destacada) */}
          <button
            onClick={() => handleSelectRole('pro')}
            className="w-full text-left bg-[#00355f] p-6 rounded-2xl flex items-center gap-4 group hover:bg-[#0a4270] transition-all duration-300 shadow-lg relative overflow-hidden active:scale-95"
          >
            {/* Efecto de luz naranja de fondo */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#fc8127] opacity-20 rounded-full blur-2xl"></div>
            
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl text-white group-hover:bg-[#fc8127] transition-colors duration-300 z-10">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="flex-grow z-10">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-white">
                  Soy Profesional
                </h2>
                <span className="bg-[#fc8127] text-white px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide shadow-sm">
                  Popular
                </span>
              </div>
              <p className="text-sm text-blue-200/80">
                Quiero ofrecer mis servicios y encontrar nuevos clientes.
              </p>
            </div>
            <div className="shrink-0 z-10">
              <ChevronRight className="w-5 h-5 text-blue-200/60 group-hover:text-white transition-colors duration-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer / Login Link */}
      <div className="text-center pt-8 pb-4 animate-in fade-in duration-1000 delay-300">
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-bold text-gray-600 hover:text-[#00355f] transition-colors"
        >
          ¿Ya tienes cuenta? <span className="text-[#fc8127] hover:underline">Inicia sesión</span>
        </button>
      </div>
    </main>
  );
}