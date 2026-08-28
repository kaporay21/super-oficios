"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, MapPin, Wrench, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';
import { OFICIOS_CORE, PROVINCIAS_Y_CIUDADES } from '@/lib/constants';

const PROVINCIAS_CORE = Object.keys(PROVINCIAS_Y_CIUDADES);

function CompletarPerfilContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [selectedOficios, setSelectedOficios] = useState<string[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Esta página no está protegida por AuthGuard (para no crear un loop de
  // redirección con el propio chequeo que manda acá), así que se valida
  // la sesión acá mismo.
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // Precargar lo que ya tenga, por si le falta solo uno de los dos campos.
  useEffect(() => {
    if (profile?.oficios?.length > 0) setSelectedOficios(profile.oficios);
    if (profile?.provincia) setSelectedProvincia(profile.provincia);
    if (profile?.ciudad) setSelectedCiudad(profile.ciudad);
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#fc8127] animate-spin" />
      </div>
    );
  }

  const handleOficioToggle = (oficio: string) => {
    setSelectedOficios(prev =>
      prev.includes(oficio) ? prev.filter(o => o !== oficio) : [...prev, oficio]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOficios.length === 0 || !selectedProvincia) {
      setError('Tenés que elegir al menos un oficio y tu provincia para poder continuar.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await dbHelper.updateProfile(user!.id, {
        oficios: selectedOficios,
        provincia: selectedProvincia,
        ciudad: selectedCiudad || undefined,
      });
      await refreshProfile();
      const next = searchParams.get('next') || '/panel-profesional';
      router.replace(next);
    } catch (err: any) {
      setError(err?.message || 'No pudimos guardar tu perfil. Probá de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans">
      <header className="w-full bg-white h-16 flex items-center justify-center px-4 border-b border-gray-200 shadow-sm">
        <Logo size="md" theme="light" />
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-xl p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <AlertTriangle className="w-5 h-5 text-[#fc8127] shrink-0 mt-0.5" />
            <div>
              <h1 className="text-lg font-black text-[#00355f]">Completá tu perfil para continuar</h1>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Nos falta tu oficio y tu provincia. Sin esos datos los clientes no pueden encontrarte
                en las búsquedas, así que es obligatorio completarlos antes de seguir usando OficiosYa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Wrench className="w-4 h-4 text-[#fc8127]" /> Oficios o Especialidades
              </label>
              <div className="flex flex-wrap gap-2">
                {OFICIOS_CORE.map((oficio) => (
                  <button
                    type="button"
                    key={oficio}
                    onClick={() => handleOficioToggle(oficio)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      selectedOficios.includes(oficio)
                        ? 'bg-[#00355f] text-white border-[#00355f]'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {oficio}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700" htmlFor="provincia">
                  <MapPin className="w-4 h-4 text-[#fc8127]" /> Provincia
                </label>
                <select
                  id="provincia"
                  required
                  value={selectedProvincia}
                  onChange={(e) => { setSelectedProvincia(e.target.value); setSelectedCiudad(''); }}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none text-sm font-medium"
                >
                  <option value="" disabled>Selecciona Provincia</option>
                  {PROVINCIAS_CORE.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700" htmlFor="ciudad">Ciudad / Localidad (opcional)</label>
                <select
                  id="ciudad"
                  value={selectedCiudad}
                  disabled={!selectedProvincia}
                  onChange={(e) => setSelectedCiudad(e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00355f] outline-none text-sm font-medium disabled:opacity-50"
                >
                  <option value="">Selecciona Localidad</option>
                  {selectedProvincia && PROVINCIAS_Y_CIUDADES[selectedProvincia]?.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : 'Guardar y continuar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CompletarPerfilProfesionalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#fc8127] animate-spin" />
      </div>
    }>
      <CompletarPerfilContenido />
    </Suspense>
  );
}
