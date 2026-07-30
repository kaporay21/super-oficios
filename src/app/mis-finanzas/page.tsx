"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, TrendingUp, DollarSign, BarChart2, Loader2,
  Package, Calendar, Star, ChevronRight, ArrowUpRight
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function MisFinanzasPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <MisFinanzasContent />
    </AuthGuard>
  );
}

function MisFinanzasContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await dbHelper.getEstadisticasFinancieras(user.id);
      setStats(data);
    } catch (err) {
      console.warn('Error cargando estadísticas financieras:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxEvolucion = stats?.evolucionMensual ? Math.max(...stats.evolucionMensual.map((m: any) => m.total), 1) : 1;

  if (loading) return (
    <div className="min-h-screen bg-[#001b33] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white pb-8">
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl">
        <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Panel Financiero</h1>
            <p className="text-[10px] text-slate-400">Estadísticas de tus trabajos</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Aviso aclaratorio */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
          <Star className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400">
            Este panel organiza la información de tus Órdenes de Trabajo registradas. No gestiona pagos reales, solo ayuda a visualizar tu actividad económica.
          </p>
        </div>

        {!stats || stats.totalPresupuestado === 0 ? (
          /* Empty state limpio */
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">Todavía no hay estadísticas</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mb-5">
              Las estadísticas aparecerán cuando tengas Órdenes de Trabajo finalizadas con monto registrado.
            </p>
            <button onClick={() => router.push('/orden-trabajo')}
              className="flex items-center gap-2 bg-[#fc8127] text-white font-bold text-sm px-5 py-2.5 rounded-xl mx-auto transition-all active:scale-95">
              Ir a Órdenes de Trabajo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* KPIs principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Total facturado</p>
                <p className="text-2xl font-black text-white">${stats.totalPresupuestado.toLocaleString('es-AR')}</p>
                <p className="text-[10px] text-slate-500 mt-1">en trabajos finalizados</p>
              </div>
              <div className="bg-gradient-to-br from-[#fc8127]/10 to-amber-500/5 border border-[#fc8127]/20 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#fc8127] uppercase tracking-wider mb-1">Ticket promedio</p>
                <p className="text-2xl font-black text-white">${Math.round(stats.ticketPromedio).toLocaleString('es-AR')}</p>
                <p className="text-[10px] text-slate-500 mt-1">por trabajo</p>
              </div>
              <div className="bg-[#001529] border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Este mes</p>
                <p className="text-2xl font-black text-white">{stats.trabajosEstesMes}</p>
                <p className="text-[10px] text-slate-500 mt-1">trabajos finalizados</p>
              </div>
              <div className="bg-[#001529] border border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Servicios únicos</p>
                <p className="text-2xl font-black text-white">{stats.serviciosMasVendidos.length}</p>
                <p className="text-[10px] text-slate-500 mt-1">tipos de trabajo</p>
              </div>
            </div>

            {/* Evolución mensual — gráfico de barras visual */}
            {stats.evolucionMensual && stats.evolucionMensual.some((m: any) => m.total > 0) && (
              <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#fc8127]" /> Evolución últimos 6 meses
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.evolucionMensual.map((mes: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-[#fc8127] to-amber-400 transition-all"
                        style={{ height: `${Math.max((mes.total / maxEvolucion) * 100, mes.total > 0 ? 5 : 0)}%` }} />
                      <p className="text-[9px] text-slate-500">{mes.mes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios más vendidos */}
            {stats.serviciosMasVendidos.length > 0 && (
              <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#fc8127]" /> Servicios más frecuentes
                </h3>
                <div className="space-y-2.5">
                  {stats.serviciosMasVendidos.map((svc: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-5 h-5 bg-slate-800 rounded text-[10px] font-black text-slate-400 flex items-center justify-center">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-white">{svc.servicio}</span>
                          <span className="text-slate-400">{svc.cantidad} {svc.cantidad === 1 ? 'trabajo' : 'trabajos'}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#fc8127] to-amber-400 rounded-full"
                            style={{ width: `${(svc.cantidad / stats.serviciosMasVendidos[0].cantidad) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
