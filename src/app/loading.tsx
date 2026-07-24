"use client";

import React from 'react';
import { Hammer } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md select-none pointer-events-none">
      
      {/* Consolidación de todos los estilos CSS y keyframes en una única etiqueta style estándar */}
      <style>{`
        @keyframes loading-hammer {
          0%, 100% {
            transform: rotate(-10deg) translateY(0);
          }
          50% {
            transform: rotate(15deg) translateY(-8px);
          }
        }
        @keyframes pulse-light {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes loading-bar {
          0% {
            left: -60%;
          }
          100% {
            left: 100%;
          }
        }
        .animate-hammer {
          animation: loading-hammer 1.2s ease-in-out infinite;
        }
        .animate-pulse-text {
          animation: pulse-light 1.8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>

      <div className="relative flex flex-col items-center gap-6">
        
        {/* Círculo decorativo con engranaje / destello de fondo */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-orange-100/40 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#00355f]/5 rounded-full blur-2xl pointer-events-none animate-pulse" />

        <div className="relative flex items-center justify-center">
          
          {/* Engranaje giratorio de fondo */}
          <div className="absolute w-36 h-36 border-4 border-dashed border-[#fc8127]/25 rounded-full animate-spin-slow" />
          
          {/* Mascota animada con efecto martilleo / saludo */}
          <div className="relative z-10 w-28 h-28 bg-white rounded-full p-2.5 shadow-xl border border-gray-100 flex items-center justify-center animate-hammer">
            <img 
              src="/mascot.png" 
              alt="Mascota OficiosYa" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Mini icono flotante de martillo */}
          <div className="absolute -bottom-1 -right-1 z-20 bg-[#00355f] text-white p-2 rounded-2xl shadow-lg border-2 border-white animate-bounce">
            <Hammer className="w-4 h-4 text-[#fc8127]" />
          </div>
        </div>

        {/* Textos de carga */}
        <div className="text-center space-y-2 mt-4">
          <div className="flex items-center justify-center gap-1.5 font-sans">
            <span className="text-2xl font-black text-[#00355f]">Oficios</span>
            <span className="text-2xl font-black text-[#fc8127]">Ya</span>
          </div>
          <p className="text-xs text-gray-500 font-bold tracking-widest uppercase animate-pulse-text">
            Preparando tu espacio de trabajo...
          </p>
        </div>

        {/* Barra de Progreso Fluida */}
        <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00355f] to-[#fc8127] rounded-full animate-loading-bar" 
            style={{ width: '60%' }} 
          />
        </div>

      </div>
    </div>
  );
}
