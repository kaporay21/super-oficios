"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Briefcase, MapPin, 
  FileText, AlertCircle, Zap, Loader2,
  Camera, Trash2, Crosshair,
  Calendar, ShieldCheck, Hammer
} from 'lucide-react';
import { dbHelper } from '@/lib/supabase';
import { compressImage, uploadImageToSupabase } from '@/lib/supabaseStorage';
import { OFICIOS_CORE, PROVINCIAS_CORE } from '@/lib/constants';
import { useAuth } from '@/components/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Logo from '@/components/Logo';

const PROVINCIAS = PROVINCIAS_CORE;
const OFICIOS = OFICIOS_CORE;

export default function PublicarTrabajoPage() {
  return (
    <AuthGuard requiredRole="cliente">
      <PublicarTrabajoContent />
    </AuthGuard>
  );
}

function PublicarTrabajoContent() {
  const router = useRouter();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    oficio: 'Plomería',
    provincia: 'Tucumán',
    ciudad: '',
    descripcion: '',
    propiedadId: '',
  });

  const [propiedades, setPropiedades] = useState<any[]>([]);

  React.useEffect(() => {
    if (!profile?.id) return;
    dbHelper.getPropiedades(profile.id).then(setPropiedades).catch(() => {});
  }, [profile?.id]);

  const [urgente, setUrgente] = useState(false);
  // Guardamos el File real además del preview: el archivo se sube a Storage
  // recién al enviar, y `url` es solo un object-URL local para la vista previa.
  const [fotos, setFotos] = useState<{ id: number; url: string; file: File }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Texto de progreso: subir 3 fotos puede tardar y un spinner mudo se lee
  // como que la app se colgó.
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fotos.length >= 3) {
      setError('Podés adjuntar hasta 3 fotos.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('El archivo tiene que ser una imagen (JPG, PNG o WEBP).');
      return;
    }

    try {
      // Comprimimos ya para que el preview pese poco y la subida sea rápida.
      const comprimida = await compressImage(file).catch(() => file);
      setFotos(prev => [
        ...prev,
        { id: Date.now(), url: URL.createObjectURL(comprimida), file: comprimida },
      ]);
      setError('');
    } catch (err: any) {
      console.error('Error procesando foto:', err);
      setError('No pudimos procesar esa imagen. Probá con otra.');
    } finally {
      // Permite volver a elegir el mismo archivo si el usuario lo borra y reintenta.
      e.target.value = '';
    }
  };

  const eliminarFoto = (id: number) => {
    setFotos(prev => {
      const foto = prev.find(f => f.id === id);
      if (foto) URL.revokeObjectURL(foto.url);
      return prev.filter(f => f.id !== id);
    });
  };

  // Liberamos los object-URLs al desmontar para no filtrar memoria.
  React.useEffect(() => {
    return () => { fotos.forEach(f => URL.revokeObjectURL(f.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.county;
        
        if (city) {
          setFormData(prev => ({ ...prev, ciudad: city }));
        }
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      alert('No se pudo obtener tu ubicación. Asegurate de dar permisos al navegador.');
      setIsLocating(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo.trim() || !formData.ciudad.trim() || !formData.descripcion.trim()) {
      setError('Por favor completá los campos obligatorios (Título, Ciudad, Descripción).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Subimos las fotos a Storage antes de crear el trabajo.
      // Para el profesional, ver la foto del problema es la diferencia entre
      // presupuestar con criterio y presupuestar a ciegas.
      let imagenes: string[] = [];
      if (fotos.length > 0) {
        setUploadStatus(`Subiendo ${fotos.length} foto${fotos.length > 1 ? 's' : ''}...`);
        const subidas = await Promise.all(
          fotos.map(async (foto, i) => {
            const ext = (foto.file.name.split('.').pop() || 'jpg').toLowerCase();
            const path = `${profile?.id || 'anon'}/${Date.now()}-${i}.${ext}`;
            const { publicUrl } = await uploadImageToSupabase('trabajos', path, foto.file);
            return publicUrl;
          })
        );
        imagenes = subidas.filter((u): u is string => !!u);

        if (imagenes.length < fotos.length) {
          // No abortamos la publicación por una foto: el trabajo igual sirve.
          console.warn(`Se subieron ${imagenes.length} de ${fotos.length} fotos.`);
        }
      }

      setUploadStatus('Publicando tu solicitud...');

      const jobData = {
        categoria: formData.oficio,
        oficio: formData.oficio,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ubicacion: `${formData.ciudad}, ${formData.provincia}`, // Fallback backwards compatibility
        provincia: formData.provincia,
        ciudad: formData.ciudad,
        propiedadId: formData.propiedadId || null,
        tipo: urgente ? 'Temporal' : 'Por obra',
        tiempo: 'Hace unos instantes',
        urgente: urgente,
        empleador: profile?.nombre || profile?.name || 'Cliente',
        empleadorAvatar: profile?.avatar || profile?.foto_perfil || profile?.fotoPerfil || '',
        imagenes,
        esEmpleo: false
      };

      await dbHelper.createJob(jobData);

      // Las notificaciones a los profesionales las emite createJob() contra
      // Supabase. Antes había acá un bloque que escribía una notificación
      // "simulada" en localStorage que nadie leía nunca: se eliminó.

      router.push('/cliente');
    } catch (err: any) {
      console.error('Error al publicar el trabajo:', err);
      setError(err?.message || 'No pudimos publicar tu solicitud. Revisá tu conexión e intentá de nuevo.');
      setUploadStatus('');
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f2f6f9] text-[#181c1e] min-h-screen font-sans flex flex-col xl:flex-row relative">
      
      {/* Input Oculto de Archivos */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

      {/* HEADER MOBILE */}
      <div className="xl:hidden sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Logo size="sm" theme="light" />
        <div className="w-9 h-9"></div>
      </div>

      {/* FORMULARIO IZQUIERDA */}
      <div className="w-full xl:w-7/12 flex-shrink-0 flex flex-col h-full relative z-10 xl:overflow-y-auto pb-20 xl:pb-0">
        <div className="p-4 md:p-10 lg:p-14 max-w-3xl mx-auto w-full">
          
          <div className="hidden xl:flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-[#00355f]">Solicitar Profesional</h1>
              <p className="text-sm font-medium text-gray-500">Completá los datos del servicio que necesitás en tu hogar.</p>
            </div>
          </div>

          <div className="xl:hidden mb-6">
            <h1 className="text-2xl font-black text-[#00355f]">Solicitar Profesional</h1>
            <p className="text-xs font-medium text-gray-500 mt-1">Conectá con expertos en tu zona.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* TARJETA 1: DATOS PRINCIPALES */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00355f]"></div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#00355f]" /> 1. ¿Qué necesitás?
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Título de la solicitud <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Reparación de filtración en baño..."
                    className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] focus:ring-4 focus:ring-[#00355f]/10 outline-none bg-gray-50 hover:bg-white text-base font-semibold text-gray-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Categoría del Servicio</label>
                  <select
                    name="oficio"
                    value={formData.oficio}
                    onChange={handleChange}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Descripción Detallada <span className="text-red-500">*</span></label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe el problema, materiales que ya tenés o medidas estimadas..."
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] focus:ring-4 focus:ring-[#00355f]/10 outline-none bg-gray-50 hover:bg-white text-sm font-medium text-gray-800 transition-all resize-y"
                  ></textarea>
                </div>

                {propiedades.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">¿Para qué propiedad es este trabajo? <span className="text-gray-400 font-medium">(opcional)</span></label>
                    <select
                      name="propiedadId"
                      value={formData.propiedadId}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      <option value="">Ninguna en particular</option>
                      {propiedades.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nombre || p.direccion || 'Propiedad'}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1.5">Vinculándolo, este trabajo va a aparecer en el historial de esa propiedad dentro de Mi Hogar.</p>
                  </div>
                )}
              </div>
            </div>

            {/* TARJETA 2: UBICACIÓN Y FOTOS */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#fc8127]"></div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fc8127]" /> 2. Ubicación y Detalles Visuales
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">Provincia</label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#fc8127] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-bold text-[#00355f]">Ciudad / Barrio <span className="text-red-500">*</span></label>
                      <button type="button" onClick={handleGetLocation} className="text-[10px] font-bold text-[#fc8127] flex items-center gap-1 hover:underline">
                        {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />} 
                        Usar GPS
                      </button>
                    </div>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: Barrio Norte"
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#fc8127] focus:ring-4 focus:ring-[#fc8127]/10 outline-none bg-gray-50 hover:bg-white text-base font-semibold text-gray-800 transition-all"
                    />
                  </div>
                </div>

                {/* GALERÍA DE FOTOS */}
                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-3">Fotos de Referencia (Máximo 3)</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {fotos.length < 3 && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-[#fc8127] transition-all text-gray-400 hover:text-[#fc8127]"
                      >
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Añadir Foto</span>
                      </button>
                    )}
                    
                    {fotos.map((foto) => (
                      <div key={foto.id} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm group border border-gray-200">
                        <img src={foto.url} alt="Referencia" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => eliminarFoto(foto.id)}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOGGLE URGENCIA */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl mt-4">
                  <div>
                    <h4 className="text-sm font-black text-red-700 flex items-center gap-1"><Zap className="w-4 h-4" /> Emergencia</h4>
                    <p className="text-[11px] text-red-600 font-medium">Marcá esto si necesitás solución inmediata.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUrgente(!urgente)}
                    className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${urgente ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform absolute ${urgente ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT MOBILE */}
            <div className="pt-2 block xl:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-2xl font-black text-white text-base shadow-xl shadow-[#fc8127]/20 transition-all flex items-center justify-center gap-2
                  ${isSubmitting ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#fc8127] hover:bg-[#e06d19] active:scale-[0.98]'}`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {uploadStatus || 'Publicando...'}</>
                ) : (
                  <><Zap className="w-5 h-5" /> Solicitar Presupuestos</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SIDEBAR DERECHO: LIVE PREVIEW & SUBMIT (Solo Desktop XL) */}
      <div className="hidden xl:flex w-5/12 bg-[#001b33] flex-col p-10 h-screen sticky top-0 shadow-2xl z-20 justify-center">
        
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-[#fc8127]" />
            <h2 className="text-2xl font-black text-white">Vista Previa Profesional</h2>
          </div>

          {/* TARJETA DE PREVIEW */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            {/* Cinta Superior */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={profile?.avatar || profile?.fotoPerfil || profile?.foto_perfil || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                <div>
                  <h4 className="text-sm font-black text-[#00355f] leading-none">{profile?.nombre || 'Cliente'}</h4>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#10b981]" /> Identidad Verificada
                  </div>
                </div>
              </div>
              {urgente && (
                <span className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3" /> Urgente
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-[#181c1e] mb-2 leading-tight">
              {formData.titulo || 'Título de la solicitud...'}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-[#fc8127]/10 text-[#c96218] rounded-md text-[10px] font-bold border border-[#fc8127]/20 flex items-center gap-1">
                <Hammer className="w-3 h-3" /> {formData.oficio}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold border border-gray-200 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {formData.ciudad || 'Ubicación'}, {formData.provincia}
              </span>
            </div>

            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap">
              {formData.descripcion || 'Aquí aparecerá la descripción del problema o trabajo a realizar...'}
            </p>

            {fotos.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Imágenes Adjuntas</p>
                <div className="flex gap-2">
                  {fotos.map((foto) => (
                    <img key={foto.id} src={foto.url} alt="Miniatura" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón de Publicación (Desktop) */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full h-16 rounded-2xl font-black text-white text-lg shadow-2xl shadow-[#fc8127]/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${isSubmitting ? 'bg-gray-600 cursor-not-allowed shadow-none' : 'bg-[#fc8127] hover:bg-[#e06d19] active:scale-[0.98]'}`}
            >
              {!isSubmitting && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>}
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> {uploadStatus || 'Procesando...'}</>
              ) : (
                <><Zap className="w-6 h-6 relative z-10" /> <span className="relative z-10">Solicitar Presupuestos</span></>
              )}
            </button>
            <p className="text-center text-xs text-[#fc8127] font-bold mt-4 opacity-80">
              Notificaremos a los expertos en tu área de inmediato
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}