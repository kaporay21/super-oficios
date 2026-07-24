"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, Shield, Headset, Bell, Loader2 } from 'lucide-react';

export default function RegistroClientePage() {
  const router = useRouter();
  
  // Estados para capturar los datos del formulario (Listos para Supabase)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí haremos: const { data, error } = await supabase.auth.signUp(...)
    // Y luego insertaremos el perfil en la tabla 'profiles' con rol 'cliente'.
    console.log("Registrando cliente:", { fullName, email, phone });

    // Simulamos un retraso de red
    setTimeout(() => {
      setIsSubmitting(false);
      // Después del registro exitoso, mandamos al usuario a la vista principal de cliente (Home)
      router.push('/');
    }, 1500);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen font-sans selection:bg-[#0f4c81] selection:text-white">
      {/* TopAppBar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between px-4 py-3 w-full max-w-7xl mx-auto h-16 md:h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
               <span className="text-2xl">👷🏻‍♂️</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-lg md:text-xl leading-none text-[#00355f] tracking-tight">
                Oficios<span className="text-[#fc8127]">Ya</span>
              </h1>
              <span className="text-[10px] tracking-tight text-[#0f4c81] font-medium">lo que buscas a un click</span>
            </div>
          </div>
          <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:text-[#00355f] hover:bg-gray-100 p-2 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-screen">
        {/* Logo/Slogan for Mobile */}
        <div className="md:hidden text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-[10px] font-bold text-[#00355f] uppercase tracking-widest">lo que buscas a un click</p>
        </div>

        {/* Register Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#00355f] mb-2">Crear cuenta</h2>
            <p className="text-sm text-gray-500">Únete a la red más confiable de profesionales locales.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre Completo */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#00355f] ml-1" htmlFor="full_name">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="full_name" 
                  type="text" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pérez" 
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#00355f] ml-1" htmlFor="email">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com" 
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#00355f] ml-1" htmlFor="phone">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="phone" 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 381 123 4567" 
                  className="w-full h-12 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5 pb-2">
              <label className="text-sm font-bold text-[#00355f] ml-1" htmlFor="password">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" 
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all text-sm text-gray-900"
                />
                <button 
                  type="button" 
                  onClick={togglePassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start gap-3 py-2">
              <input 
                id="terms" 
                type="checkbox" 
                required 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#00355f] rounded border-gray-300 focus:ring-[#00355f] cursor-pointer"
              />
              <label className="text-xs text-gray-500 leading-snug" htmlFor="terms">
                Al crear mi cuenta acepto los <a href="#" className="text-[#00355f] font-bold hover:underline">Términos y Condiciones</a> y la <a href="#" className="text-[#00355f] font-bold hover:underline">Política de Privacidad</a>.
              </label>
            </div>

            {/* Botón Principal */}
            <button 
              type="submit" 
              disabled={isSubmitting || !termsAccepted}
              className={`w-full h-12 flex items-center justify-center gap-2 text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wide text-sm active:scale-[0.98] ${
                isSubmitting || !termsAccepted 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#fc8127] hover:bg-[#e67320]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creando cuenta...
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>

          {/* Enlace Secundario */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              ¿Ya tienes cuenta? 
              <button onClick={() => router.push('/login')} className="text-[#00355f] font-bold hover:underline ml-1">
                Ingresa aquí
              </button>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl w-full opacity-70 animate-in fade-in duration-1000 delay-300">
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
      </main>
    </div>
  );
}