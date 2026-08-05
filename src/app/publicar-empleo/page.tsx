"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Briefcase, MapPin, 
  FileText, AlertCircle, Zap, DollarSign, Loader2,
  Users, Check, Plus, X, ShieldCheck
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import { dbHelper } from '@/lib/supabase';
import { OFICIOS_CORE, PROVINCIAS_CORE } from '@/lib/constants';
import { useAuth } from '@/components/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const PROVINCIAS = PROVINCIAS_CORE;
const OFICIOS = OFICIOS_CORE;
const TIPOS = ['Permanente', 'Por obra', 'Temporal', 'Part-time'];

export default function PublicarEmpleoPage() {
  return (
    <AuthGuard>
      <PublicarEmpleoContent />
    </AuthGuard>
  );
}

function PublicarEmpleoContent() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    titulo: '',
    oficio: 'Plomería',
    tipo: 'Por obra',
    provincia: 'Tucumán',
    ciudad: '',
    salario: '',
    descripcion: '',
    vacantes: '1'
  });
  
  const [urgente, setUrgente] = useState(false);
  
  const [requisitoInput, setRequisitoInput] = useState('');
  const [requisitos, setRequisitos] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRequisito = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    if (requisitoInput.trim() && !requisitos.includes(requisitoInput.trim())) {
      setRequisitos(prev => [...prev, requisitoInput.trim()]);
      setRequisitoInput('');
    }
  };

  const handleRemoveRequisito = (tag: string) => {
    setRequisitos(prev => prev.filter(r => r !== tag));
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
      // Inyectamos los requisitos al final de la descripción para mantener compatibilidad en Supabase
      let descripcionFinal = formData.descripcion;
      if (requisitos.length > 0) {
        descripcionFinal += '\n\n✅ Requisitos Adicionales:\n- ' + requisitos.join('\n- ');
      }

      const jobData = {
        ...formData,
        descripcion: descripcionFinal,
        empleador: profile?.nombre || 'Usuario Profesional',
        empleadorAvatar: profile?.foto_perfil || profile?.fotoPerfil || 'https://i.pravatar.cc/150',
        postulantes: 0,
        urgente: urgente,
        nuevo: true,
        esEmpleo: true,
      };
      
      await dbHelper.createJob(jobData);
      
      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/bolsa-empleo?publicado=true');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al publicar el empleo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f2f6f9] text-[#181c1e] min-h-screen font-sans flex flex-col xl:flex-row relative">
      
      {/* HEADER MOBILE */}
      <div className="xl:hidden sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-[#00355f]">Publicar Empleo</h1>
        <div className="w-9 h-9"></div>
      </div>

      {/* FORMULARIO IZQUIERDA */}
      <div className="w-full xl:w-7/12 flex-shrink-0 flex flex-col h-full relative z-10 xl:overflow-y-auto">
        <div className="p-4 md:p-10 lg:p-14 max-w-3xl mx-auto w-full">
          
          <div className="hidden xl:flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-[#00355f]">Publicar Empleo</h1>
              <p className="text-sm font-medium text-gray-500">Buscá talento calificado para tu equipo u obra.</p>
            </div>
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
              <div className="absolute top-0 left-0 w-1 h-full bg-[#fc8127]"></div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#fc8127]" /> 1. Datos del Puesto
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Título del empleo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ej: Necesito 2 pintores con experiencia para obra..."
                    className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#fc8127] focus:ring-4 focus:ring-[#fc8127]/10 outline-none bg-gray-50 hover:bg-white text-base font-semibold text-gray-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">Oficio Requerido</label>
                    <select
                      name="oficio"
                      value={formData.oficio}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#fc8127] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      {OFICIOS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">Vacantes</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="vacantes"
                        value={formData.vacantes}
                        onChange={handleChange}
                        className="w-full h-14 pl-12 pr-5 rounded-2xl border-2 border-gray-100 focus:border-[#fc8127] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                      >
                        {[1,2,3,4,5,'5+'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-3">Tipo de Contratación</label>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, tipo: t}))}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                          formData.tipo === t 
                            ? 'bg-[#fc8127]/10 border-[#fc8127] text-[#fc8127]' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TARJETA 2: UBICACIÓN Y CONDICIONES */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00355f]"></div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00355f]" /> 2. Ubicación y Sueldo
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">Provincia</label>
                    <select
                      name="provincia"
                      value={formData.provincia}
                      onChange={handleChange}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] outline-none bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                    >
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#00355f] mb-2">Ciudad / Localidad <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ej: Yerba Buena"
                      className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] focus:ring-4 focus:ring-[#00355f]/10 outline-none bg-gray-50 hover:bg-white text-base font-semibold text-gray-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Rango salarial (Opcional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="salario"
                      value={formData.salario}
                      onChange={handleChange}
                      placeholder="Ej: $15,000 / día"
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] focus:ring-4 focus:ring-[#00355f]/10 outline-none bg-gray-50 hover:bg-white text-base font-semibold text-gray-800 transition-all"
                    />
                  </div>
                </div>

                {/* TOGGLE URGENCIA */}
                <div className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl mt-4">
                  <div>
                    <h4 className="text-sm font-black text-red-700 flex items-center gap-1"><Zap className="w-4 h-4" /> Búsqueda Urgente</h4>
                    <p className="text-[11px] text-red-600 font-medium">Destacará tu anuncio con un badge de urgencia.</p>
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

            {/* TARJETA 3: REQUISITOS Y DESCRIPCIÓN */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]"></div>
              
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#10b981]" /> 3. Detalle y Requisitos
              </h3>
              
              <div className="space-y-6">
                
                {/* TAGS (REQUISITOS ADICIONALES) */}
                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Requisitos Adicionales (Opcional)</label>
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={requisitoInput}
                        onChange={(e) => setRequisitoInput(e.target.value)}
                        onKeyDown={handleAddRequisito}
                        placeholder="Ej: Herramientas propias (Presioná Enter)"
                        className="w-full h-12 px-5 rounded-xl border-2 border-gray-100 focus:border-[#10b981] outline-none bg-gray-50 text-sm font-semibold transition-all pr-12"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddRequisito}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {requisitos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {requisitos.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">
                            <span>{req}</span>
                            <button type="button" onClick={() => handleRemoveRequisito(req)} className="text-emerald-400 hover:text-emerald-700">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#00355f] mb-2">Descripción Completa <span className="text-red-500">*</span></label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Detallá las responsabilidades, horarios y cualquier otra información importante para los postulantes..."
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-[#00355f] focus:ring-4 focus:ring-[#00355f]/10 outline-none bg-gray-50 hover:bg-white text-sm font-medium text-gray-800 transition-all resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* BOTÓN SUBMIT MOBILE (Oculto en desktop donde hay sidebar estático) */}
            <div className="pt-4 block xl:hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-2xl font-black text-white text-base shadow-xl shadow-[#fc8127]/20 transition-all flex items-center justify-center gap-2
                  ${isSubmitting ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#fc8127] hover:bg-[#e06d19] active:scale-[0.98]'}`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Publicar Empleo Ahora</>
                )}
              </button>
            </div>
            
            {/* Espaciador final para mobile */}
            <div className="h-20 xl:hidden"></div>
          </form>
        </div>
      </div>

      {/* SIDEBAR DERECHO: LIVE PREVIEW & SUBMIT (Solo Desktop XL) */}
      <div className="hidden xl:flex w-5/12 bg-[#001b33] flex-col p-10 h-screen sticky top-0 shadow-2xl z-20 justify-center">
        
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-[#fc8127]" />
            <h2 className="text-2xl font-black text-white">Vista Previa</h2>
          </div>

          {/* TARJETA DE PREVIEW */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            {/* Cinta Superior */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={profile?.foto_perfil || profile?.fotoPerfil || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                <div>
                  <h4 className="text-sm font-black text-[#00355f] leading-none">{profile?.nombre || 'Usuario'}</h4>
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
              {formData.titulo || 'Título de la Búsqueda...'}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100">
                {formData.oficio}
              </span>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold border border-purple-100">
                {formData.tipo}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold border border-gray-200 flex items-center gap-1">
                <Users className="w-3 h-3" /> {formData.vacantes} vacantes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{formData.ciudad || 'Ciudad'}, {formData.provincia}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="truncate">{formData.salario || 'A convenir'}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap">
              {formData.descripcion || 'Aquí aparecerá la descripción de la oferta laboral...'}
            </p>

            {requisitos.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requisitos</p>
                <div className="flex flex-wrap gap-1.5">
                  {requisitos.map((req, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> {req}
                    </span>
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
                <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
              ) : (
                <><Zap className="w-6 h-6 relative z-10" /> <span className="relative z-10">Publicar Empleo Ahora</span></>
              )}
            </button>
            <p className="text-center text-xs text-[#fc8127] font-bold mt-4 opacity-80">
              Listo para recibir postulantes en tu zona
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
