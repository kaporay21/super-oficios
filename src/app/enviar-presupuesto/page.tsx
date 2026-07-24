"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Wrench, MapPin, 
  Clock, Calendar, Send, Loader2, CheckCircle,
  LayoutDashboard, Briefcase, MessageSquare, User
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function EnviarPresupuestoPage() {
  const router = useRouter();
  
  const [precio, setPrecio] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [minDate, setMinDate] = useState('');

  const [perfil, setPerfil] = useState<any>(null);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [jobDetails, setJobDetails] = useState({
    titulo: 'Reparación de Cañería en Cocina',
    descripcion: 'Hay una filtración importante bajo el fregadero. Necesito que se revise la conexión del desagüe y posiblemente cambiar una sección de cañería.',
    ubicacion: 'Barrio Norte, CABA',
    categoria: 'Plomería'
  });

  // Cargar perfil y validar límites de postulaciones + detalles de trabajo
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinDate(today);

    // Cargar detalles del trabajo si jobId existe en URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('jobId');
      if (jobId) {
        const storedJobs = localStorage.getItem('oficiosya_muro_jobs');
        if (storedJobs) {
          const jobs = JSON.parse(storedJobs);
          const foundJob = jobs.find((j: any) => j.id.toString() === jobId);
          if (foundJob) {
            setJobDetails({
              titulo: foundJob.titulo,
              descripcion: foundJob.descripcion,
              ubicacion: foundJob.ubicacion,
              categoria: foundJob.categoria
            });
          }
        }
      }
    }

    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPerfil(parsed);
      
      const plan = parsed.plan || 'Gratis';
      const usadas = parsed.postulacionesUsadas || 0;
      let max = 5;
      if (plan === 'Pro') max = 10;
      if (plan === 'Master') max = Infinity;

      if (usadas >= max) {
        setLimiteAlcanzado(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limiteAlcanzado) {
      alert("No podés enviar más presupuestos. Has alcanzado el límite de tu plan.");
      return;
    }

    setIsSubmitting(true);

    // Simulamos el envío del presupuesto
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Incrementar el uso de postulaciones en localStorage
      const stored = localStorage.getItem('oficiosya_profesional_perfil');
      if (stored) {
        const parsed = JSON.parse(stored);
        const nuevoPerfil = {
          ...parsed,
          postulacionesUsadas: (parsed.postulacionesUsadas || 0) + 1
        };
        localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));
      }

      // Redirigir a "Mis Trabajos" después de mostrar el éxito
      setTimeout(() => {
        router.push('/mis-trabajos');
      }, 1500);
    }, 2000);
  };

  if (limiteAlcanzado) {
    const max = perfil?.plan === 'Pro' ? 10 : 5;
    return (
      <div className="animated-blue-bg text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pb-0">
        <style>{`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-blue-bg {
            background: linear-gradient(-45deg, #001f38, #00355f, #0f4c81, #1e40af);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
          }
        `}</style>
        
        <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 text-[#00355f]"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Logo size="sm" theme="light" />
          </div>
          <div className="w-10"></div>
        </header>

        <main className="flex-grow flex items-center justify-center max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Clock className="w-8 h-8 text-[#fc8127]" />
            </div>
            <h2 className="text-2xl font-black text-[#00355f]">Límite de postulaciones alcanzado</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Has alcanzado tu límite mensual de <strong>{max} presupuestos</strong> en tu plan <strong>{perfil?.plan === 'Gratis' ? 'Básico' : perfil?.plan}</strong>.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mejorá tu plan hoy para obtener postulaciones ilimitadas y seguir postulándote a trabajos en tu zona.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={() => router.push('/planes')}
                className="w-full h-14 bg-[#fc8127] text-white font-bold rounded-xl hover:bg-[#e67320] shadow-md transition-all active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                Ver Planes de Suscripción
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full h-12 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center active:scale-95 text-sm cursor-pointer"
              >
                Volver
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="animated-blue-bg text-[#181c1e] min-h-screen flex flex-col font-sans pb-24 md:pb-0">
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-blue-bg {
          background: linear-gradient(-45deg, #001f38, #00355f, #0f4c81, #1e40af);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}</style>
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors active:scale-95 text-[#00355f]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="sm" theme="light" />
        </div>
        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Job Summary Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-[#00355f]" />
              <span className="text-xs font-bold text-[#00355f] uppercase tracking-wider">Solicitud de {jobDetails.categoria}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{jobDetails.titulo}</h2>
            <p className="text-sm text-gray-600 mb-4 italic leading-relaxed">
              "{jobDetails.descripcion}"
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <MapPin className="w-4 h-4 text-[#fc8127]" />
              {jobDetails.ubicacion}
            </div>
          </div>

          <div className="bg-[#fc8127] rounded-2xl p-5 md:p-6 flex flex-col justify-center items-center text-center shadow-md">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 mb-3 overflow-hidden bg-gray-200 shadow-sm">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1eqdYJo7GlvcxNtXeWsyck6-LUGpunxT2S1iA8OiEkcfE6A-gQNgXd5xcV_PKsmRbeDXz5JAgL6U4ka4q0ISKhvl2NUQGEEdybI92mufzY2gd9JoPxZvwAxl795-Vr7fUJUqxA2tDjjGpnp9Vp4E_heEM22NKyDePqFxG6jx0jBLiDeyFK-iwc1ousHggLZUwGz-OAKWXi7wKK_4aLKwi1thkUwhtLjJ85H2-ChXKKJk_A1LVwdL4r9IC9O4kVOn9LMaPcIGiahlv" 
                alt="Cliente"
              />
            </div>
            <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest">Cliente</span>
            <span className="text-lg font-bold text-white mt-1">Ricardo G.</span>
          </div>
        </div>

        {/* Budget Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 shadow-md space-y-8">
            <div>
              <h3 className="text-xl font-bold text-[#00355f] mb-6 border-b border-gray-100 pb-3">Detalles del Presupuesto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Price Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Precio Total Estimado (ARS)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#00355f]">$</span>
                    <input 
                      type="number" 
                      required 
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="0.00" 
                      className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 ml-1">Tiempo Estimado</label>
                  <div className="relative group">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                    <input 
                      type="text" 
                      required 
                      value={tiempo}
                      onChange={(e) => setTiempo(e.target.value)}
                      placeholder="Ej: 2-3 horas" 
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {/* Date Availability */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">Fecha de Disponibilidad</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00355f] transition-colors" />
                    <input 
                      type="date" 
                      required 
                      min={minDate}
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 ml-1">¿Qué incluye el servicio?</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Detalle materiales, garantía and pasos del trabajo..." 
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50 resize-none"
                  ></textarea>
                  <p className="text-[11px] text-gray-500 mt-1 italic ml-1">Ej: Incluye sellado de juntas, prueba de presión y 3 meses de garantía.</p>
                </div>

              </div>
            </div>

            {/* Submit Button Section INSIDE the white card */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="w-full sm:w-1/3 h-12 border-2 border-gray-300 text-gray-500 hover:text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center active:scale-95 text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || isSuccess}
                className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer ${
                  isSuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-[#fc8127] hover:bg-[#e67320] text-white shadow-sm'
                }`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : isSuccess ? (
                  <><CheckCircle className="w-4 h-4" /> ¡Presupuesto Enviado!</>
                ) : (
                  <>Enviar Presupuesto <Send className="w-4 h-4 ml-1" /></>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Bottom NavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-3 px-4 z-50 border-t border-gray-200 shadow-lg">
        <button onClick={() => router.push('/panel-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Dashboard</span>
        </button>
        <button onClick={() => router.push('/mis-trabajos')} className="flex flex-col items-center justify-center text-[#fc8127] cursor-pointer">
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Mis Trabajos</span>
        </button>
        <button onClick={() => router.push('/chat')} className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Mensajes</span>
        </button>
        <button onClick={() => router.push('/configuracion-profesional')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] cursor-pointer">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}