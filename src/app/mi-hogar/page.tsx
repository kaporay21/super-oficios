"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, Plus, Trash2, ChevronRight, FileText, Wrench, User,
  Building, Building2, MapPin, Calendar, ArrowLeft, Loader2,
  AlertCircle, Package, ShieldCheck, Clock, CheckCircle2,
  Edit3, X, Save, Search
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function MiHogarPage() {
  return (
    <AuthGuard requiredRole="cliente">
      <MiHogarContent />
    </AuthGuard>
  );
}

const TIPOS_PROPIEDAD = [
  { value: 'casa', label: 'Casa', icon: '🏠' },
  { value: 'departamento', label: 'Departamento', icon: '🏢' },
  { value: 'oficina', label: 'Oficina', icon: '🏗️' },
  { value: 'local', label: 'Local', icon: '🏪' },
  { value: 'otro', label: 'Otro', icon: '📍' },
];

function MiHogarContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    tipo: 'casa',
    superficie_m2: '',
    anio_construccion: '',
  });

  useEffect(() => {
    if (user?.id) loadPropiedades();
  }, [user?.id]);

  const loadPropiedades = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dbHelper.getPropiedades(user.id);
      setPropiedades(data);
    } catch (err: any) {
      setError('No se pudieron cargar tus propiedades. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !form.nombre.trim()) return;
    setGuardando(true);
    try {
      await dbHelper.createPropiedad({
        cliente_id: user.id,
        nombre: form.nombre,
        direccion: form.direccion,
        tipo: form.tipo,
        superficie_m2: form.superficie_m2 ? parseInt(form.superficie_m2) : undefined,
        anio_construccion: form.anio_construccion ? parseInt(form.anio_construccion) : undefined,
      });
      setForm({ nombre: '', direccion: '', tipo: 'casa', superficie_m2: '', anio_construccion: '' });
      setShowForm(false);
      await loadPropiedades();
    } catch (err: any) {
      setError(err?.message || 'Error al crear la propiedad.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminás esta propiedad y todo su historial?')) return;
    try {
      await dbHelper.deletePropiedad(id);
      setPropiedades(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la propiedad.');
    }
  };

  const getTipoEmoji = (tipo: string) => {
    return TIPOS_PROPIEDAD.find(t => t.value === tipo)?.icon || '🏠';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white">
      {/* Header */}
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#fc8127] to-amber-500 rounded-xl flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Mi Hogar</h1>
            <p className="text-[10px] text-slate-400">Centro Digital del Hogar</p>
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Nueva propiedad
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Saludo */}
        <div className="bg-gradient-to-r from-[#fc8127]/10 to-amber-500/5 border border-[#fc8127]/20 rounded-2xl p-5">
          <h2 className="text-lg font-black text-white">
            ¡Hola, {profile?.nombre?.split(' ')[0] || 'Vecino'}! 🏠
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Organizá el historial, comprobantes y mantenimientos de tus propiedades desde un solo lugar.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Formulario nueva propiedad */}
        {showForm && (
          <div className="bg-[#001529] border border-slate-700/60 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#fc8127]" /> Nueva Propiedad
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Nombre de la propiedad *</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Casa principal, Depto centro..."
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#fc8127]"
                  >
                    {TIPOS_PROPIEDAD.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                    placeholder="Ej: Av. Corrientes 1234"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Superficie (m²)</label>
                    <input
                      type="number"
                      value={form.superficie_m2}
                      onChange={e => setForm(f => ({ ...f, superficie_m2: e.target.value }))}
                      placeholder="120"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Año construcción</label>
                    <input
                      type="number"
                      value={form.anio_construccion}
                      onChange={e => setForm(f => ({ ...f, anio_construccion: e.target.value }))}
                      placeholder="1990"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white text-sm font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de propiedades */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
              <p className="text-sm text-slate-400">Cargando tus propiedades...</p>
            </div>
          </div>
        ) : propiedades.length === 0 ? (
          /* Empty state limpio — datos reales vacíos */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800/60 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
              <Home className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Todavía no tenés propiedades</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Agregá tu primera propiedad para organizar comprobantes, garantías, historial de trabajos y recordatorios de mantenimiento.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#fc8127] hover:bg-[#e06d19] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              <Plus className="w-5 h-5" /> Agregar mi primera propiedad
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {propiedades.map(prop => (
              <div
                key={prop.id}
                className="bg-[#001529] border border-slate-700/60 rounded-2xl p-5 hover:border-[#fc8127]/40 transition-all cursor-pointer group relative"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleEliminar(prop.id); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div
                  onClick={() => router.push(`/mi-hogar/${prop.id}`)}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fc8127]/20 to-amber-500/10 border border-[#fc8127]/30 rounded-xl flex items-center justify-center text-2xl">
                      {getTipoEmoji(prop.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-base truncate">{prop.nombre}</h3>
                      <p className="text-xs text-slate-400 capitalize">{prop.tipo}</p>
                    </div>
                  </div>

                  {prop.direccion && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#fc8127]" />
                      <span className="truncate">{prop.direccion}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {prop.superficie_m2 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {prop.superficie_m2} m²
                      </span>
                    )}
                    {prop.anio_construccion && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Año {prop.anio_construccion}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <FileText className="w-3 h-3" /> Comprobantes
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Wrench className="w-3 h-3" /> Mantenimientos
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#fc8127] transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info footer */}
        {!loading && propiedades.length > 0 && (
          <div className="bg-[#001529]/50 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">Tus datos están protegidos</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Todo el historial y documentación de tus propiedades se guarda de forma segura en OficiosYa. Solo vos tenés acceso a esta información.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#001529]/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 flex justify-around z-40">
        <button onClick={() => router.push('/cliente')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#fc8127]">
          <Building className="w-5 h-5" />
          <span className="text-[9px] font-bold">Mi Hogar</span>
        </button>
        <button onClick={() => router.push('/buscar-profesionales')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-bold">Buscar</span>
        </button>
        <button onClick={() => router.push('/perfil-cliente')} className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">Perfil</span>
        </button>
      </nav>
      <div className="h-20" />
    </div>
  );
}
