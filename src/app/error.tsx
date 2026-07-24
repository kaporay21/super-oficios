"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, RefreshCw, Home, HelpCircle, 
  Settings, Wrench, ShieldAlert
} from 'lucide-react';
import Logo from '@/components/Logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Aquí se podría reportar el error a un servicio de telemetría (Sentry, LogRocket, etc.)
    console.error("Error capturado por el boundary de Next.js:", error);
  }, [error]);

  return (
    <main className="relative min-h-screen bg-[#00355f] text-white flex flex-col justify-between overflow-hidden font-sans selection:bg-[#fc8127] selection:text-white">
      
      {/* Luces y Gradientes de Fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-500/10 blur-[120px] animate-pulse duration-10000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#fc8127]/10 blur-[120px] animate-pulse duration-7000"></div>
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
          
          {/* Elementos Decorativos de Alerta */}
          <div className="absolute -top-16 left-6 md:-left-12 animate-bounce duration-[4000ms] text-red-400/20 hidden sm:block">
            <ShieldAlert className="w-14 h-14" />
          </div>
          <div className="absolute -top-10 right-6 md:-right-12 animate-bounce duration-[5000ms] text-yellow-400/20 hidden sm:block">
            <AlertTriangle className="w-12 h-12 transform rotate-12" />
          </div>
          <div className="absolute bottom-12 -left-10 animate-spin-slow text-orange-400/10 hidden md:block">
            <Settings className="w-10 h-10" />
          </div>

          {/* Icono de Alerta de Error Principal */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20 text-[#fc8127] animate-pulse">
              <AlertTriangle className="w-16 h-16 text-[#fc8127]" />
            </div>
            <div className="absolute -inset-1 bg-[#fc8127] rounded-full blur-xl opacity-25 -z-10 animate-ping duration-3000"></div>
          </div>

          {/* Mensajes */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            ¡Oops! Algo salió mal en el taller
          </h1>
          <p className="text-blue-100 max-w-lg mx-auto text-sm md:text-base mb-10 leading-relaxed">
            Hubo un problema inesperado al cargar esta sección. No te preocupes, nuestros desarrolladores y plomeros de código ya están ajustando las tuercas para solucionarlo.
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => reset()}
              className="w-full bg-[#fc8127] hover:bg-[#e06e1b] text-white px-8 py-4 rounded-xl font-extrabold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Intentar Nuevamente
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-xl font-extrabold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Ir a la Página Principal
            </button>
          </div>

          {/* Detalles del error para soporte (desplegable discreto) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-12 text-left max-w-lg mx-auto bg-black/30 rounded-xl p-4 border border-white/5">
              <summary className="text-xs font-bold text-red-300 cursor-pointer select-none">
                Detalle Técnico del Error (Solo desarrollo)
              </summary>
              <p className="text-xs font-mono mt-2 text-gray-300 overflow-x-auto break-all">
                {error.message || JSON.stringify(error)}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-blue-200/50 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} OficiosYa. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
