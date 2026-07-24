"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Star, CheckCircle, ShieldCheck, 
  MessageSquare, Home, Briefcase, PlusCircle, User, Loader2
} from 'lucide-react';

export default function FinalizarTrabajoPage() {
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor, selecciona una calificación en estrellas.");
      return;
    }

    setIsSubmitting(true);

    // Simulamos el envío de la calificación y cierre del trabajo
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Redirigir al perfil del cliente como solicitaste
      setTimeout(() => {
        router.push('/perfil-cliente');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 text-[#00355f]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[#00355f]">Oficios<span className="text-[#fc8127]">Ya</span></span>
        </div>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* Navegación Lateral Desktop (Versión Cliente) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-6">
        <button onClick={() => router.push('/panel-cliente')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><Home className="w-6 h-6" /></button>
        <button onClick={() => router.push('/mis-solicitudes')} className="w-12 h-12 bg-blue-50 text-[#00355f] rounded-xl flex items-center justify-center shadow-sm"><Briefcase className="w-6 h-6" /></button>
        <button onClick={() => router.push('/publicar-trabajo')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><PlusCircle className="w-6 h-6" /></button>
        <button onClick={() => router.push('/chat')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><MessageSquare className="w-6 h-6" /></button>
        <div className="mt-auto mb-6">
          <button onClick={() => router.push('/perfil-cliente')} className="w-12 h-12 text-gray-400 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"><User className="w-6 h-6" /></button>
        </div>
      </div>

      <main className="flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-2">Finalizar Trabajo</h1>
          <p className="text-gray-500 text-sm">Confirma la finalización y califica a tu profesional.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Resumen del Trabajo y Profesional */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlVCn8FRzTbVmZxic91A-2Ugh1qFBfezVm0wqIKlK38GDjuh2U6BsS9cS4zgLxeCMeUJsDJTluGVvtCoxYzGLllutVL9VFc2SrplBpzopr-qWY5s5igTFagEH0SSVO1Guaku8KqEvFomdFF2iBq1jSsEvjwMlhS7AtAIIOo00YPiuGl-8phMWi49kjhbMIJlKx53XoXFj35c4I8CDVN5DTgxJLofVISU8aZNRfS6Q1mlob5-BG_hOeTLKJPogDS15WJ20ty764J5OU" 
                alt="Profesional" 
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Electricidad</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Lucía Ferreyra</h3>
              <div className="bg-gray-50 rounded-xl p-3 mt-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase">Trabajo Realizado</p>
                <p className="text-sm font-semibold text-[#00355f]">Reparación de cortocircuito en tablero principal</p>
              </div>
            </div>
          </div>

          {/* Calificación Interactiva */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Cómo evaluarías el servicio?</h3>
            <p className="text-xs text-gray-500 mb-6">Tu calificación ayuda a otros clientes a elegir mejor.</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  <Star 
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'fill-[#fc8127] text-[#fc8127]' 
                        : 'text-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="text-left space-y-2">
              <label className="text-xs font-bold text-gray-700 ml-1">Escribe una reseña (Opcional)</label>
              <textarea 
                rows={4} 
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="¿Qué tal fue la puntualidad, la limpieza y el trato?" 
                className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Notice & Submit */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              {/* Texto corregido para evitar menciones de pagos o retenciones */}
              <p className="text-xs text-green-800 font-medium leading-relaxed">
                Al confirmar, declaras que el trabajo fue completado satisfactoriamente y registrarás tu valoración en la comunidad de <span className="font-bold">OficiosYa</span>.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full h-14 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#00355f] hover:bg-[#0f4c81] text-white'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Guardando valoración...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Confirmar y Calificar</>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">¡Trabajo Finalizado!</h4>
              <p className="text-sm text-gray-500 mt-2">La calificación ha sido registrada con éxito. Gracias por usar OficiosYa.</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/panel-cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        <button onClick={() => router.push('/mis-solicitudes')} className="flex flex-col items-center justify-center text-[#fc8127]">
          <Briefcase className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold mt-1">Mis Trabajos</span>
        </button>
        <button onClick={() => router.push('/publicar-trabajo')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Publicar</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] relative">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </nav>

    </div>
  );
}