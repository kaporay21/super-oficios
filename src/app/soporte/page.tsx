"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, AlertTriangle, FileQuestion, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';
import confetti from 'canvas-confetti';

export default function SoportePage() {
  const router = useRouter();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('Pregunta');
  const [mensaje, setMensaje] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume true initially to avoid flicker, or false and check in useEffect
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Archivo adjunto
  const [archivoBase64, setArchivoBase64] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');

  React.useEffect(() => {
    const prof = localStorage.getItem('oficiosya_profesional_perfil');
    const client = localStorage.getItem('oficiosya_cliente_perfil');
    if (prof) {
      const p = JSON.parse(prof);
      setNombre(p.nombre || '');
      setEmail(p.email || '');
      setIsLoggedIn(true);
    } else if (client) {
      const c = JSON.parse(client);
      setNombre(c.nombre || '');
      setEmail(c.email || '');
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoadingAuth(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setArchivoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !mensaje) return;

    setIsSubmitting(true);

    try {
      // Crear objeto del ticket
      const nuevoTicket = {
        nombre,
        email,
        tipo,
        mensaje,
        estado: 'Pendiente',
        archivoBase64, // Inyectamos la imagen base64
        fecha: new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      await dbHelper.createTicket(nuevoTicket);

      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Explosion de confeti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fc8127', '#00355f', '#4CAF50']
      });

      // Limpiar formulario
      setNombre('');
      setEmail('');
      setMensaje('');
      setArchivoBase64('');
      setNombreArchivo('');
    } catch (error) {
      console.error("Error al enviar ticket:", error);
      alert("Hubo un error al enviar el mensaje. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

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
          <h1 className="font-bold text-lg md:text-xl text-[#00355f]">Centro de Soporte</h1>
        </div>
        <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 bg-white flex items-center justify-center p-1 shadow-sm cursor-pointer" onClick={() => router.push('/')}>
          <img src="/mascot.png" alt="OficiosYa" className="w-8 h-8 object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-20 max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow w-full">
        
        {/* Info lateral izquierda */}
        <section className="lg:col-span-5 space-y-6 relative">
          {/* Personaje en el costado izquierdo (solo visible en pantallas grandes) */}
          {/* Personaje en el costado izquierdo (solo visible en pantallas grandes) */}
          <div className="hidden xl:block absolute -left-64 top-16 w-80 h-auto pointer-events-none z-10">
            <img 
              src="/support_worker_transparent.png" 
              alt="Mascota Soporte" 
              className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
            />
          </div>

          <div className="bg-[#00355f] text-white p-6 rounded-3xl shadow-md relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fc8127]/20 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-xl font-bold">¿Cómo podemos ayudarte?</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              En OficiosYa valoramos tu opinión. Si tienes dudas, sugerencias para mejorar la aplicación o reportar algún inconveniente, completa el formulario. Nuestro equipo administrativo te responderá a la brevedad.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#00355f]">Atención Directa</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 text-[#00355f] rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Preguntas Frecuentes</p>
                  <p className="text-xs text-gray-500">Resuelve dudas sobre cobros y registros.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-50 text-[#fc8127] rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Sugerencias y Mejoras</p>
                  <p className="text-xs text-gray-500">¿Quieres nuevas funciones? Dinos tu idea.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Quejas y Reclamos</p>
                  <p className="text-xs text-gray-500">Denuncia conductas inapropiadas en el chat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario a la derecha */}
        <section className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          
          {showSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-[#00355f]">¡Mensaje Enviado!</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Tu mensaje ha sido enviado al panel administrativo de OficiosYa. Te contactaremos vía correo electrónico en las próximas 24 horas.
              </p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="mt-4 px-6 py-2.5 bg-[#00355f] text-white rounded-xl font-bold text-sm hover:bg-[#0f4c81] transition-all"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : isLoadingAuth ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#00355f]" /></div>
          ) : !isLoggedIn ? (
            <div className="text-center py-12 px-4 space-y-6 animate-in fade-in duration-300 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 text-[#00355f]">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black text-[#00355f]">¡Queremos escucharte!</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Para enviar tickets de soporte, consultas, sugerencias o reclamos, necesitas iniciar sesión en tu cuenta. Así podremos hacer seguimiento de tu caso y brindarte una respuesta personalizada.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto px-8 py-3 bg-[#fc8127] text-white rounded-xl font-bold hover:bg-[#e67320] transition-colors shadow-md active:scale-95"
                >
                  Iniciar Sesión
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-gray-400 text-sm">o</span>
                  <button 
                    onClick={() => router.push('/registro-cliente')}
                    className="w-full sm:w-auto px-8 py-3 bg-white text-[#00355f] border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
                  >
                    Crear Cuenta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#00355f]">Formulario de Contacto</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Gonzalo Humacata" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo de Solicitud</label>
                <select 
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                >
                  <option value="Pregunta">Pregunta / Consulta general</option>
                  <option value="Sugerencia">Sugerencia de mejora</option>
                  <option value="Queja">Queja / Reclamo de servicio</option>
                  <option value="Problema Técnico">Inconveniente con la plataforma</option>
                  <option value="Otros">Otros motivos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mensaje / Detalle</label>
                <textarea 
                  required
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Describe detalladamente tu caso..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00355f] text-sm"
                ></textarea>
              </div>

              {/* Botón de Adjuntar Archivo/Imagen */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adjuntar Imagen (Opcional)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#00355f] font-bold text-xs rounded-xl cursor-pointer transition-colors text-center shadow-sm">
                    Elegir Captura / Imagen
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                  {nombreArchivo && (
                    <span className="text-xs text-gray-500 font-semibold truncate max-w-xs">{nombreArchivo}</span>
                  )}
                </div>
                {archivoBase64 && (
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                    <img src={archivoBase64} alt="Previsualización" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setArchivoBase64(''); setNombreArchivo(''); }}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-[10px] hover:bg-black/75"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar a Administración
                  </>
                )}
              </button>
            </form>
          )}

        </section>

      </main>

    </div>
  );
}
