"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Wrench, MapPin, 
  Clock, Calendar, Send, Loader2, CheckCircle,
  LayoutDashboard, Briefcase, MessageSquare, User
} from 'lucide-react';

export default function EnviarPresupuestoPage() {
  const router = useRouter();
  
  const [precio, setPrecio] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [minDate, setMinDate] = useState('');

  // Establecer la fecha mínima como hoy para no permitir fechas pasadas
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinDate(today);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulamos el envío del presupuesto
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Redirigir a "Mis Trabajos" después de mostrar el éxito
      setTimeout(() => {
        router.push('/mis-trabajos');
      }, 1500);
    }, 2000);
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

      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 w-full">
        
        {/* Job Summary Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 bg-white rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-[#00355f]" />
              <span className="text-xs font-bold text-[#00355f] uppercase tracking-wider">Solicitud de Servicio</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Reparación de Cañería en Cocina</h2>
            <p className="text-sm text-gray-600 mb-4 italic leading-relaxed">
              "Hay una filtración importante bajo el fregadero. Necesito que se revise la conexión del desagüe y posiblemente cambiar una sección de cañería."
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <MapPin className="w-4 h-4 text-[#fc8127]" />
              Barrio Norte, CABA
            </div>
          </div>

          <div className="bg-[#00355f] rounded-2xl p-5 md:p-6 flex flex-col justify-center items-center text-center shadow-md">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 mb-3 overflow-hidden bg-gray-200">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1eqdYJo7GlvcxNtXeWsyck6-LUGpunxT2S1iA8OiEkcfE6A-gQNgXd5xcV_PKsmRbeDXz5JAgL6U4ka4q0ISKhvl2NUQGEEdybI92mufzY2gd9JoPxZvwAxl795-Vr7fUJUqxA2tDjjGpnp9Vp4E_heEM22NKyDePqFxG6jx0jBLiDeyFK-iwc1ousHggLZUwGz-OAKWXi7wKK_4aLKwi1thkUwhtLjJ85H2-ChXKKJk_A1LVwdL4r9IC9O4kVOn9LMaPcIGiahlv" 
                alt="Cliente"
              />
            </div>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Cliente</span>
            <span className="text-lg font-bold text-white mt-1">Ricardo G.</span>
          </div>
        </div>

        {/* Budget Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 shadow-sm">
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
                  placeholder="Detalle materiales, garantía y pasos del trabajo..." 
                  className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none transition-all text-sm bg-gray-50 resize-none"
                ></textarea>
                <p className="text-[11px] text-gray-500 mt-1 italic ml-1">Ej: Incluye sellado de juntas, prueba de presión y 3 meses de garantía.</p>
              </div>

            </div>
          </div>

          {/* Submit Button Section */}
          <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`w-full h-14 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                isSuccess 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#fc8127] hover:bg-[#e67320] text-white'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
              ) : isSuccess ? (
                <><CheckCircle className="w-5 h-5" /> ¡Presupuesto Enviado!</>
              ) : (
                <>Enviar Presupuesto <Send className="w-5 h-5 ml-1" /></>
              )}
            </button>
            
            <button 
              type="button" 
              onClick={() => router.back()}
              className="w-full h-12 border-2 border-[#00355f] text-[#00355f] font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center active:scale-95"
            >
              Cancelar
            </button>
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