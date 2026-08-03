"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Plus, FileText, Wrench, Bell, Clock, Trash2,
  CheckCircle2, Loader2, AlertCircle, ShieldCheck, Calendar,
  Upload, X, Save, Home, ChevronRight, Star, Package
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, supabase } from '@/lib/supabase';

export default function PropiedadDetallePage() {
  return (
    <AuthGuard requiredRole="cliente">
      <PropiedadDetalleContent />
    </AuthGuard>
  );
}

type Tab = 'historial' | 'comprobantes' | 'mantenimientos';

function PropiedadDetalleContent() {
  const router = useRouter();
  const params = useParams();
  const propiedadId = params?.id as string;
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('historial');
  const [propiedad, setPropiedad] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormComp, setShowFormComp] = useState(false);
  const [showFormMant, setShowFormMant] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  const [formComp, setFormComp] = useState({ tipo: '', descripcion: '', monto: '', fecha_documento: '', fecha_vencimiento: '' });
  const [formMant, setFormMant] = useState({ titulo: '', descripcion: '', frecuencia: '', proxima_fecha: '' });

  const TIPOS_COMPROBANTE = ['Factura', 'Garantía', 'Seguro', 'Plano', 'Permiso', 'Certificado', 'Otro'];
  const FRECUENCIAS = ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Única vez'];

  useEffect(() => {
    if (propiedadId && user?.id) loadData();
  }, [propiedadId, user?.id]);

  const loadData = async () => {
    if (!propiedadId || !user?.id) return;
    setLoading(true);
    try {
      const [props, hist, comps, mantos] = await Promise.all([
        dbHelper.getPropiedades(user.id),
        dbHelper.getHistorialPropiedad(propiedadId),
        dbHelper.getComprobantes(propiedadId),
        dbHelper.getMantenimientos(propiedadId),
      ]);
      const prop = props.find((p: any) => p.id === propiedadId);
      setPropiedad(prop || null);
      setHistorial(hist);
      setComprobantes(comps);
      setMantenimientos(mantos);
    } catch (err: any) {
      setError('Error cargando los datos de la propiedad.');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formComp.tipo) return;
    setGuardando(true);
    let url_archivo = '';

    try {
      if (archivo) {
        setSubiendoArchivo(true);
        const fileExt = archivo.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, archivo);
        
        if (uploadError) {
          throw new Error('Error al subir el archivo: ' + uploadError.message);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('comprobantes')
          .getPublicUrl(fileName);
          
        url_archivo = publicUrlData.publicUrl;
      }

      await dbHelper.createComprobante({
        propiedad_id: propiedadId,
        cliente_id: user.id,
        tipo: formComp.tipo,
        descripcion: formComp.descripcion,
        url_archivo: url_archivo || undefined,
        monto: formComp.monto ? parseFloat(formComp.monto) : undefined,
        fecha_documento: formComp.fecha_documento || undefined,
        fecha_vencimiento: formComp.fecha_vencimiento || undefined,
      });
      setFormComp({ tipo: '', descripcion: '', monto: '', fecha_documento: '', fecha_vencimiento: '' });
      setArchivo(null);
      setShowFormComp(false);
      const data = await dbHelper.getComprobantes(propiedadId);
      setComprobantes(data);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el comprobante.');
    } finally {
      setGuardando(false);
      setSubiendoArchivo(false);
    }
  };

  const handleCrearMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formMant.titulo) return;
    setGuardando(true);
    try {
      await dbHelper.createMantenimiento({
        propiedad_id: propiedadId,
        cliente_id: user.id,
        titulo: formMant.titulo,
        descripcion: formMant.descripcion,
        frecuencia: formMant.frecuencia,
        proxima_fecha: formMant.proxima_fecha || undefined,
      });
      setFormMant({ titulo: '', descripcion: '', frecuencia: '', proxima_fecha: '' });
      setShowFormMant(false);
      const data = await dbHelper.getMantenimientos(propiedadId);
      setMantenimientos(data);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el mantenimiento.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCompletarMant = async (id: string) => {
    try {
      await dbHelper.completarMantenimiento(id);
      setMantenimientos(prev => prev.map(m => m.id === id ? { ...m, completado: true } : m));
    } catch (err: any) {
      setError('Error al marcar como completado.');
    }
  };

  const handleEliminarComp = async (id: string) => {
    if (!confirm('¿Eliminás este comprobante?')) return;
    try {
      await dbHelper.deleteComprobante(id);
      setComprobantes(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError('Error al eliminar el comprobante.');
    }
  };

  const TABS = [
    { id: 'historial', label: 'Historial', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'comprobantes', label: 'Comprobantes', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'mantenimientos', label: 'Mantenimientos', icon: <Wrench className="w-3.5 h-3.5" /> },
  ] as const;

  const isVencido = (fecha: string) => fecha && new Date(fecha) < new Date();
  const isProximo = (fecha: string) => {
    if (!fecha) return false;
    const diff = new Date(fecha).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#001b33] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white">
      {/* Header */}
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/mi-hogar')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white">{propiedad?.nombre || 'Propiedad'}</h1>
            <p className="text-[10px] text-slate-400">{propiedad?.direccion || propiedad?.tipo || 'Mi Hogar'}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#001529] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-white">{historial.length}</p>
            <p className="text-[10px] text-slate-400">Trabajos</p>
          </div>
          <div className="bg-[#001529] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-white">{comprobantes.length}</p>
            <p className="text-[10px] text-slate-400">Comprobantes</p>
          </div>
          <div className="bg-[#001529] border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-[#fc8127]">{mantenimientos.filter(m => !m.completado).length}</p>
            <p className="text-[10px] text-slate-400">Pendientes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#001529] border border-slate-800 rounded-xl p-1 flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                tab === t.id ? 'bg-[#fc8127] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Historial de trabajos */}
        {tab === 'historial' && (
          <div className="space-y-3">
            {historial.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay trabajos registrados en esta propiedad aún.</p>
                <p className="text-xs text-slate-600 mt-1">Los trabajos aparecerán cuando un profesional los vincule a esta dirección.</p>
              </div>
            ) : historial.map(trabajo => (
              <div key={trabajo.id} className="bg-[#001529] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{trabajo.titulo}</h4>
                    <p className="text-xs text-slate-400">{trabajo.perfiles?.nombre || 'Profesional'}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${
                    trabajo.estado === 'finalizado' ? 'bg-emerald-500/20 text-emerald-400' :
                    trabajo.estado === 'en_progreso' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {trabajo.estado?.replace('_', ' ')}
                  </span>
                </div>
                {trabajo.garantia && trabajo.garantia !== 'sin_garantia' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Garantía: {trabajo.garantia.replace('_', ' ')}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-500">
                  {new Date(trabajo.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Comprobantes */}
        {tab === 'comprobantes' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowFormComp(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#001529] border border-dashed border-[#fc8127]/40 hover:border-[#fc8127] text-[#fc8127] text-sm font-bold py-4 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Agregar comprobante
            </button>

            {showFormComp && (
              <form onSubmit={handleCrearComprobante} className="bg-[#001529] border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-white">Nuevo comprobante</h4>
                  <button type="button" onClick={() => setShowFormComp(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo *</label>
                    <select required value={formComp.tipo} onChange={e => setFormComp(f => ({ ...f, tipo: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]">
                      <option value="">Seleccioná</option>
                      {TIPOS_COMPROBANTE.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Monto ($)</label>
                    <input type="number" value={formComp.monto} onChange={e => setFormComp(f => ({ ...f, monto: e.target.value }))}
                      placeholder="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Fecha del documento</label>
                    <input type="date" value={formComp.fecha_documento} onChange={e => setFormComp(f => ({ ...f, fecha_documento: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Vencimiento</label>
                    <input type="date" value={formComp.fecha_vencimiento} onChange={e => setFormComp(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Descripción</label>
                  <textarea value={formComp.descripcion} onChange={e => setFormComp(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Detalles del comprobante..." rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Adjuntar foto/archivo</label>
                  <input 
                    type="file" 
                    onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#fc8127]/10 file:text-[#fc8127] hover:file:bg-[#fc8127]/20" 
                  />
                </div>
                <button type="submit" disabled={guardando || subiendoArchivo}
                  className="w-full py-2.5 rounded-xl bg-[#fc8127] text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50">
                  {guardando || subiendoArchivo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar</>}
                </button>
              </form>
            )}

            {comprobantes.length === 0 && !showFormComp ? (
              <div className="text-center py-10">
                <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay comprobantes registrados.</p>
                <p className="text-xs text-slate-600 mt-1">Guardá facturas, garantías, seguros y documentos importantes.</p>
              </div>
            ) : comprobantes.map(comp => (
              <div key={comp.id} className={`bg-[#001529] border rounded-xl p-4 relative group ${
                isVencido(comp.fecha_vencimiento) ? 'border-red-500/40' :
                isProximo(comp.fecha_vencimiento) ? 'border-amber-500/40' : 'border-slate-800'
              }`}>
                <button onClick={() => handleEliminarComp(comp.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#fc8127]/10 border border-[#fc8127]/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#fc8127]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-white">{comp.tipo}</p>
                      {isVencido(comp.fecha_vencimiento) && <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded-full">VENCIDO</span>}
                      {isProximo(comp.fecha_vencimiento) && <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full">POR VENCER</span>}
                    </div>
                    {comp.descripcion && <p className="text-xs text-slate-400 truncate">{comp.descripcion}</p>}
                    <div className="flex gap-3 mt-1.5 text-[10px] text-slate-500">
                      {comp.monto && <span>${parseFloat(comp.monto).toLocaleString('es-AR')}</span>}
                      {comp.fecha_documento && <span>{new Date(comp.fecha_documento).toLocaleDateString('es-AR')}</span>}
                      {comp.fecha_vencimiento && <span>Vence: {new Date(comp.fecha_vencimiento).toLocaleDateString('es-AR')}</span>}
                    </div>
                    {comp.url_archivo && (
                      <div className="mt-2">
                        <a href={comp.url_archivo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#fc8127] hover:underline font-bold bg-[#fc8127]/10 px-2 py-1 rounded">
                          <Upload className="w-3 h-3" /> Ver adjunto
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Mantenimientos */}
        {tab === 'mantenimientos' && (
          <div className="space-y-3">
            <button onClick={() => setShowFormMant(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#001529] border border-dashed border-[#fc8127]/40 hover:border-[#fc8127] text-[#fc8127] text-sm font-bold py-4 rounded-xl transition-all">
              <Plus className="w-4 h-4" /> Agregar recordatorio
            </button>

            {showFormMant && (
              <form onSubmit={handleCrearMantenimiento} className="bg-[#001529] border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-white">Nuevo recordatorio</h4>
                  <button type="button" onClick={() => setShowFormMant(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <input required type="text" value={formMant.titulo} onChange={e => setFormMant(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Cambio de filtro de agua..." 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Frecuencia</label>
                    <select value={formMant.frecuencia} onChange={e => setFormMant(f => ({ ...f, frecuencia: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]">
                      <option value="">Sin repetición</option>
                      {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Próxima fecha</label>
                    <input type="date" value={formMant.proxima_fecha} onChange={e => setFormMant(f => ({ ...f, proxima_fecha: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]" />
                  </div>
                </div>
                <button type="submit" disabled={guardando}
                  className="w-full py-2.5 rounded-xl bg-[#fc8127] text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50">
                  {guardando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar</>}
                </button>
              </form>
            )}

            {mantenimientos.length === 0 && !showFormMant ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay recordatorios de mantenimiento.</p>
                <p className="text-xs text-slate-600 mt-1">Programá servicios periódicos para cuidar tu propiedad.</p>
              </div>
            ) : mantenimientos.map(mant => (
              <div key={mant.id} className={`bg-[#001529] border rounded-xl p-4 flex items-start gap-3 ${mant.completado ? 'border-slate-800 opacity-60' : 'border-slate-700'}`}>
                <button
                  onClick={() => !mant.completado && handleCompletarMant(mant.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    mant.completado ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-[#fc8127]'
                  }`}
                >
                  {mant.completado && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${mant.completado ? 'line-through text-slate-500' : 'text-white'}`}>{mant.titulo}</p>
                  {mant.frecuencia && <p className="text-[10px] text-slate-500 mt-0.5">{mant.frecuencia}</p>}
                  {mant.proxima_fecha && (
                    <p className={`text-[10px] font-bold mt-0.5 ${
                      isVencido(mant.proxima_fecha) ? 'text-red-400' :
                      isProximo(mant.proxima_fecha) ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(mant.proxima_fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
