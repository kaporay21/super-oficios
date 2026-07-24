"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Camera, ImagePlus, Trash2, 
  Eye, Loader2, Info, CheckCircle
} from 'lucide-react';
import { uploadImageToSupabase } from '@/lib/supabaseStorage';

export default function EditarPerfilPublicoPage() {
  const router = useRouter();
  
  const bannerRef = useRef<HTMLInputElement>(null);
  const portafolioRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [perfil, setPerfil] = useState<any>({
    bio: '',
    bannerUrl: '',
    portafolio: []
  });
  const [plan, setPlan] = useState('Gratis');

  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPerfil(parsed);
      setPlan(parsed.plan || 'Gratis');
    }
  }, []);

  const getLimites = () => {
    if (plan === 'Pro') return { max: 10, label: '10' };
    if (plan === 'Master') return { max: Infinity, label: 'Ilimitadas' };
    return { max: 5, label: '5' }; // Gratis / Básico
  };

  const handleGuardar = () => {
    setIsSaving(true);
    setTimeout(() => {
      const stored = localStorage.getItem('oficiosya_profesional_perfil');
      const baseProfile = stored ? JSON.parse(stored) : {};
      const updatedProfile = { ...baseProfile, ...perfil };
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(updatedProfile));

      // Sincronizar también con la lista de usuarios de administración si está
      const storedUsers = localStorage.getItem('oficiosya_admin_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((u: any) => u.email === 'roberto@gmail.com' ? { ...u, name: updatedProfile.nombre } : u);
        localStorage.setItem('oficiosya_admin_users', JSON.stringify(updatedUsers));
      }

      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsSaving(true);
      const path = `${perfil.correo || 'anonymous'}/banner_${Date.now()}_${file.name}`;
      const { publicUrl, error } = await uploadImageToSupabase('banners', path, file);
      setIsSaving(false);

      if (error) {
        alert(`Error al subir el banner: ${error.message || error}`);
        return;
      }
      if (publicUrl) {
        setPerfil({ ...perfil, bannerUrl: publicUrl });
      }
    }
  };

  const handlePortafolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const limites = getLimites();
      const currentCount = perfil.portafolio?.length || 0;
      
      if (currentCount >= limites.max) {
        alert(`Límite de portafolio alcanzado. Tu plan actual (${plan === 'Gratis' ? 'Básico' : plan}) permite un máximo de ${limites.label} fotos. Mejorá tu plan para agregar más.`);
        router.push('/planes');
        return;
      }

      const file = e.target.files[0];
      setIsSaving(true);
      const path = `${perfil.correo || 'anonymous'}/portfolio_${Date.now()}_${file.name}`;
      const { publicUrl, error } = await uploadImageToSupabase('portfolio', path, file);
      setIsSaving(false);

      if (error) {
        alert(`Error al subir la foto al portafolio: ${error.message || error}`);
        return;
      }
      if (publicUrl) {
        const nuevaFoto = {
          id: Date.now(),
          url: publicUrl
        };
        setPerfil({ ...perfil, portafolio: [...(perfil.portafolio || []), nuevaFoto] });
      }
    }
  };

  const eliminarFotoPortafolio = (id: number) => {
    setPerfil({
      ...perfil,
      portafolio: (perfil.portafolio || []).filter((foto: any) => foto.id !== id)
    });
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen font-sans pb-24 md:pb-8">
      <input type="file" ref={bannerRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
      <input type="file" ref={portafolioRef} className="hidden" accept="image/*" onChange={handlePortafolioUpload} />

      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-[#00355f]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-[#00355f]">Editar Perfil Público</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGuardar}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#fc8127] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#e67320] transition-all active:scale-95 shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden md:inline">Guardar Cambios</span>
            <span className="md:hidden">Guardar</span>
          </button>
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">¡Perfil actualizado con éxito!</span>
        </div>
      )}

      <main className="pt-20 max-w-3xl mx-auto px-4 space-y-6">
        
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="relative h-40 md:h-56 bg-gray-200 w-full group">
            <img src={perfil.bannerUrl} alt="Portada del Perfil" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={() => bannerRef.current?.click()} className="bg-white text-[#00355f] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-transform">
                <Camera className="w-4 h-4" /> Cambiar Portada
              </button>
            </div>
            <button onClick={() => bannerRef.current?.click()} className="md:hidden absolute bottom-4 right-4 p-3 bg-white text-[#00355f] rounded-full shadow-lg active:scale-95">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 bg-blue-50/50 flex gap-3 items-start border-t border-gray-100">
            <Info className="w-5 h-5 text-[#00355f] shrink-0 mt-0.5" />
            <p className="text-xs text-[#00355f] leading-relaxed">
              Esta foto será lo primero que vean tus clientes. Te recomendamos subir una imagen tuya trabajando o de tu furgoneta/herramientas.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-[#00355f]">Sobre Mí</h3>
            <span className="text-xs font-medium text-gray-400">{perfil.bio.length} / 300</span>
          </div>
          <textarea
            value={perfil.bio}
            onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })}
            maxLength={300}
            rows={5}
            placeholder="Cuéntale a tus clientes por qué deberían contratarte..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#00355f] focus:bg-white transition-all resize-none leading-relaxed"
          />
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-[#00355f]">Fotos de Trabajos</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#00355f] border border-blue-100 uppercase tracking-wider">
                  Plan {plan === 'Gratis' ? 'Básico' : plan} ({(perfil.portafolio || []).length}/{getLimites().label})
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Sube el antes y después de tus mejores proyectos.</p>
            </div>
            <button 
              onClick={() => {
                const limites = getLimites();
                if (((perfil.portafolio || []).length) >= limites.max) {
                  alert(`Límite de portafolio alcanzado. Tu plan actual (${plan === 'Gratis' ? 'Básico' : plan}) permite un máximo de ${limites.label} fotos. Mejorá tu plan para agregar más.`);
                  router.push('/planes');
                } else {
                  portafolioRef.current?.click();
                }
              }} 
              className="hidden md:flex items-center gap-2 bg-[#00355f] text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-[#0f4c81] transition-colors"
            >
              <ImagePlus className="w-4 h-4" /> Agregar Foto
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div 
              onClick={() => {
                const limites = getLimites();
                if (((perfil.portafolio || []).length) >= limites.max) {
                  alert(`Límite de portafolio alcanzado. Tu plan actual (${plan === 'Gratis' ? 'Básico' : plan}) permite un máximo de ${limites.label} fotos. Mejorá tu plan para agregar más.`);
                  router.push('/planes');
                } else {
                  portafolioRef.current?.click();
                }
              }} 
              className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#fc8127] group transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-[#fc8127] mb-2 transition-colors" />
              <span className="text-xs font-bold text-gray-500 group-hover:text-[#fc8127] transition-colors">Subir Foto</span>
            </div>
            {(perfil.portafolio || []).map((foto: any) => (
              <div key={foto.id} className="aspect-square relative rounded-xl overflow-hidden group border border-gray-200 shadow-sm">
                <img src={foto.url} alt="Trabajo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => eliminarFotoPortafolio(foto.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Botón corregido apuntando a /profesional/1 */}
        <button 
          onClick={() => router.push('/profesional/1')} 
          className="w-full py-4 mt-4 bg-gray-100 text-[#00355f] font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors border border-gray-200 active:scale-[0.98]"
        >
          <Eye className="w-5 h-5" /> Ver cómo lo verán los clientes
        </button>

      </main>
    </div>
  );
}