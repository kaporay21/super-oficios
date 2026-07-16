"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, Search, Briefcase, User, HelpCircle, 
  ArrowRight, Edit3, CreditCard, MessageSquare, 
  CheckCircle2, Award, ClipboardCheck, Wrench, Wallet 
} from 'lucide-react';

export default function ComoFuncionaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'client' | 'pro'>('client');

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pl-20 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-full bg-[#00355f] flex items-center justify-center overflow-hidden border-2 border-[#ffdbc8]">
            <span className="text-xl">👷🏻‍♂️</span>
          </div>
          <h1 className="font-extrabold text-xl text-[#00355f]">
            Oficios<span className="text-[#fc8127]">Ya</span>
          </h1>
        </div>
        <button onClick={() => alert('Soporte de OficiosYa')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Navegación Lateral (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Home className="w-6 h-6" /></button>
        <button onClick={() => router.push('/muro-trabajos')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Search className="w-6 h-6" /></button>
        <button onClick={() => router.push('/mis-trabajos')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Briefcase className="w-6 h-6" /></button>
        <div className="mt-auto">
          <button onClick={() => router.push('/configuracion-profesional')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
        </div>
      </nav>

      <main className="mt-16 md:mt-20 px-4 md:px-8 max-w-2xl mx-auto w-full flex-grow">
        
        {/* Hero Section */}
        <section className="mb-6 text-center py-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-1">¿Cómo funciona?</h2>
          <p className="text-sm text-gray-600">Conectamos el talento con la necesidad en simples pasos.</p>
        </section>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 mb-8 sticky top-16 bg-[#f7fafc] z-40">
          <button 
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-3 font-bold text-xs tracking-wider transition-all duration-200 ${
              activeTab === 'client' 
                ? 'text-[#00355f] border-b-[3px] border-[#994700]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            PARA CLIENTES
          </button>
          <button 
            onClick={() => setActiveTab('pro')}
            className={`flex-1 py-3 font-bold text-xs tracking-wider transition-all duration-200 ${
              activeTab === 'pro' 
                ? 'text-[#00355f] border-b-[3px] border-[#994700]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            PARA PROFESIONALES
          </button>
        </div>

        {/* Content Container (Clientes) */}
        {activeTab === 'client' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#994700]">
                <Edit3 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">1. Publica tu necesidad</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Describe el trabajo con claridad y sube fotos para que los expertos entiendan mejor el proyecto.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#994700]">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">2. Recibe presupuestos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Compara ofertas detalladas de profesionales verificados por nuestra comunidad.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#994700]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">3. Chatea y contrata</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Acordá detalles, fechas y precios directamente por nuestro chat interno seguro.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#994700]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">4. Califica el servicio</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Tu opinión es fundamental. Califica al profesional y ayuda a otros usuarios a elegir mejor.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Container (Profesionales) */}
        {activeTab === 'pro' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00355f]">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">1. Crea tu perfil</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Completá tus datos, tu oficio y subí fotos de tus mejores trabajos para destacar.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00355f]">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">2. Postulate a trabajos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Encontrá nuevas solicitudes cerca de tu zona y elegí las que mejor se adapten a tu agenda.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00355f]">
                <Wrench className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">3. Realiza el servicio</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Brindá un servicio de calidad y cumplí con los tiempos acordados con el cliente.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00355f]">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#00355f] mb-1">4. Cobra y recibe calificación</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Recibí tu pago de forma segura y suma valoraciones positivas para ganar más visibilidad.</p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-10 pb-8">
          <button 
            onClick={() => router.push('/bienvenida')}
            className="w-full h-14 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Comenzar ahora
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t border-gray-200 shadow-lg z-50">
        <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><Home className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Home</span></button>
        <button onClick={() => router.push('/muro-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><Search className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Search</span></button>
        <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center text-gray-400 hover:text-[#00355f]"><Briefcase className="w-5 h-5" /><span className="text-[10px] mt-1 font-medium">Trabajos</span></button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center text-[#fc8127]"><User className="w-5 h-5 fill-current" /><span className="text-[10px] font-bold mt-1">Perfil</span></button>
      </nav>
    </div>
  );
}