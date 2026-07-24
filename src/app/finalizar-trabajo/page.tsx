"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Bell, Star, CheckCircle, ShieldCheck, 
  MessageSquare, Home, Briefcase, PlusCircle, User, Loader2
} from 'lucide-react';
import { dbHelper } from '@/lib/supabase';
import Logo from '@/components/Logo';
import Tooltip from '@/components/Tooltip';
import { HomeIcon, PanelIcon, MuroIcon, TrabajosIcon, MensajesIcon, SoporteIcon, ConfiguracionIcon, PublicarIcon } from '@/components/ModernIcons';

interface TrabajoActivo {
  id: string;
  profesionalId: number;
  profesionalNombre: string;
  profesionalAvatar: string;
  profesionalTrade: string;
  trabajoTitulo: string;
  precio: number;
  fechaInicio: string;
  estado: 'en_curso' | 'finalizado';
  chatId: string;
}

function FinalizarContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trabajoId = searchParams.get('trabajoId');
  
  const [trabajo, setTrabajo] = useState<TrabajoActivo | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar trabajo activo desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_trabajos_activos');
    if (stored && trabajoId) {
      const trabajos: TrabajoActivo[] = JSON.parse(stored);
      const encontrado = trabajos.find(t => t.id === trabajoId);
      if (encontrado) {
        setTrabajo(encontrado);
      }
    }

    // Fallback: si no viene trabajoId, usar datos de demo
    if (!trabajoId) {
      setTrabajo({
        id: 'demo',
        profesionalId: 2,
        profesionalNombre: 'Lucía Ferreyra',
        profesionalAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlVCn8FRzTbVmZxic91A-2Ugh1qFBfezVm0wqIKlK38GDjuh2U6BsS9cS4zgLxeCMeUJsDJTluGVvtCoxYzGLllutVL9VFc2SrplBpzopr-qWY5s5igTFagEH0SSVO1Guaku8KqEvFomdFF2iBq1jSsEvjwMlhS7AtAIIOo00YPiuGl-8phMWi49kjhbMIJlKx53XoXFj35c4I8CDVN5DTgxJLofVISU8aZNRfS6Q1mlob5-BG_hOeTLKJPogDS15WJ20ty764J5OU',
        profesionalTrade: 'Electricidad',
        trabajoTitulo: 'Reparación de cortocircuito en tablero principal',
        precio: 15000,
        fechaInicio: new Date().toISOString().split('T')[0],
        estado: 'en_curso',
        chatId: '1',
      });
    }
  }, [trabajoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
       alert("Por favor, selecciona una calificación en estrellas.");
       return;
    }
    if (!trabajo) return;

    setIsSubmitting(true);

    // 1. Guardar la reseña en base de datos real (reviews) y localStorage (para compatibilidad)
    const clientePerfil = JSON.parse(localStorage.getItem('oficiosya_cliente_perfil') || '{}');
    const nuevaResena = {
      id: `resena_${Date.now()}`,
      profesionalId: trabajo.profesionalId,
      clienteNombre: clientePerfil.nombre || 'Diego Martínez',
      clienteAvatar: clientePerfil.avatar || 'https://i.pravatar.cc/150',
      rating: rating,
      texto: review || 'Sin comentario adicional.',
      trabajoTitulo: trabajo.trabajoTitulo,
      fecha: new Date().toISOString().split('T')[0],
    };

    const resenasExistentes = JSON.parse(localStorage.getItem('oficiosya_resenas') || '[]');
    resenasExistentes.push(nuevaResena);
    localStorage.setItem('oficiosya_resenas', JSON.stringify(resenasExistentes));

    try {
      await dbHelper.createReview({
        professional_id: String(trabajo.profesionalId),
        job_id: String(trabajo.id),
        client_name: clientePerfil.nombre || 'Diego Martínez',
        rating: rating,
        review_text: review || 'Sin comentario adicional.'
      });
    } catch (err) {
      console.error("Error al guardar la reseña en base de datos:", err);
    }

    // 2. Marcar el trabajo como finalizado
    const trabajosActivos = JSON.parse(localStorage.getItem('oficiosya_trabajos_activos') || '[]');
    const actualizados = trabajosActivos.map((t: TrabajoActivo) => 
      t.id === trabajo.id ? { ...t, estado: 'finalizado' } : t
    );
    localStorage.setItem('oficiosya_trabajos_activos', JSON.stringify(actualizados));

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Redirigir al perfil del cliente
      setTimeout(() => {
        router.push('/perfil-cliente');
      }, 2500);
    }, 1500);
  };

  if (!trabajo) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00355f] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <main className="flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00355f] mb-2">Finalizar Trabajo</h1>
          <p className="text-gray-500 text-sm">Confirma la finalización y califica a tu profesional.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Resumen del Trabajo y Profesional (Datos Dinámicos) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src={trabajo.profesionalAvatar} 
                alt={trabajo.profesionalNombre} 
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">{trabajo.profesionalTrade}</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{trabajo.profesionalNombre}</h3>
              <div className="bg-gray-50 rounded-xl p-3 mt-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase">Trabajo Realizado</p>
                <p className="text-sm font-semibold text-[#00355f]">{trabajo.trabajoTitulo}</p>
              </div>
              {trabajo.precio && (
                <div className="bg-blue-50 rounded-xl p-3 mt-2 border border-blue-100">
                  <p className="text-xs font-bold text-gray-500 uppercase">Monto Acordado</p>
                  <p className="text-lg font-black text-[#00355f]">${trabajo.precio.toLocaleString('es-AR')}</p>
                </div>
              )}
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

            {rating > 0 && (
              <p className="text-sm font-bold text-[#fc8127] mb-4">
                {rating === 1 && '😞 Malo'}
                {rating === 2 && '😐 Regular'}
                {rating === 3 && '🙂 Bueno'}
                {rating === 4 && '😊 Muy Bueno'}
                {rating === 5 && '🌟 Excelente'}
              </p>
            )}

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
                Al confirmar, declaras que el trabajo fue completado satisfactoriamente y registrarás tu valoración en la comunidad de <span className="font-bold">OficiosYa</span>. La reseña aparecerá públicamente en el perfil del profesional.
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
              <p className="text-sm text-gray-500 mt-2">Tu reseña ha sido publicada en el perfil de <span className="font-bold text-[#00355f]">{trabajo.profesionalNombre}</span>. Gracias por usar OficiosYa.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function FinalizarTrabajoPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-24 pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 text-[#00355f] relative z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* Centered Logo with Mascot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10" onClick={() => router.push('/cliente')}>
          <Logo size="md" theme="light" />
        </div>

        <Tooltip title="Notificaciones" text="Revisá avisos importantes, alertas de empleo y actualizaciones sobre tu cuenta al instante." position="bottom">
          <button onClick={() => router.push('/notificaciones')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative z-10">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </Tooltip>
      </header>

      {/* Navegación Lateral Desktop (Versión Cliente) */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-24 bg-white border-r border-gray-200 z-30 flex-col items-center py-8 gap-5 select-none shadow-sm">
        
        <Tooltip title="Inicio" text="Volvé a la pantalla principal para explorar profesionales y rubros en tu zona." position="right">
          <button 
            onClick={() => router.push('/cliente')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#fc8127] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <HomeIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#fc8127] uppercase tracking-wider">Inicio</span>
          </button>
        </Tooltip>

        <Tooltip title="Mis solicitudes" text="Hacé seguimiento de tus trabajos solicitados, presupuestos recibidos e historial." position="right">
          <button className="flex flex-col items-center justify-center gap-1 group text-[#fc8127] hover:scale-105 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-[#fc8127] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:shadow-md transition-all">
              <TrabajosIcon className="w-6 h-6" active={true} />
            </div>
            <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-wider">Solicitudes</span>
          </button>
        </Tooltip>

        <Tooltip title="Publicar trabajo" text="Publicá un nuevo trabajo o necesidad para recibir presupuestos de profesionales." position="right">
          <button 
            onClick={() => router.push('/publicar-trabajo')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#10b981] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <PublicarIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#10b981] uppercase tracking-wider">Publicar</span>
          </button>
        </Tooltip>

        <Tooltip title="Mensajes" text="Chateá con los profesionales seleccionados para coordinar visitas o trabajos." position="right">
          <button 
            onClick={() => router.push('/chat')}
            className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
              <MensajesIcon className="w-6 h-6" active={false} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Mensajes</span>
          </button>
        </Tooltip>

        <div className="mt-auto mb-6">
          <Tooltip title="Mi Perfil" text="Editá tu información personal, dirección de contacto y preferencias de tu cuenta." position="right">
            <button 
              onClick={() => router.push('/configuracion-cliente')} 
              className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-[#00355f] hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <ConfiguracionIcon className="w-6 h-6" active={false} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#00355f] uppercase tracking-wider">Configurar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <Suspense fallback={<div className="flex-grow flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#00355f] animate-spin" /></div>}>
        <FinalizarContenido />
      </Suspense>

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 border-t z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center justify-center text-[#fc8127]">
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