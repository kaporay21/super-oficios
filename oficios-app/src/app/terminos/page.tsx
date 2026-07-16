"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, Shield, Loader2, 
  Home, Search, Briefcase, MessageSquare, User, ShieldCheck, Lock 
} from 'lucide-react';

export default function TerminosPage() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = () => {
    if (!isChecked) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert('¡Has aceptado los términos y condiciones con éxito!');
      router.back();
    }, 1500);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans pb-32 md:pl-20 md:pb-0">
      
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 h-16 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-[#00355f] active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg md:text-xl text-[#00355f]">Términos y Condiciones</h1>
        </div>
        <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 bg-white flex items-center justify-center p-1 shadow-sm">
          <span className="text-xl">👷🏻‍♂️</span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="mt-16 max-w-3xl mx-auto px-4 py-8 space-y-8 flex-grow w-full">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
            <span className="text-4xl">👷🏻‍♂️</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#00355f]">Contrato de Uso</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl leading-relaxed">
            Por favor, lee atentamente las reglas de nuestra comunidad para asegurar la mejor experiencia en OficiosYa.
          </p>
        </section>

        {/* Terms Content - Bento Style Layout */}
        <div className="space-y-4">
          
          <article className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-sm">1</span>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#00355f]">Intermediación Digital</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>OficiosYa</strong> actúa únicamente como un mercado digital (marketplace) que facilita la conexión entre clientes que necesitan un servicio y profesionales técnicos independientes. No somos proveedores de servicios técnicos ni contratistas.
              </p>
            </div>
          </article>

          <article className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-sm">2</span>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#00355f]">Relación Laboral</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Los profesionales registrados en la plataforma <strong>NO son empleados</strong>, agentes ni representantes de OficiosYa. Son prestadores autónomos responsables de sus propias obligaciones legales, fiscales y laborales.
              </p>
            </div>
          </article>

          <article className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-sm">3</span>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#00355f]">Exención de Responsabilidad</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                La plataforma no se responsabiliza por la calidad final del trabajo, demoras, daños materiales o disputas personales entre las partes. La elección del profesional es responsabilidad exclusiva del usuario basándose en perfiles y calificaciones.
              </p>
            </div>
          </article>

          {/* Warning Box: Seguridad */}
          <div className="bg-[#fc8127]/10 border-2 border-[#fc8127] p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-3 text-[#c96218]">
              <ShieldCheck className="w-7 h-7 shrink-0" />
              <h3 className="font-bold text-lg">Seguridad en el Hogar</h3>
            </div>
            <p className="text-xs md:text-sm text-[#9c4a11] font-medium leading-relaxed">
              Es responsabilidad indelegable del cliente verificar la identidad del profesional al momento de asistir al domicilio. <strong>Compare siempre la foto y el nombre</strong> del profesional que llega con los datos registrados en la aplicación antes de permitir el ingreso.
            </p>
          </div>

          <article className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-sm">4</span>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#00355f]">Política de Pagos</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Como medida de seguridad financiera, recomendamos <strong>no abonar el total del servicio</strong> hasta que el trabajo esté efectivamente finalizado y a su entera satisfacción. Use los mecanismos de pago sugeridos por la app para mayor transparencia.
              </p>
            </div>
          </article>

          <article className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-[#00355f] rounded-full flex items-center justify-center font-bold text-sm">5</span>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#00355f]">Conducta y Respeto</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                El uso del chat y las herramientas de contacto está sujeto a normas básicas de convivencia. Queda prohibido el uso de lenguaje ofensivo, discriminatorio o abusivo. El incumplimiento puede resultar en la suspensión permanente de la cuenta.
              </p>
            </div>
          </article>

        </div>

        {/* Action Button Section */}
        <div className="pt-4 space-y-4">
          <div className="flex items-start gap-3 p-1">
            <input 
              id="terms-check" 
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#00355f] rounded border-gray-300 focus:ring-[#00355f] cursor-pointer"
            />
            <label className="text-sm text-gray-700 font-medium cursor-pointer select-none" htmlFor="terms-check">
              He leído y acepto los términos y condiciones de servicio y la política de privacidad de OficiosYa.
            </label>
          </div>

          <button 
            onClick={handleAccept}
            disabled={!isChecked || isSubmitting}
            className={`w-full h-14 rounded-xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${
              !isChecked || isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                : 'bg-[#fc8127] hover:bg-[#e67320] text-white'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {isSubmitting ? 'Procesando...' : 'Aceptar y Continuar'}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-semibold pt-2">Última actualización: 14 de Julio, 2026</p>
        </div>

      </main>

      {/* Bottom Navigation Shell (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-white py-3 px-2 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div onClick={() => router.push('/')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer active:scale-90">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </div>
        <div onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer active:scale-90">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Trabajos</span>
        </div>
        <div onClick={() => router.push('/publicar-trabajo')} className="flex flex-col items-center justify-center text-[#fc8127] cursor-pointer active:scale-90">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Publicar</span>
        </div>
        <div onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer active:scale-90">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </div>
        <div onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer active:scale-90">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </div>
      </nav>

    </div>
  );
}