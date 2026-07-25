"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Mail, Lock, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { dbHelper } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, profile } = await dbHelper.login(email, password);
      setSuccessMessage(true);
      
      setTimeout(() => {
        const rol = profile?.rol || (user as any)?.rol;

        // Set confetti flag for login
        localStorage.setItem('show_confetti', 'true');
        
        if (rol === 'admin' || email.trim().toLowerCase() === 'gonzalohumacata1992@gmail.com') {
          router.push('/admin');
        } else if (rol === 'profesional') {
          router.push('/panel-profesional');
        } else {
          router.push('/cliente');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans selection:bg-[#0f4c81] selection:text-white">
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-md">
          
          {/* Branding Header */}
          <div className="flex flex-col items-center mb-8 text-center cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-28 h-28 mb-4 overflow-hidden rounded-full bg-white flex items-center justify-center p-2 shadow-sm border border-gray-200">
              <img src="/mascot.png" alt="OficiosYa" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#00355f] tracking-tight">Oficios<span className="text-[#fc8127]">Ya</span></h1>
            <p className="text-sm text-gray-500 mt-2">Tu confianza, nuestra herramienta.</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Mensaje de Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block px-1" htmlFor="email">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                  <input 
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-300 bg-[#f7fafc] focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent outline-none transition-all text-sm text-gray-900" 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-gray-700 block" htmlFor="password">Contraseña</label>
                  {/* AQUÍ ESTÁ EL CAMBIO PARA RECUPERAR CONTRASEÑA */}
                  <button 
                    type="button"
                    onClick={() => router.push('/recuperar-password')} 
                    className="text-xs font-semibold text-[#00355f] hover:underline transition-all"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                  <input 
                    className="w-full h-12 pl-11 pr-11 rounded-xl border border-gray-300 bg-[#f7fafc] focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent outline-none transition-all text-sm text-gray-900" 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                  successMessage 
                    ? 'bg-[#00562a] text-white' 
                    : 'bg-[#00355f] hover:bg-[#0f4c81] text-white shadow-md'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : successMessage ? (
                  '¡Accediendo!'
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-[10px] font-bold text-gray-400 bg-white px-2 uppercase tracking-widest">o continúa con</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 h-12 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 duration-150">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-xs font-bold text-gray-700">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 h-12 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 duration-150">
                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span className="text-xs font-bold text-gray-700">Facebook</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta? 
              <button onClick={() => router.push('/bienvenida')} className="text-[#00355f] font-bold hover:underline transition-all ml-1.5">Regístrate gratis</button>
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-4 px-4 border-t border-gray-200 bg-[#ebeef0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold">Conexión segura SSL de 256 bits</span>
          </div>
          <div className="flex gap-6">
            <a className="text-xs text-gray-600 hover:text-[#00355f] font-semibold" href="#">Privacidad</a>
            <a className="text-xs text-gray-600 hover:text-[#00355f] font-semibold" href="#">Términos</a>
            <a className="text-xs text-gray-600 hover:text-[#00355f] font-semibold" href="#">Ayuda</a>
          </div>
        </div>
      </footer>
    </div>
  );
}