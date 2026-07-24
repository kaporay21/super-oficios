"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  ShieldCheck, Shield, Headset, Bell, Loader2,
  ClipboardList, Star, MapPin, MessageSquare
} from 'lucide-react';
import { dbHelper } from '@/lib/supabase';

export default function RegistroClientePage() {
  const router = useRouter();
  
  // Estados para capturar los datos del formulario (Listos para Supabase)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dbHelper.registerCliente(fullName, email, phone, password);
      
      setTimeout(() => {
        localStorage.setItem('show_confetti', 'true');
        router.push('/cliente');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen font-sans selection:bg-[#0f4c81] selection:text-white flex flex-col justify-between">
      {/* TopAppBar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto h-16 md:h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <Logo size="md" theme="light" />
          </div>
          <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:text-[#00355f] hover:bg-gray-100 p-2 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container: Dual Column Grid on Desktop */}
      <main className="pt-28 pb-12 px-4 md:px-8 flex-grow flex items-center justify-center max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 w-full items-center justify-center">
          
          {/* Left Column: Benefits (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="space-y-4">
              <span className="inline-flex px-4 py-1.5 bg-[#00355f]/10 text-[#00355f] text-xs font-black rounded-full uppercase tracking-wider w-fit">
                Beneficios Exclusivos
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-[#00355f] leading-tight">
                Todo lo que necesitás para tu hogar, <span className="text-[#fc8127]">en un solo lugar</span>
              </h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Registrate gratis hoy mismo para conectarte con profesionales calificados de tu provincia y solucionar cualquier imprevisto de forma fácil, económica y segura.
              </p>
            </div>

            {/* Listado de Beneficios en Grilla */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-50 text-[#00355f] rounded-xl shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#00355f]">Recibí múltiples presupuestos</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Publicá tu necesidad totalmente gratis y compará presupuestos de mano de obra en minutos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-50 text-[#fc8127] rounded-xl shrink-0">
                  <Star className="w-6 h-6 fill-current text-[#fc8127]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#00355f]">Elegí por mejores reseñas</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Revisá la experiencia de otros clientes, calificaciones y fotos de trabajos previos de cada profesional.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-50 text-green-700 rounded-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#00355f]">Profesionales en tu provincia</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Encontrá electricistas, plomeros, albañiles, pintores y más especialidades cerca de tu ubicación.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-xl shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#00355f]">Chat rápido e inmediato</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Conversá directamente con los profesionales para coordinar visitas técnicas, presupuestos y materiales.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Register Card (lg:col-span-5) */}
          <div className="w-full lg:col-span-5 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            
            {/* Logo/Slogan for Mobile */}
            <div className="lg:hidden text-center mb-6">
              <p className="text-[10px] font-bold text-[#00355f] uppercase tracking-widest">lo que buscas a un click</p>
            </div>

            {/* Card Content */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-150 p-6 md:p-8">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-[#00355f] mb-1">Crear cuenta</h2>
                <p className="text-xs text-gray-400">Únete como cliente para recibir cotizaciones.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Error Box */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Nombre Completo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#00355f] ml-1" htmlFor="full_name">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input 
                      id="full_name" 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej: Juan Pérez" 
                      className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-xs text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#00355f] ml-1" htmlFor="email">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input 
                      id="email" 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com" 
                      className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-xs text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#00355f] ml-1" htmlFor="phone">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input 
                      id="phone" 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+54 9 381 123 4567" 
                      className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-xs text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#00355f] ml-1" htmlFor="password">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres" 
                      className="w-full h-11 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-xs text-gray-900 font-medium"
                    />
                    <button 
                      type="button" 
                      onClick={togglePassword}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-1 pb-1">
                  <label className="text-xs font-bold text-[#00355f] ml-1" htmlFor="confirm_password">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input 
                      id="confirm_password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetí la contraseña" 
                      className="w-full h-11 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-xs text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Términos y Condiciones Conectados */}
                <div className="flex items-start gap-3 py-2">
                  <input 
                    id="terms" 
                    type="checkbox" 
                    required 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#00355f] rounded border-gray-300 focus:ring-[#00355f] cursor-pointer shrink-0"
                  />
                  <label className="text-[11px] text-gray-400 leading-snug cursor-pointer" htmlFor="terms">
                    Al crear mi cuenta acepto los{' '}
                    <button 
                      type="button" 
                      onClick={() => router.push('/terminos')} 
                      className="text-[#00355f] font-bold hover:underline cursor-pointer"
                    >
                      Términos y Condiciones
                    </button>{' '}
                    y la{' '}
                    <button 
                      type="button" 
                      onClick={() => router.push('/privacidad')} 
                      className="text-[#00355f] font-bold hover:underline cursor-pointer"
                    >
                      Política de Privacidad
                    </button>.
                  </label>
                </div>

                {/* Botón Principal */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || !termsAccepted}
                  className={`w-full h-12 flex items-center justify-center gap-2 text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wide text-xs active:scale-[0.98] cursor-pointer ${
                    isSubmitting || !termsAccepted 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                      : 'bg-[#fc8127] hover:bg-[#e67320]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...
                    </>
                  ) : 'Crear cuenta'}
                </button>
              </form>

              {/* Enlace Secundario */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => router.push('/login')} className="text-[#00355f] font-bold hover:underline cursor-pointer">
                    Ingresa aquí
                  </button>
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Trust Badges Panel */}
      <div className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-6 opacity-80">
          <div className="flex flex-col items-center text-center gap-2">
            <ShieldCheck className="text-[#00355f] w-8 h-8" />
            <p className="text-xs font-bold text-gray-600">Profesionales Verificados</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <Shield className="text-[#00355f] w-8 h-8" />
            <p className="text-xs font-bold text-gray-600">Plataforma Segura</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2 col-span-2 md:col-span-1">
            <Headset className="text-[#00355f] w-8 h-8" />
            <p className="text-xs font-bold text-gray-600">Soporte Local</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 px-4 border-t border-gray-200 text-center md:text-left w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold">© 2026 OficiosYa - Conectando Talento</p>
          <div className="flex gap-6">
            <button onClick={() => router.push('/terminos')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold cursor-pointer">Términos y Condiciones</button>
            <button onClick={() => router.push('/privacidad')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold cursor-pointer">Privacidad</button>
            <button onClick={() => router.push('/soporte')} className="text-xs text-gray-500 hover:text-[#00355f] font-bold cursor-pointer">Soporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}