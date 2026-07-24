"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, MapPin } from 'lucide-react';

export default function BienvenidaProModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const yaVio = localStorage.getItem('bienvenida_pro_visto');
    if (!yaVio) {
      setIsOpen(true);
    }
  }, []);

  const cerrarModal = () => {
    setIsOpen(false);
    localStorage.setItem('bienvenida_pro_visto', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Contenedor del Borde Brillante */}
      <div className="relative group max-w-lg w-full">
        {/* Capa de animación (el gradiente que gira) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#fc8127] via-blue-500 to-[#00355f] rounded-[2rem] opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 animate-spin-slow"></div>
        
        {/* Contenido Principal */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <button 
            onClick={cerrarModal} 
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 z-10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="bg-[#00355f] p-8 text-center pb-16">
            <h1 className="text-3xl font-black text-white">
              ¡Bienvenido a Oficios<span className="text-[#fc8127]">Ya</span>!
            </h1>
          </div>

          <div className="p-8">
            <div className="flex justify-center -mt-20 mb-6">
              <img 
                src="/mascot_thumbs_up.png" 
                alt="Mascota OficiosYa" 
                className="w-32 h-32 object-contain drop-shadow-xl animate-bounce" 
                style={{ animationDuration: '3s' }}
              />
            </div>

            <h3 className="text-xl font-bold text-[#00355f] text-center mb-6">Tu negocio en buenas manos</h3>
            
            <div className="space-y-4 mb-8">
              <Feature icon={TrendingUp} title="Más clientes" text="Recibe solicitudes directas de personas que buscan exactamente lo que ofreces." />
              <Feature icon={CheckCircle} title="Perfil Profesional" text="Destaca tu experiencia para que los clientes te elijan a ti." />
              <Feature icon={MapPin} title="Posición en tu zona" text="Aparece primero en las búsquedas de tu provincia." />
            </div>

            <button 
              onClick={cerrarModal}
              className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              ¡Empezar a trabajar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureProps {
  icon: React.ComponentType<any>;
  title: string;
  text: string;
}

function Feature({ icon: Icon, title, text }: FeatureProps) {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-blue-50 p-2.5 rounded-xl text-[#00355f] shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-extrabold text-[#00355f] text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
