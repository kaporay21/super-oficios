"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell, Star, MessageSquare, ArrowLeft, Loader2,
  CheckCircle, BadgeCheck, Clock, Package, Shield,
  MapPin, ChevronDown, ChevronUp, Briefcase, Users,
  Trophy, AlertCircle, Trash2, History, LayoutList,
  X, RefreshCw
} from 'lucide-react';
import Logo from '@/components/Logo';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';
import type { PresupuestoMuro } from '@/types';

export default function CompararPresupuestosPage() {
  return (
    <AuthGuard requiredRole="cliente">
      <CompararPresupuestosContent />
    </AuthGuard>
  );
}

const GARANTIA_LABELS: Record<string, string> = {
  sin_garantia: 'Sin garantía',
  '7_dias': '7 días',
  '15_dias': '15 días',
  '30_dias': '30 días',
  '60_dias': '60 días',
  '90_dias': '90 días',
  '6_meses': '6 meses',
  '1_ano': '1 año',
};

type TabType = 'pendientes' | 'historial';

function CompararPresupuestosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const trabajoId = searchParams.get('trabajoId');
  const tituloTrabajo = searchParams.get('titulo') || 'Tu trabajo';

  const [presupuestos, setPresupuestos] = useState<PresupuestoMuro[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjudicandoId, setAdjudicandoId] = useState<string | null>(null);
  const [adjudicado, setAdjudicado] = useState<PresupuestoMuro | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>('pendientes');

  // Descartar (rechazar)
  const [descartandoId, setDescartandoId] = useState<string | null>(null);
  const [confirmDescartarId, setConfirmDescartarId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dbHelper.getUnreadNotificationsCount(user.id).then(setUnreadCount).catch(() => {});
    }
  }, [user?.id]);

  const loadPresupuestos = useCallback(async () => {
    if (!trabajoId || !user?.id) return;
    try {
      setLoading(true);
      const data = await dbHelper.getPresupuestosMuroByTrabajo(trabajoId);
      setPresupuestos(data);
      const ya = data.find(p => p.estado === 'aceptado');
      if (ya) setAdjudicado(ya);
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
    } finally {
      setLoading(false);
    }
  }, [trabajoId, user?.id]);

  useEffect(() => {
    loadPresupuestos();
  }, [loadPresupuestos]);

  const handleAdjudicar = async (presupuesto: PresupuestoMuro) => {
    if (!user?.id || !trabajoId) return;
    try {
      setAdjudicandoId(presupuesto.id);
      await dbHelper.adjudicarTrabajo({
        trabajoId: Number(trabajoId),
        presupuestoId: presupuesto.id,
        profesionalId: presupuesto.profesionalId,
        clienteId: user.id,
        tituloTrabajo,
        monto: presupuesto.monto,
        garantia: presupuesto.garantia,
      });
      setAdjudicado(presupuesto);
      setConfirmId(null);
      await loadPresupuestos();
      setTimeout(() => router.push(`/orden-trabajo`), 1500);
    } catch (err) {
      console.error('Error adjudicando trabajo:', err);
      alert('Hubo un error al seleccionar este profesional. Intentá de nuevo.');
    } finally {
      setAdjudicandoId(null);
    }
  };

  const handleDescartar = async (presupuesto: PresupuestoMuro) => {
    if (!user?.id) return;
    try {
      setDescartandoId(presupuesto.id);
      await dbHelper.descartarOfertaMuro(presupuesto.id, user.id, tituloTrabajo);
      // Actualizar estado local sin recargar
      setPresupuestos(prev =>
        prev.map(p => p.id === presupuesto.id ? { ...p, estado: 'rechazado' as const } : p)
      );
      setConfirmDescartarId(null);
    } catch (err) {
      console.error('Error descartando oferta:', err);
      alert('No se pudo descartar la oferta. Intentá de nuevo.');
    } finally {
      setDescartandoId(null);
    }
  };

  const handleContactar = async (presupuesto: PresupuestoMuro) => {
    if (!user?.id) return;
    try {
      const conv = await dbHelper.getOrCreateConversation(user.id, presupuesto.profesionalId);
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      console.error('Error abriendo chat:', err);
    }
  };

  if (!trabajoId) return <SinTrabajoIdView />;

  const pendientes = presupuestos.filter(p => p.estado === 'pendiente');
  const historial = presupuestos.filter(p => p.estado !== 'pendiente');
  const menorPrecio = pendientes.length > 1
    ? Math.min(...pendientes.map(x => x.monto))
    : null;

  const presupuestosActivos = tab === 'pendientes' ? pendientes : historial;

  return (
    <div className="bg-[#f0f4f8] min-h-screen font-sans">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Logo size="md" theme="light" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/notificaciones')} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12 space-y-6">

        {/* Hero */}
        <section>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Presupuestos para</p>
              <h1 className="text-2xl font-extrabold text-[#00355f] leading-tight">{tituloTrabajo}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-[#00355f] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" /> {presupuestos.length} {presupuestos.length === 1 ? 'oferta' : 'ofertas'}
              </span>
              <button onClick={loadPresupuestos} className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner adjudicado */}
          {adjudicado && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800">¡Ya elegiste a un profesional!</p>
                <p className="text-sm text-green-700 mt-0.5">
                  Seleccionaste a <strong>{adjudicado.profesional?.nombre}</strong>. Se generó una Orden de Trabajo automáticamente.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* TABS */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setTab('pendientes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'pendientes'
                ? 'bg-[#00355f] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            Pendientes
            {pendientes.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === 'pendientes' ? 'bg-white/20 text-white' : 'bg-[#00355f]/10 text-[#00355f]'}`}>
                {pendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'historial'
                ? 'bg-[#00355f] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            Historial
            {historial.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === 'historial' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {historial.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
            <p className="text-sm text-gray-500">Cargando ofertas...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && presupuestosActivos.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center shadow-sm">
            {tab === 'pendientes' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <LayoutList className="w-8 h-8 text-gray-300" />
                </div>
                {presupuestos.length === 0 ? (
                  <>
                    <p className="font-bold text-gray-600 text-lg">Todavía no recibiste ofertas</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">Los profesionales del oficio fueron notificados. Volvé en un rato.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-gray-600 text-lg">¡Revisaste todas las ofertas!</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">Las que descartaste están en el Historial. Podés publicar un nuevo trabajo si necesitás.</p>
                    <button onClick={() => setTab('historial')} className="mt-4 bg-[#00355f] text-white px-5 py-2.5 rounded-xl font-bold text-sm">Ver historial</button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-bold text-gray-600 text-lg">Historial vacío</p>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">Las ofertas descartadas y las adjudicadas aparecerán acá.</p>
              </>
            )}
          </div>
        )}

        {/* Lista de presupuestos */}
        {!loading && presupuestosActivos.length > 0 && (
          <section className="space-y-4">
            {tab === 'historial' && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ofertas descartadas o adjudicadas — solo para referencia
              </p>
            )}

            {presupuestosActivos.map((p) => {
              const esElegido = p.estado === 'aceptado';
              const esRechazado = p.estado === 'rechazado';
              const esMenorPrecio = tab === 'pendientes' && menorPrecio !== null && p.monto === menorPrecio && pendientes.length > 1;
              const expanded = expandedId === p.id;
              const confirmandoDescartar = confirmDescartarId === p.id;
              const confirmandoElegir = confirmId === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                    esElegido
                      ? 'border-green-300 ring-2 ring-green-200'
                      : esRechazado
                        ? 'border-gray-200 opacity-60 grayscale-[30%]'
                        : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="p-5">
                    {/* Header profesional */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-[#d2e4ff] flex items-center justify-center text-[#00355f] font-extrabold text-xl border-2 border-white shadow overflow-hidden">
                          {p.profesional?.fotoPerfil ? (
                            <img src={p.profesional.fotoPerfil} alt={p.profesional.nombre} className="w-full h-full object-cover" />
                          ) : (
                            p.profesional?.nombre?.charAt(0)?.toUpperCase() || 'P'
                          )}
                        </div>
                        {p.profesional?.verificado && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{p.profesional?.nombre || 'Profesional'}</h3>
                          {esElegido && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                              <Trophy className="w-3 h-3" /> Elegido
                            </span>
                          )}
                          {esRechazado && (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                              <X className="w-3 h-3" /> Descartado
                            </span>
                          )}
                          {esMenorPrecio && !esRechazado && (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                              ⚡ Mejor precio
                            </span>
                          )}
                          {p.version > 1 && !esRechazado && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              🔄 v{p.version}
                            </span>
                          )}
                        </div>
                        {p.profesional?.rating > 0 && (
                          <p className="text-xs font-bold text-gray-700 mt-0.5 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#fc8127] fill-current" />
                            {p.profesional.rating.toFixed(1)}
                            <span className="text-gray-400 font-medium">
                              ({p.profesional.totalResenas} {p.profesional.totalResenas === 1 ? 'reseña' : 'reseñas'})
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[p.profesional?.ciudad, p.profesional?.provincia].filter(Boolean).join(', ') || 'Sin ubicación'}
                        </p>
                        {p.profesional?.oficios && p.profesional.oficios.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {p.profesional.oficios.slice(0, 3).map((o: string) => (
                              <span key={o} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{o}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-2xl font-extrabold ${esRechazado ? 'text-gray-400' : 'text-[#00355f]'}`}>
                          ${Number(p.monto).toLocaleString('es-AR')}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Total ofertado</p>
                        {p.createdAt && (
                          <p className="text-[10px] text-gray-300 mt-1">
                            {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detalles rápidos */}
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Plazo</p>
                          <p className="text-xs font-bold text-gray-700">{p.tiempoEstimado || 'A convenir'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Materiales</p>
                          <p className="text-xs font-bold text-gray-700">{p.materialesIncluidos ? '✅ Incl.' : '❌ No incl.'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Garantía</p>
                          <p className="text-xs font-bold text-gray-700">{GARANTIA_LABELS[p.garantia] || p.garantia}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandible: descripción */}
                    <button
                      onClick={() => setExpandedId(expanded ? null : p.id)}
                      className="mt-3 flex items-center gap-1 text-xs text-[#00355f] font-bold hover:opacity-75 transition-opacity"
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expanded ? 'Ocultar descripción' : 'Ver descripción'}
                    </button>

                    {expanded && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{p.descripcion || 'Sin descripción.'}</p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {!esRechazado && (
                    <div className="px-5 pb-5 flex gap-3">

                      {/* Consultar */}
                      <button
                        onClick={() => handleContactar(p)}
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4" /> Consultar
                      </button>

                      {/* Elegir — solo si no hay adjudicado y estamos en pendientes */}
                      {!adjudicado && tab === 'pendientes' && (
                        <>
                          {confirmandoElegir ? (
                            <div className="flex-1 flex gap-2">
                              <button onClick={() => setConfirmId(null)} className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 text-sm">
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleAdjudicar(p)}
                                disabled={adjudicandoId === p.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                              >
                                {adjudicandoId === p.id
                                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Adjudicando...</>
                                  : <><CheckCircle className="w-4 h-4" /> Confirmar</>}
                              </button>
                            </div>
                          ) : confirmandoDescartar ? (
                            <div className="flex-1 flex gap-2">
                              <button onClick={() => setConfirmDescartarId(null)} className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 text-sm">
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleDescartar(p)}
                                disabled={descartandoId === p.id}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                              >
                                {descartandoId === p.id
                                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Descartando...</>
                                  : <><Trash2 className="w-4 h-4" /> Descartar</>}
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Descartar (secundario) */}
                              <button
                                onClick={() => { setConfirmDescartarId(p.id); setConfirmId(null); }}
                                className="px-4 py-3 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all"
                                title="Descartar oferta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Elegir (principal) */}
                              <button
                                onClick={() => { setConfirmId(p.id); setConfirmDescartarId(null); }}
                                className="flex-1 bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
                              >
                                <Trophy className="w-4 h-4 text-[#fc8127]" /> Elegir este
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* Ya adjudicado a este */}
                      {esElegido && (
                        <button
                          onClick={() => router.push('/orden-trabajo')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" /> Ver Orden de Trabajo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Alerta sin ofertas pendientes */}
        {!loading && presupuestos.length === 0 && tab === 'pendientes' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">Todavía no recibiste ofertas</p>
              <p className="text-sm text-amber-700 mt-1">Los profesionales fueron notificados. Volvé más tarde.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Vista cuando no hay trabajoId: seleccioná un trabajo
// ─────────────────────────────────────────────
function SinTrabajoIdView() {
  const router = useRouter();
  const { user } = useAuth();
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const all = await dbHelper.getJobs();
        const mios = (all || []).filter((j: any) => j.cliente_id === user.id && !j.esempleo);
        setTrabajos(mios);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <div className="bg-[#f0f4f8] min-h-screen font-sans">
      <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Logo size="md" theme="light" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-extrabold text-[#00355f] mb-2">Mis trabajos publicados</h1>
        <p className="text-gray-500 text-sm mb-6">Seleccioná un trabajo para ver y gestionar las ofertas recibidas.</p>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#fc8127] animate-spin" /></div>
        ) : trabajos.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-600">No publicaste trabajos todavía</p>
            <button onClick={() => router.push('/publicar-trabajo')} className="mt-4 bg-[#fc8127] text-white px-5 py-2.5 rounded-xl font-bold text-sm">
              + Publicar trabajo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trabajos.map((job: any) => {
              const estaAdjudicado = job.estado === 'adjudicado';
              return (
                <button
                  key={job.id}
                  onClick={() => router.push(`/comparar-presupuestos?trabajoId=${job.id}&titulo=${encodeURIComponent(job.titulo)}`)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-left hover:shadow-md hover:border-[#00355f]/30 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-[#00355f] transition-colors">{job.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">{job.categoria} · {job.ubicacion || job.ciudad || 'Sin ubicación'}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${estaAdjudicado ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {estaAdjudicado ? '✅ Adjudicado' : '🟢 Abierto'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}