"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Camera, ImagePlus, Trash2, 
  Eye, Loader2, Info, CheckCircle, Sparkles, Wand2,
  ChevronRight, ArrowRight, ShieldCheck, Star, Award, Layers
} from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabaseStorage';
import { dbHelper } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import Logo from '@/components/Logo';

export default function EditarPerfilPublicoPage() {
  const router = useRouter();
  const { user, profile: authProfile } = useAuth();
  
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const portafolioRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const [perfil, setPerfil] = useState<any>({
    nombre: '',
    bio: '',
    biografia: '',
    bannerUrl: '',
    fotoPerfil: '',
    avatar: '',
    oficios: [],
    provincia: '',
    ciudad: '',
    portafolio: []
  });
  const [plan, setPlan] = useState('Gratis');

  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    let base = stored ? JSON.parse(stored) : {};
    if (authProfile) {
      base = { ...base, ...authProfile, id: authProfile.id || user?.id || base.id };
    } else if (user?.id) {
      base = { ...base, id: user.id };
    }
    
    // Normalizar biografía y avatar
    base.bio = base.bio || base.biografia || '';
    base.fotoPerfil = base.fotoPerfil || base.foto_perfil || base.avatar || '';
    base.bannerUrl = base.bannerUrl || base.banner_url || '';
    base.portafolio = base.portafolio || [];

    setPerfil(base);
    setPlan(base.plan || 'Gratis');
  }, [authProfile, user]);

  const getLimites = () => {
    if (plan === 'Pro') return { max: 10, label: '10' };
    if (plan === 'Master') return { max: Infinity, label: 'Ilimitadas' };
    return { max: 5, label: '5' }; // Gratis / Básico
  };

  // Calcular porcentaje de completitud del perfil
  const calcularFuerzaPerfil = () => {
    let score = 0;
    if (perfil.fotoPerfil || perfil.avatar) score += 25;
    if (perfil.bannerUrl) score += 25;
    if ((perfil.bio || perfil.biografia || '').trim().length >= 30) score += 25;
    if ((perfil.portafolio || []).length > 0) score += 25;
    return score;
  };

  const fuerza = calcularFuerzaPerfil();

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      const stored = localStorage.getItem('oficiosya_profesional_perfil');
      const baseProfile = stored ? JSON.parse(stored) : {};
      const updatedProfile = { 
        ...baseProfile, 
        ...perfil,
        bio: perfil.bio || perfil.biografia || '',
        biografia: perfil.bio || perfil.biografia || '',
        bannerUrl: perfil.bannerUrl || perfil.banner_url || '',
        fotoPerfil: perfil.fotoPerfil || perfil.avatar || '',
        portafolio: perfil.portafolio || []
      };
      
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(updatedProfile));
      localStorage.setItem('oficiosya_session', JSON.stringify(updatedProfile));

      if (user?.id) {
        await dbHelper.updateProfile(user.id, {
          biografia: updatedProfile.biografia,
          foto_perfil: updatedProfile.fotoPerfil,
          provincia: updatedProfile.provincia,
          ciudad: updatedProfile.ciudad,
          oficios: updatedProfile.oficios,
          telefono: updatedProfile.telefono,
          portafolio: updatedProfile.portafolio
        }).catch(err => console.error("Error guardando en Supabase:", err));
      }

      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSaving(true);
      const path = `${perfil.email || user?.id || 'anonymous'}/avatar_${Date.now()}_${file.name}`;
      const { publicUrl } = await uploadImageToSupabase('avatars', path, file);
      setIsSaving(false);

      if (publicUrl) {
        setPerfil((prev: any) => ({ ...prev, fotoPerfil: publicUrl, avatar: publicUrl }));
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSaving(true);
      const path = `${perfil.email || user?.id || 'anonymous'}/banner_${Date.now()}_${file.name}`;
      const { publicUrl } = await uploadImageToSupabase('banners', path, file);
      setIsSaving(false);

      if (publicUrl) {
        setPerfil((prev: any) => ({ ...prev, bannerUrl: publicUrl }));
      }
    }
  };

  const handlePortafolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const limites = getLimites();
      const currentCount = perfil.portafolio?.length || 0;
      
      if (currentCount >= limites.max) {
        alert(`Límite alcanzado. Tu plan actual (${plan}) permite máximo ${limites.label} fotos.`);
        router.push('/planes');
        return;
      }

      const file = e.target.files[0];
      setIsSaving(true);
      const path = `${perfil.email || user?.id || 'anonymous'}/portfolio_${Date.now()}_${file.name}`;
      const { publicUrl } = await uploadImageToSupabase('portfolio', path, file);
      setIsSaving(false);

      if (publicUrl) {
        const nuevaFoto = { id: Date.now(), url: publicUrl };
        setPerfil((prev: any) => ({
          ...prev,
          portafolio: [...(prev.portafolio || []), nuevaFoto]
        }));
      }
    }
  };

  const eliminarFotoPortafolio = (id: number) => {
    setPerfil((prev: any) => ({
      ...prev,
      portafolio: (prev.portafolio || []).filter((f: any) => f.id !== id)
    }));
  };

  // Plantillas inteligentes de biografía según oficio
  const plantillasBio = [
    {
      titulo: '🔧 Plomería e Instalaciones',
      texto: `Profesional matriculado especializado en plomería residencial y comercial. Realizo reparaciones de urgencia 24hs, destapes, colocación de griferías y nuevas instalaciones con garantía escrita.`
    },
    {
      titulo: '⚡ Electricidad y Obras',
      texto: `Técnico electricista capacitado para obras e instalaciones domiciliarias. Colocación de tableros, iluminación LED, térmicas, disyuntores y detección de fallas con total seguridad.`
    },
    {
      titulo: '🧱 Albañilería y Reformas',
      texto: `Especialista en refacciones integrales, mampostería, revoques, colocado de cerámicos y trabajos en seco (Durlock). Trabajo prolijo con estricto cumplimiento de plazos.`
    },
    {
      titulo: '🎨 Pintura y Acabados',
      texto: `Pintor profesional de interiores y exteriores. Tratamiento previo de pared, eliminación de humedad y terminaciones satinadas o al látex de primera calidad.`
    },
    {
      titulo: '✨ General de Confianza',
      texto: `Profesional independiente con amplia experiencia en el rubro. Me destaco por la puntualidad, prolijidad y transparencia en cada presupuesto.`
    }
  ];

  const aplicarPlantilla = (texto: string) => {
    setPerfil((prev: any) => ({
      ...prev,
      bio: texto,
      biografia: texto
    }));
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen text-[#181c1e] font-sans pb-24">
      {/* Inputs ocultos para carga de archivos */}
      <input type="file" ref={avatarRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
      <input type="file" ref={bannerRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
      <input type="file" ref={portafolioRef} onChange={handlePortafolioUpload} accept="image/*" className="hidden" />

      {/* Header Fijo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/panel-profesional')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <Logo size="md" theme="light" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-[#00355f] rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showLivePreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
            </button>

            <button
              onClick={handleGuardar}
              disabled={isSaving}
              className="bg-[#fc8127] text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 hover:bg-[#e67320] transition-colors shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de éxito */}
      {showSuccess && (
        <div className="bg-emerald-600 text-white text-center py-3 text-sm font-bold shadow-md animate-in slide-in-from-top duration-300">
          ✅ ¡Perfil actualizado correctamente! Se reflejará en la vista de los clientes.
        </div>
      )}

      {/* Contenedor Principal */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Barra de Progreso y Salud del Perfil */}
        <section className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-orange-50 rounded-2xl border border-orange-100">
              <span className="text-xl font-black text-[#fc8127]">{fuerza}%</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-[#00355f] text-base md:text-lg">Asistente de Perfil Público</h2>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  fuerza === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {fuerza === 100 ? 'Perfil Estelar' : 'En optimización'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {fuerza === 100 
                  ? '¡Excelente! Tu perfil está 100% optimizado para transmitir máxima confianza.' 
                  : 'Completá los 3 pasos para aumentar tus postulaciones y conseguir más clientes.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const targetId = perfil.id || authProfile?.id || user?.id || 'me';
              router.push(`/profesional/${targetId}`);
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-100 text-[#00355f] hover:bg-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Eye className="w-4 h-4" /> Ver cómo lo ven los clientes
          </button>
        </section>

        {/* NAVEGACIÓN EN 3 PASOS (TABS INTERACTIVOS) */}
        <div className="grid grid-cols-3 gap-2 bg-gray-200/70 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
              activeStep === 1
                ? 'bg-white text-[#00355f] shadow-sm font-extrabold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Camera className="w-4 h-4 text-[#fc8127]" />
            <span className="hidden sm:inline">Paso 1:</span> Fotos & Marca
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
              activeStep === 2
                ? 'bg-white text-[#00355f] shadow-sm font-extrabold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#fc8127]" />
            <span className="hidden sm:inline">Paso 2:</span> Presentación
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
              activeStep === 3
                ? 'bg-white text-[#00355f] shadow-sm font-extrabold scale-[1.01]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ImagePlus className="w-4 h-4 text-[#fc8127]" />
            <span className="hidden sm:inline">Paso 3:</span> Portafolio
          </button>
        </div>

        {/* CONTENIDO DEL PASO ACTIVO + VISTA PREVIA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Formulario Interactivo del Paso */}
          <div className={`${showLivePreview ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
            
            {/* --- PASO 1: FOTOS & MARCA --- */}
            {activeStep === 1 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-[#00355f]">Foto de Perfil e Imagen de Portada</h3>
                  <p className="text-xs text-gray-500 mt-0.5">La primera impresión es vital. Subí imágenes nítidas y profesionales.</p>
                </div>

                {/* Foto de Perfil (Avatar) */}
                <div className="flex items-center gap-5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="relative">
                    <img 
                      src={perfil.fotoPerfil || perfil.avatar || "https://i.pravatar.cc/150?u=" + (perfil.id || 'default')} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="absolute bottom-0 right-0 p-1.5 bg-[#fc8127] text-white rounded-full hover:scale-105 transition-transform shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#00355f]">Foto de Perfil</h4>
                    <p className="text-xs text-gray-500">Formato JPG o PNG. Tamaño máximo recomendado 2 MB.</p>
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="text-xs font-bold text-[#fc8127] hover:underline pt-1 inline-block"
                    >
                      Cambiar foto de perfil
                    </button>
                  </div>
                </div>

                {/* Banner de Portada */}
                <div className="space-y-3">
                  <label className="font-bold text-xs text-gray-700 block uppercase tracking-wide">Imagen de Portada (Banner)</label>
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-r from-[#00355f] to-slate-800 border border-gray-200 flex items-center justify-center group">
                    {perfil.bannerUrl ? (
                      <img src={perfil.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-white p-4">
                        <Camera className="w-8 h-8 mx-auto mb-2 opacity-70" />
                        <p className="text-xs font-bold">Sin imagen de portada cargada</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => bannerRef.current?.click()}
                        className="bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors shadow"
                      >
                        {perfil.bannerUrl ? 'Cambiar Banner' : 'Subir Banner'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="bg-[#00355f] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#0f4c81] transition-colors"
                  >
                    Siguiente: Presentación <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- PASO 2: PRESENTACIÓN & BIOGRAFÍA --- */}
            {activeStep === 2 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-[#00355f]">Tu Presentación Profesional</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Contales a tus clientes qué servicios ofrecés y por qué deben contratarte a vos.</p>
                </div>

                {/* ASISTENTE DE REDACCIÓN RÁPIDA (CON 1-CLIC) */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                  <div className="flex items-center gap-2 text-[#fc8127]">
                    <Wand2 className="w-4 h-4" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Asistente de Redacción (Hacé Clic para Usar)</h4>
                  </div>
                  <p className="text-xs text-gray-600">Elegí una plantilla según tu especialidad y personalizala a tu gusto:</p>
                  <div className="flex flex-wrap gap-2">
                    {plantillasBio.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => aplicarPlantilla(p.texto)}
                        className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-xl border border-orange-200/80 font-bold hover:bg-[#fc8127] hover:text-white hover:border-[#fc8127] transition-all shadow-sm active:scale-95"
                      >
                        {p.titulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área de Texto Biografía */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-xs text-gray-700 block uppercase tracking-wide">Sobre Mí / Biografía</label>
                    <span className="text-xs font-bold text-gray-400">{(perfil.bio || perfil.biografia || '').length} / 500 caract.</span>
                  </div>
                  <textarea
                    rows={6}
                    maxLength={500}
                    value={perfil.bio || perfil.biografia || ''}
                    onChange={(e) => setPerfil({ ...perfil, bio: e.target.value, biografia: e.target.value })}
                    placeholder="Contale a tus clientes sobre tu experiencia, garantías de trabajo y disponibilidad..."
                    className="w-full p-4 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#fc8127] outline-none transition-all leading-relaxed"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="bg-[#00355f] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#0f4c81] transition-colors"
                  >
                    Siguiente: Portafolio <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --- PASO 3: PORTAFOLIO DE TRABAJOS --- */}
            {activeStep === 3 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#00355f]">Galería de Trabajos Realizados</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Subí fotos reales del antes y después de tus proyectos.</p>
                  </div>
                  <span className="text-xs font-black bg-orange-100 text-[#fc8127] px-3 py-1 rounded-full border border-orange-200 uppercase">
                    Plan {plan} ({(perfil.portafolio || []).length}/{getLimites().label})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div
                    onClick={() => {
                      const limites = getLimites();
                      if ((perfil.portafolio || []).length >= limites.max) {
                        alert(`Límite alcanzado para tu Plan ${plan}.`);
                        router.push('/planes');
                      } else {
                        portafolioRef.current?.click();
                      }
                    }}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/50 hover:border-[#fc8127] group transition-all"
                  >
                    <ImagePlus className="w-7 h-7 text-gray-400 group-hover:text-[#fc8127] mb-1 transition-colors" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-[#fc8127] transition-colors">Agregar Foto</span>
                  </div>

                  {(perfil.portafolio || []).map((foto: any, idx: number) => (
                    <div key={foto.id || idx} className="aspect-square relative rounded-2xl overflow-hidden group border border-gray-200 shadow-sm">
                      <img src={foto.url || foto} alt="Trabajo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => eliminarFotoPortafolio(foto.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={handleGuardar}
                    className="bg-[#fc8127] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#e67320] transition-colors shadow-md active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" /> Finalizar y Guardar
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* VISTA PREVIA EN VIVO (LIVE CARD PREVIEW) */}
          {showLivePreview && (
            <div className="lg:col-span-5 sticky top-24 space-y-4 animate-in fade-in duration-300">
              <div className="bg-[#00355f] text-white p-4 rounded-3xl shadow-lg border border-blue-900 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#fc8127]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Así te ven tus clientes</span>
                  </div>
                  <span className="bg-[#fc8127] text-white text-[10px] font-black px-2 py-0.5 rounded-full">EN VIVO</span>
                </div>

                {/* Previsualización Tarjeta Pública */}
                <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-md">
                  {/* Banner mockup */}
                  <div className="h-28 bg-slate-800 relative">
                    {perfil.bannerUrl && (
                      <img src={perfil.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute -bottom-6 left-4">
                      <img 
                        src={perfil.fotoPerfil || perfil.avatar || "https://i.pravatar.cc/150?u=" + (perfil.id || 'preview')} 
                        alt="Avatar Preview" 
                        className="w-14 h-14 rounded-full border-2 border-white object-cover shadow"
                      />
                    </div>
                  </div>

                  <div className="pt-8 p-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-[#00355f] text-base">{perfil.nombre || 'Tu Nombre'}</h4>
                      <CheckCircle className="w-4 h-4 text-green-600 fill-green-100" />
                    </div>

                    <p className="text-xs font-bold text-[#fc8127] uppercase">
                      {perfil.oficios && perfil.oficios.length > 0 ? perfil.oficios.join(', ') : 'Tu Especialidad'}
                    </p>

                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {(perfil.bio || perfil.biografia) || 'Tu presentación aparecerá aquí cuando la escribas...'}
                    </p>

                    {perfil.portafolio && perfil.portafolio.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Portafolio ({perfil.portafolio.length} fotos)</span>
                        <div className="flex gap-1.5 mt-1 overflow-x-auto pb-1">
                          {perfil.portafolio.slice(0, 3).map((f: any, i: number) => (
                            <img key={i} src={f.url || f} alt="Thumb" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}