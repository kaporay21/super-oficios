"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Home, Wrench, Hammer, Paintbrush, 
  Settings, Compass, Construction, HelpCircle
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar-profesionales?oficio=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/buscar-profesionales');
    }
  };

  return (
    <main className="relative min-h-screen bg-[#00355f] text-white flex flex-col justify-between overflow-hidden font-sans selection:bg-[#fc8127] selection:text-white">
      
      {/* Luces y Gradientes de Fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#fc8127]/20 blur-[120px] animate-pulse duration-7000"></div>
      </div>

      {/* Header con el Logo */}
      <header className="relative z-10 w-full px-6 py-6 md:px-12 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Logo theme="dark" size="md" />
        </div>
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>
      </header>

      {/* Contenido Principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center relative">
          
          {/* Elementos Decorativos Flotantes de Oficios */}
          <div className="absolute -top-16 left-6 md:-left-12 animate-bounce duration-[4000ms] text-[#fc8127]/30 hidden sm:block">
            <Wrench className="w-12 h-12 transform -rotate-12" />
          </div>
          <div className="absolute -top-10 right-6 md:-right-12 animate-bounce duration-[5000ms] text-blue-400/30 hidden sm:block">
            <Hammer className="w-14 h-14 transform rotate-45" />
          </div>
          <div className="absolute bottom-10 -left-10 animate-pulse text-yellow-400/20 hidden md:block">
            <Paintbrush className="w-12 h-12 transform -rotate-45" />
          </div>
          <div className="absolute bottom-12 -right-10 animate-spin-slow text-orange-400/20 hidden md:block">
            <Settings className="w-10 h-10" />
          </div>

          {/* Gran 404 con Borde Brillante */}
          <div className="relative inline-block mb-4">
            <h1 className="text-8xl md:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-[#fc8127] drop-shadow-lg select-none">
              404
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#fc8127] to-blue-500 rounded-full blur-xl opacity-20 -z-10 animate-pulse"></div>
          </div>

          {/* Mensaje de Error */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            ¡Ups! Parece que esta página se tomó un franco...
          </h2>
          <p className="text-blue-100 max-w-md mx-auto text-sm md:text-base mb-8 leading-relaxed">
            El servicio o sección que estás buscando no se encuentra disponible. ¡No te preocupes! Tenemos a los mejores profesionales listos para guiarte.
          </p>

          {/* Buscador Integrado */}
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl max-w-md mx-auto mb-8 animate-in zoom-in-95 duration-500">
            <h3 className="text-sm font-bold text-[#fc8127] uppercase tracking-wider mb-3">
              ¿Qué oficio o servicio necesitas?
            </h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Ej: Plomero, Electricista, Pintor..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white text-gray-900 placeholder-gray-400 text-sm font-medium rounded-xl pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#fc8127] transition-all"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#fc8127] text-white px-5 rounded-xl font-bold text-sm hover:bg-[#e06e1b] transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto bg-white text-[#00355f] px-8 py-3.5 rounded-xl font-extrabold text-sm hover:bg-blue-50 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#00355f]" />
              Ir a la Página Principal
            </button>
            <button
              onClick={() => router.push('/buscar-profesionales')}
              className="w-full sm:w-auto bg-transparent border-2 border-white/20 hover:border-white/50 text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explorar Profesionales
            </button>
          </div>

        </div>
      </div>

      {/* Footer minimalista */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-blue-200/50 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} OficiosYa. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
