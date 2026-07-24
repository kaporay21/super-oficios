"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Shield, Crown, Zap } from 'lucide-react';

export default function PlanesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12 selection:bg-[#0f4c81] selection:text-white">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-50 border-b border-gray-100 flex items-center">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-[#00355f] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold text-xl text-[#00355f] ml-2">Impulsá tu Negocio</h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12 space-y-12">
        
        {/* Titulo */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-[#00355f] leading-tight mb-4">
            Elegí el plan perfecto para vos
          </h2>
          <p className="text-gray-500 text-lg">
            Potenciá tu alcance, conseguí más clientes y aumentá tus ingresos con las herramientas exclusivas de OficiosYa.
          </p>
        </div>

        {/* Tarjetas de Precios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          
          {/* PLAN GRATIS */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">Perfecto para empezar y probar la plataforma.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-[#00355f]">$0</span>
              <span className="text-gray-500 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm text-gray-600">Hasta <strong>5 fotos</strong> en tu portfolio</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm text-gray-600">Postularse a <strong>5 trabajos</strong> por mes</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0" /><span className="text-sm text-gray-600">Aparición estándar en búsquedas</span></li>
            </ul>
            <button className="w-full py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">
              Plan Actual
            </button>
          </div>

          {/* PLAN MASTER (Destacado en el medio) */}
          <div className="bg-[#00355f] rounded-3xl p-8 border-2 border-[#fc8127] shadow-2xl relative transform md:-translate-y-4 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#fc8127] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Crown className="w-4 h-4" /> El Más Elegido
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Master</h3>
            <p className="text-blue-200 text-sm mb-6 min-h-[40px]">El control total para dominar tu zona de servicio.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">$15.000</span>
              <span className="text-blue-200 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8 text-white">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#fc8127] shrink-0" /><span className="text-sm font-medium"><strong>Fotos ilimitadas</strong> en portfolio</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#fc8127] shrink-0" /><span className="text-sm font-medium"><strong>Postulaciones ilimitadas</strong> a trabajos</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#fc8127] shrink-0" /><span className="text-sm font-medium">1° lugar como <strong>"Más Recomendado"</strong></span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[#fc8127] shrink-0" /><span className="text-sm font-medium">Soporte prioritario 24/7</span></li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-[#fc8127] text-white font-bold hover:bg-[#e67320] shadow-lg active:scale-95 transition-all text-lg">
              Mejorar a Master
            </button>
          </div>

          {/* PLAN PRO */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative">
            <h3 className="text-2xl font-bold text-[#00355f] mb-2">Pro</h3>
            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">Para profesionales que quieren crecer rápido.</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-[#00355f]">$8.500</span>
              <span className="text-gray-500 font-medium">/mes</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-gray-700">Hasta <strong>10 fotos</strong> en tu portfolio</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-gray-700">Postularse a <strong>10 trabajos</strong> por mes</span></li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-gray-700">Posición prioritaria en el buscador</span></li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-blue-50 text-[#00355f] font-bold hover:bg-blue-100 transition-colors active:scale-95">
              Mejorar a Pro
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}