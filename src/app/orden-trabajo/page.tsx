"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, CheckCircle2, Clock, ShieldCheck, Loader2,
  AlertCircle, X, Save, ChevronDown, Wrench, User, Calendar,
  DollarSign, FileText, TrendingUp, Package
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, supabase } from '@/lib/supabase';

export default function OrdenTrabajoPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <OrdenTrabajoContent />
    </AuthGuard>
  );
}

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'en_progreso', label: 'En progreso', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'finalizado', label: 'Finalizado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'con_garantia', label: 'Con garantía', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { value: 'cancelado', label: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

const GARANTIAS = [
  { value: 'sin_garantia', label: 'Sin garantía' },
  { value: '30_dias', label: '30 días' },
  { value: '90_dias', label: '90 días' },
  { value: '6_meses', label: '6 meses' },
];

function OrdenTrabajoContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({
    cliente_id: '',
    titulo: '',
    descripcion: '',
    garantia: 'sin_garantia',
    fecha_inicio: new Date().toISOString().split('T')[0],
    monto: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadOrdenes();
      loadClientes();
    }
  }, [user?.id]);

  const loadOrdenes = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await dbHelper.getOrdenesTrabajoProfesional(user.id);
      setOrdenes(data);
    } catch (err: any) {
      setError('Error cargando las órdenes de trabajo.');
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    // Carga clientes con quienes tuve conversaciones (son contactos reales)
    try {
      const { data } = await supabase
        .from('conversaciones')
        .select('usuario1_id, usuario2_id')
        .or(`usuario1_id.eq.${user!.id},usuario2_id.eq.${user!.id}`)
        .limit(50);
      
      const ids = [...new Set((data || []).map((c: any) =>
        c.usuario1_id === user!.id ? c.usuario2_id : c.usuario1_id
      ))];

      if (ids.length > 0) {
        const { data: perfs } = await supabase
          .from('perfiles')
          .select('id, nombre, foto_perfil')
          .in('id', ids);
        setClientes(perfs || []);
      }
    } catch { /* no hay conversaciones */ }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !form.titulo || !form.cliente_id) return;
    setGuardando(true);
    try {
      await dbHelper.createOrdenTrabajo({
        profesional_id: user.id,
        cliente_id: form.cliente_id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        garantia: form.garantia,
        fecha_inicio: form.fecha_inicio,
        monto: form.monto ? parseFloat(form.monto) : 0,
      });
      setForm({ cliente_id: '', titulo: '', descripcion: '', garantia: 'sin_garantia', fecha_inicio: new Date().toISOString().split('T')[0], monto: '' });
      setShowForm(false);
      await loadOrdenes();
    } catch (err: any) {
      setError(err?.message || 'Error al crear la orden de trabajo.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const fechaFin = ['finalizado', 'con_garantia'].includes(nuevoEstado) ? new Date().toISOString().split('T')[0] : undefined;
      await dbHelper.updateOrdenTrabajoEstado(id, nuevoEstado, fechaFin);
      setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o));
    } catch (err: any) {
      setError('Error al cambiar el estado.');
    }
  };

  const getEstadoStyle = (estado: string) => ESTADOS.find(e => e.value === estado)?.color || 'text-slate-400 bg-slate-800 border-slate-700';
  const getEstadoLabel = (estado: string) => ESTADOS.find(e => e.value === estado)?.label || estado;

  const stats = {
    total: ordenes.length,
    enProgreso: ordenes.filter(o => o.estado === 'en_progreso').length,
    finalizados: ordenes.filter(o => ['finalizado', 'con_garantia'].includes(o.estado)).length,
    totalFacturado: ordenes.filter(o => ['finalizado', 'con_garantia'].includes(o.estado)).reduce((acc, o) => acc + (o.monto || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white">
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl">
        <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#fc8127] to-amber-500 rounded-xl flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Órdenes de Trabajo</h1>
            <p className="text-[10px] text-slate-400">Gestión formal de servicios</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-1.5 bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva orden
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'En curso', value: stats.enProgreso, color: 'text-blue-400' },
            { label: 'Finalizados', value: stats.finalizados, color: 'text-emerald-400' },
            { label: 'Facturado', value: `$${stats.totalFacturado.toLocaleString('es-AR')}`, color: 'text-[#fc8127]' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#001529] border border-slate-800 rounded-xl p-3 text-center">
              <p className={`text-base font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Formulario nueva orden */}
        {showForm && (
          <div className="bg-[#001529] border border-slate-700/60 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white text-sm">Nueva Orden de Trabajo</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Cliente *</label>
                <select required value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]">
                  <option value="">Seleccioná un cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {clientes.length === 0 && (
                  <p className="text-[10px] text-amber-400 mt-1">Primero iniciá una conversación con el cliente desde el chat.</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Descripción del trabajo *</label>
                <input required type="text" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Instalación de calefón, reparación de cañería..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Monto ($)</label>
                  <input type="number" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                    placeholder="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Fecha de inicio</label>
                  <input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fc8127]" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Garantía ofrecida</label>
                <div className="grid grid-cols-4 gap-2">
                  {GARANTIAS.map(g => (
                    <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, garantia: g.value }))}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                        form.garantia === g.value ? 'bg-[#fc8127]/20 border-[#fc8127] text-[#fc8127]' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={guardando}
                className="w-full py-3 rounded-xl bg-[#fc8127] text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50">
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear Orden de Trabajo</>}
              </button>
            </form>
          </div>
        )}

        {/* Lista de órdenes */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#fc8127] animate-spin" />
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">No tenés órdenes de trabajo</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mb-5">
              Creá tu primera orden para llevar un registro formal de tus trabajos con garantía y estado.
            </p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#fc8127] text-white font-bold text-sm px-5 py-2.5 rounded-xl mx-auto transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Crear primera orden
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ordenes.map(orden => (
              <div key={orden.id} className="bg-[#001529] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{orden.titulo}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {orden.perfiles?.nombre || 'Cliente'}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${getEstadoStyle(orden.estado)}`}>
                    {getEstadoLabel(orden.estado)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  {orden.monto > 0 && (
                    <span className="flex items-center gap-1 text-[#fc8127] font-bold">
                      <DollarSign className="w-3 h-3" /> ${parseFloat(orden.monto).toLocaleString('es-AR')}
                    </span>
                  )}
                  {orden.garantia && orden.garantia !== 'sin_garantia' && (
                    <span className="flex items-center gap-1 text-purple-400">
                      <ShieldCheck className="w-3 h-3" /> {GARANTIAS.find(g => g.value === orden.garantia)?.label}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(orden.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>

                {/* Cambiar estado */}
                {orden.estado !== 'finalizado' && orden.estado !== 'cancelado' && orden.estado !== 'con_garantia' && (
                  <div className="flex gap-2">
                    {orden.estado === 'pendiente' && (
                      <button onClick={() => handleCambiarEstado(orden.id, 'en_progreso')}
                        className="flex-1 py-1.5 text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all">
                        → Iniciar trabajo
                      </button>
                    )}
                    {orden.estado === 'en_progreso' && (
                      <>
                        <button onClick={() => handleCambiarEstado(orden.id, 'finalizado')}
                          className="flex-1 py-1.5 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all">
                          ✓ Finalizar
                        </button>
                        <button onClick={() => handleCambiarEstado(orden.id, 'con_garantia')}
                          className="flex-1 py-1.5 text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all">
                          🛡 Con garantía
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
