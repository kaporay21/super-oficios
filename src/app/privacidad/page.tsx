"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, Lock, RefreshCw, FileText } from 'lucide-react';
import Logo from '@/components/Logo';

export default function PrivacidadPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-32 md:pl-20 md:pb-0">
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 h-16 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-[#00355f] active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-[#00355f]">Políticas de Privacidad</h1>
        </div>
        <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 bg-white flex items-center justify-center p-1 shadow-sm cursor-pointer" onClick={() => router.push('/')}>
          <img src="/mascot.png" alt="OficiosYa" className="w-8 h-8 object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-20 max-w-3xl mx-auto px-4 py-8 space-y-8 flex-grow w-full">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f]">Protección de tus Datos</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">
            En OficiosYa, la seguridad de tu información personal es nuestra máxima prioridad. Conoce cómo recopilamos, usamos y protegemos tus datos.
          </p>
        </section>

        {/* Policy Grid */}
        <div className="space-y-6">
          <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <div className="p-3 bg-blue-50 text-[#00355f] rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#00355f]">Datos que Recopilamos</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Recopilamos información personal básica como tu nombre, dirección de correo electrónico, número de teléfono, ubicación geográfica (para buscar profesionales cerca de tu zona) y, en el caso de los profesionales, la documentación de su identidad y matrícula para validación.
              </p>
            </div>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <div className="p-3 bg-orange-50 text-[#fc8127] rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#00355f]">Cómo Usamos tu Información</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Utilizamos tus datos exclusivamente para facilitar la intermediación del servicio: mostrar perfiles profesionales relevantes, habilitar el sistema de chat interno, enviar notificaciones de solicitudes de trabajo y garantizar la seguridad global de la plataforma contra fraudes o suplantaciones.
              </p>
            </div>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#00355f]">Seguridad de la Información</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Aplicamos medidas de seguridad técnicas e institucionales para encriptar tu información personal durante la transmisión y el almacenamiento. Nunca compartimos ni vendemos tu información financiera ni datos sensibles a anunciantes o terceros ajenos a la prestación directa del servicio.
              </p>
            </div>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#00355f]">Tus Derechos sobre los Datos</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tienes derecho en cualquier momento a acceder, rectificar, exportar o solicitar la eliminación total de tu cuenta y toda la información asociada a ella. Para ejercer estos derechos, simplemente ponte en contacto con nuestro equipo a través de la sección de soporte.
              </p>
            </div>
          </article>
        </div>

        {/* Footer date */}
        <div className="text-center pt-6">
          <p className="text-xs text-gray-400 font-semibold">Última actualización: 14 de Julio, 2026</p>
        </div>

      </main>
    </div>
  );
}
