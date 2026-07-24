"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Send, CheckCircle, Shield, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
// Importa tu cliente de Supabase configurado en el proyecto (ej: src/lib/supabase.ts)
// import { supabase } from '@/lib/supabase';

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      // LLAMADA REAL A SUPABASE AUTH:
      /* const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/actualizar-password`, // Ruta a donde llega el usuario al hacer clic en el mail
      });

      if (error) throw error;
      */

      // Simulación de red temporal mientras configuras el cliente:
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsLoading(false);
      setEnviado(true);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMsg(error.message || 'Ocurrió un error al enviar el correo. Intenta nuevamente.');
    }
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col items-center font-sans">
      
      {/* Top AppBar */}
      <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center px-4 md:px-8 border-b border-gray-200">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 duration-150 text-[#00355f]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-[480px] px-4 py-8">
        
        {/* Mascot Logo Container */}
        <div className="mb-8 text-center cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="lg" theme="light" className="justify-center mb-4" />
        </div>

        {/* Card Section */}
        <div className="w-full bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {!enviado ? (
            <div className="fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block px-1" htmlFor="email">Correo electrónico</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                    <input 
                      className="w-full h-12 pl-11 pr-4 bg-[#f7fafc] border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent transition-all" 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="ejemplo@correo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Enviar instrucciones</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success Message */
            <div className="text-center py-4 space-y-4 fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-[#00562a]">¡Correo enviado!</p>
                <p className="text-sm text-gray-500">Si la cuenta existe, recibirás un enlace de recuperación en unos minutos.</p>
              </div>
              <button 
                onClick={() => { setEnviado(false); setEmail(''); }}
                className="text-xs font-bold text-[#00355f] underline hover:text-[#0f4c81] pt-2"
              >
                Intentar con otro correo
              </button>
            </div>
          )}

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña? 
            <button onClick={() => router.push('/login')} className="text-[#00355f] font-bold hover:underline transition-all ml-1.5">Inicia sesión</button>
          </p>
          <div className="flex items-center justify-center gap-6 pt-2">
            <a className="text-xs text-gray-400 hover:text-[#00355f] transition-colors" href="#">Términos y condiciones</a>
            <a className="text-xs text-gray-400 hover:text-[#00355f] transition-colors" href="#">Ayuda</a>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full py-3 px-4 border-t border-gray-200 bg-[#ebeef0] mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-gray-500">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-semibold">Conexión segura SSL de 256 bits</span>
        </div>
      </footer>
    </div>
  );
}