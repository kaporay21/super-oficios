"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Menu, CheckCircle, TrendingUp, DollarSign, 
  User, Wrench, MapPin, Phone, Mail, ArrowRight 
} from 'lucide-react';

export default function RegistroProfesionalPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulamos carga de registro
    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(true);
    }, 1000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Ahora redirige directamente al panel del profesional
    router.push('/panel-profesional'); 
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto h-16 md:h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
               <span className="text-2xl">👷🏻‍♂️</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg md:text-xl text-[#00355f] leading-none">
                Oficios<span className="text-[#fc8127]">Ya</span>
              </h1>
              <p className="text-[10px] text-[#00355f]">lo que buscas a un click</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-4">
              <a className="text-gray-600 font-medium hover:bg-gray-50 px-3 py-2 rounded-lg" href="#">Inicio</a>
              <a className="text-gray-600 font-medium hover:bg-gray-50 px-3 py-2 rounded-lg" href="#">Servicios</a>
              <a className="text-[#00355f] font-bold px-3 py-2 rounded-lg" href="#">Para Profesionales</a>
            </nav>
            <button className="text-[#00355f] p-2 hover:bg-gray-50 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <button className="md:hidden text-gray-600 p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d2e4ff] opacity-40 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffdbc8] opacity-40 blur-3xl rounded-full"></div>
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          
          {/* Left Side: Value Proposition */}
          <div className="hidden md:flex flex-col gap-6 pr-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#7efba4] text-[#003c1b] rounded-full w-fit font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              Únete a la red más grande
            </span>
            <h2 className="text-4xl font-extrabold text-[#181c1e] leading-tight">
              Haz crecer tu oficio con <span className="text-[#00355f]">OficiosYa</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Conectamos tu talento con miles de clientes que necesitan soluciones hoy mismo. Sé parte de la comunidad de profesionales más confiable del país.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="bg-[#d2e4ff] text-[#00355f] p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Más Trabajo</p>
                  <p className="text-sm text-gray-500">Recibe solicitudes directas de clientes en tu zona.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="bg-[#ffdbc8] text-[#994700] p-2 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Pagos Seguros</p>
                  <p className="text-sm text-gray-500">Gestiona tus presupuestos y cobros de forma profesional.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="w-full">
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/50 shadow-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#00355f] mb-2">Registro de Profesional</h3>
                <p className="text-sm text-gray-600">Completa tus datos para empezar a recibir ofertas.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 px-1" htmlFor="fullName">Nombre completo</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                    <input required id="fullName" type="text" placeholder="Ej: Juan Pérez" className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Oficio */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="trade">Oficio / Especialidad</label>
                    <div className="relative group">
                      <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <select required id="trade" className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all appearance-none text-gray-800">
                        <option value="" disabled selected>Selecciona tu oficio</option>
                        <option value="plomeria">Plomería</option>
                        <option value="electricidad">Electricidad</option>
                        <option value="albanileria">Albañilería</option>
                        <option value="pintura">Pintura</option>
                        <option value="carpinteria">Carpintería</option>
                        <option value="aire">Aire Acondicionado</option>
                      </select>
                    </div>
                  </div>
                  {/* Zona */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="location">Ciudad / Zona</label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input required id="location" type="text" placeholder="Ej: Palermo, CABA" className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="phone">Teléfono</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input required id="phone" type="tel" placeholder="+54 9..." className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" />
                    </div>
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 px-1" htmlFor="email">Correo electrónico</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                      <input required id="email" type="email" placeholder="nombre@ejemplo.com" className="w-full h-12 pl-10 pr-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Experiencia */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 px-1" htmlFor="experience">Breve descripción de experiencia</label>
                  <textarea required id="experience" rows={3} placeholder="Cuéntanos sobre tus años de experiencia y trabajos destacados..." className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none transition-all resize-none"></textarea>
                </div>

                {/* Botón y Login */}
                <div className="mt-4 flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full h-14 bg-[#fc8127] text-white font-bold text-lg rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Procesando...' : 'Registrarme como Profesional'}
                    {!isSubmitting && <ArrowRight className="w-6 h-6" />}
                  </button>
                  <p className="text-center text-gray-600 text-sm">
                    Ya tengo cuenta, <button type="button" onClick={() => router.push('/login')} className="text-[#00355f] font-bold hover:underline">ingresar</button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal - Modificado */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">¡Registro exitoso!</h4>
              <p className="text-sm text-gray-500 mt-2">Ya eres parte de nuestra comunidad. Serás redirigido a tu panel profesional.</p>
            </div>
            <button 
              onClick={handleCloseModal}
              className="w-full h-12 bg-[#00355f] text-white rounded-xl font-bold hover:bg-[#0f4c81] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white py-6 px-4 border-t border-gray-200 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold">© 2026 OficiosYa - Conectando Talento</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Términos y Condiciones</a>
            <a href="#" className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Privacidad</a>
            <a href="#" className="text-xs text-gray-500 hover:text-[#00355f] font-bold">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}