"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Bell, Wrench, Zap, Hammer, PaintRoller, 
  MoreHorizontal, Camera, Trash2, MapPin, Crosshair, 
  Calendar, Send, Home, ClipboardList, MessageSquare, User, Loader2 
} from 'lucide-react';

export default function PublicarTrabajoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para la interactividad del formulario
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('San Miguel de Tucumán'); // Valor por defecto
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  
  // Estado para las fotos y envío
  const [fotos, setFotos] = useState<{id: number, url: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'Plomería', label: 'Plomería', icon: Wrench },
    { id: 'Electricidad', label: 'Electricidad', icon: Zap },
    { id: 'Albañilería', label: 'Albañilería', icon: Hammer },
    { id: 'Pintura', label: 'Pintura', icon: PaintRoller },
    { id: 'Otros', label: 'Otros', icon: MoreHorizontal },
  ];

  // Manejador para simular la subida de fotos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const nuevaFoto = {
        id: Date.now(),
        url: URL.createObjectURL(e.target.files[0])
      };
      setFotos([...fotos, nuevaFoto]);
    }
  };

  const eliminarFoto = (id: number) => {
    setFotos(fotos.filter(foto => foto.id !== id));
  };

  // Manejador del envío del formulario
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Aquí irá la inserción real a Supabase: supabase.from('trabajos').insert({...})
    const nuevoTrabajo = {
      categoria: selectedCategory,
      titulo,
      descripcion,
      ubicacion,
      urgencia: urgency,
      fotos
    };
    
    console.log("Datos listos para Supabase:", nuevoTrabajo);

    setTimeout(() => {
      setIsSubmitting(false);
      alert('¡Trabajo publicado con éxito!');
      router.push('/'); // Redirige al inicio o al muro del cliente tras publicar
    }, 1500);
  };

  // Validación básica para habilitar el botón de envío
  const isFormValid = selectedCategory && titulo.trim() !== '' && descripcion.trim() !== '' && ubicacion.trim() !== '';

  return (
    <main className="min-h-screen bg-[#f7fafc] text-[#181c1e] font-sans flex flex-col overflow-x-hidden pb-32">
      
      {/* Input de archivo oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handlePhotoUpload} 
      />

      {/* TopAppBar */}
      <header className="bg-white border-b border-gray-200 shadow-sm w-full top-0 sticky z-50 flex justify-between items-center px-4 h-16 md:h-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="transition-colors duration-200 active:scale-95 text-[#00355f] hover:bg-gray-100 p-2 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-blue-50 rounded-full">
              <span className="text-xl">👷🏻‍♂️</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-xl md:text-2xl text-[#00355f] leading-none">
                Oficios<span className="text-[#fc8127]">Ya</span>
              </h1>
              <p className="text-[11px] font-medium text-[#0f4c81]">lo que buscas a un click</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={() => router.push('/notificaciones')} className="transition-colors duration-200 active:scale-95 text-[#00355f] hover:bg-gray-100 p-2 rounded-full relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <div className="flex-grow">
        {/* Hero Section */}
        <section className="px-4 md:px-12 pt-8 pb-4 max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#00355f] mb-2">Publicar un Trabajo</h2>
          <p className="text-gray-500 text-base">
            Completa los detalles para conectar con profesionales verificados en tu área.
          </p>
        </section>

        {/* Form Canvas */}
        <section className="px-4 md:px-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
            
            {/* Step 1: Category */}
            <div>
              <label className="block text-lg font-bold text-[#00355f] mb-4">
                ¿Qué servicio necesitas?
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 flex items-center gap-2 ${
                        isSelected 
                          ? 'border-[#fc8127] bg-[#fc8127]/10 text-[#c96218] shadow-sm' 
                          : 'border-transparent bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Title & Description */}
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-2" htmlFor="job-title">
                  Título del Trabajo
                </label>
                <input 
                  id="job-title"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Reparación de filtración en cocina" 
                  className="w-full h-12 px-4 rounded-xl bg-[#f7fafc] border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-2" htmlFor="job-desc">
                  Descripción Detallada
                </label>
                <textarea 
                  id="job-desc"
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el problema, materiales necesarios o cualquier detalle relevante..." 
                  className="w-full px-4 py-3 rounded-xl bg-[#f7fafc] border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all placeholder:text-gray-400 resize-none"
                ></textarea>
              </div>
            </div>

            {/* Step 3: Photos */}
            <div>
              <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-3">
                Fotos (Opcional)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-[#f7fafc] hover:bg-gray-100 transition-colors text-gray-500 active:scale-95"
                >
                  <Camera className="w-7 h-7 mb-1" />
                  <span className="text-[10px] font-bold">Añadir</span>
                </button>
                
                {/* Thumbnails dinámicos */}
                {fotos.map((foto) => (
                  <div key={foto.id} className="aspect-square rounded-xl overflow-hidden relative group border border-gray-200 shadow-sm">
                    <img src={foto.url} alt="Problema" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => eliminarFoto(foto.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Location */}
            <div>
              <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-3">
                Ubicación
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder="Ingresa tu dirección o usa el mapa" 
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f7fafc] border border-gray-300 focus:ring-2 focus:ring-[#00355f] focus:border-[#00355f] outline-none transition-all"
                  />
                </div>
                <button className="h-12 px-6 rounded-xl border-2 border-[#00355f] text-[#00355f] font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors active:scale-95">
                  <Crosshair className="w-5 h-5" />
                  Usar mi ubicación
                </button>
              </div>
              
              {/* Minimal Map View */}
              <div className="mt-4 w-full h-40 rounded-xl overflow-hidden border border-gray-300 relative">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWE60ICHA2UUg2iNhS0GqeHW4f8DlshOVk38GUAAHJF6WCMIdntJC9rh3sytx8XkE55NkdPG44g0nbJt0Kva16GAiXR77_osxxumoPXOPTVsR7vZB-UJgAnI2WsXz43rWAluOHWjh3DNAsUmzhOIVjmwwZHLA6SxNLsu1fYHugRhYduZVLGu-cZnVkGZ_Hck5cxUOez0Uj621UZnjut_BvKyJiKtJOJb2AKn-fEmKbRrbyw4g0uY4csItnvC-tGx-IZb8xXNc-em1G')" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <MapPin className="text-[#fc8127] fill-white w-10 h-10 drop-shadow-md" />
                </div>
              </div>
            </div>

            {/* Step 5: Urgency */}
            <div>
              <label className="block text-xs font-bold text-[#00355f] uppercase tracking-wider mb-4">
                Nivel de Urgencia
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="urgency" 
                    value="normal" 
                    className="peer sr-only" 
                    checked={urgency === 'normal'}
                    onChange={() => setUrgency('normal')}
                  />
                  <div className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl peer-checked:border-[#00355f] peer-checked:bg-blue-50 transition-all text-gray-500 peer-checked:text-[#00355f]">
                    <Calendar className="w-6 h-6 mb-1" />
                    <span className="font-bold text-sm">Normal</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="urgency" 
                    value="urgent" 
                    className="peer sr-only"
                    checked={urgency === 'urgent'}
                    onChange={() => setUrgency('urgent')}
                  />
                  <div className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl peer-checked:border-red-500 peer-checked:bg-red-50 transition-all text-gray-500 peer-checked:text-red-600">
                    <Zap className="w-6 h-6 mb-1" />
                    <span className="font-bold text-sm">Urgente</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={`w-full py-4 transition-all rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg ${
                  !isFormValid 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#fc8127] hover:bg-[#e67320] active:scale-[0.98] text-white'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? 'Publicando...' : 'Publicar Trabajo'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Al publicar, aceptas nuestros términos y condiciones de servicio.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-around items-center px-2 py-3 md:hidden">
        <div 
          onClick={() => router.push('/')}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] py-1 transition-all duration-300 cursor-pointer active:scale-90"
        >
          <Home className="w-6 h-6" />
          <span className="font-medium text-[11px] mt-1">Explorar</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#fc8127] py-1 transition-all duration-300 cursor-pointer active:scale-90">
          <ClipboardList className="w-6 h-6 fill-current" />
          <span className="font-bold text-[11px] mt-1">Publicar</span>
        </div>
        <div 
          onClick={() => router.push('/chat')}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] py-1 transition-all duration-300 cursor-pointer active:scale-90"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-medium text-[11px] mt-1">Mensajes</span>
        </div>
        <div 
          onClick={() => router.push('/perfil-cliente')}
          className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00355f] py-1 transition-all duration-300 cursor-pointer active:scale-90"
        >
          <User className="w-6 h-6" />
          <span className="font-medium text-[11px] mt-1">Perfil</span>
        </div>
      </nav>
    </main>
  );
}