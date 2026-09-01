"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gift, Loader2, Coins, CheckCircle2, Clock } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function TiendaPuntosPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <TiendaPuntosContent />
    </AuthGuard>
  );
}

function TiendaPuntosContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [premios, setPremios] = useState<any[]>([]);
  const [misCanjes, setMisCanjes] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canjeando, setCanjeando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [premiosData, canjesData, puntos] = await Promise.all([
        dbHelper.getPremiosCanje(),
        dbHelper.getMisCanjes(user.id),
        dbHelper.getOrCreatePuntosProfesional(user.id),
      ]);
      setPremios(premiosData);
      setMisCanjes(canjesData);
      setSaldo((puntos?.puntos_totales || 0) - (puntos?.puntos_canjeados || 0));
    } catch (err) {
      console.warn('Error cargando tienda de puntos:', err);
      setError('No pudimos cargar la tienda. Probá recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleCanjear = async (premioId: string) => {
    if (!user?.id) return;
    setCanjeando(premioId);
    setError(null);
    setMensaje(null);
    try {
      await dbHelper.canjearPremio(user.id, premioId);
      setMensaje('¡Canje realizado! Te vamos a contactar para coordinar la entrega.');
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'No pudimos procesar el canje.');
    } finally {
      setCanjeando(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#001b33] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white pb-8">
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl">
        <button onClick={() => router.push('/centro-crecimiento')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Gift className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Tienda de Canje</h1>
            <p className="text-[10px] text-slate-400">Canjeá tus puntos por premios</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs font-bold text-red-400">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {mensaje}
          </div>
        )}

        {/* Saldo disponible */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu saldo</p>
            <h2 className="text-3xl font-black text-white mt-0.5 flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" /> {saldo} pts
            </h2>
          </div>
        </div>

        {/* Catálogo de premios */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#fc8127]" /> Premios disponibles
          </h3>
          {premios.length === 0 ? (
            <div className="text-center py-10">
              <Gift className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Todavía no hay premios cargados.</p>
              <p className="text-[10px] text-slate-500 mt-1">Volvé pronto — estamos preparando la tienda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {premios.map(premio => {
                const alcanza = saldo >= premio.costo_puntos;
                const agotado = premio.stock !== null && premio.stock <= 0;
                return (
                  <div key={premio.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex flex-col gap-2">
                    {premio.imagen_url && (
                      <img src={premio.imagen_url} alt={premio.nombre} className="w-full h-28 object-cover rounded-lg" />
                    )}
                    <p className="text-sm font-black text-white">{premio.nombre}</p>
                    {premio.descripcion && <p className="text-[11px] text-slate-400">{premio.descripcion}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-amber-400">{premio.costo_puntos} pts</span>
                      <button
                        onClick={() => handleCanjear(premio.id)}
                        disabled={!alcanza || agotado || canjeando === premio.id}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#fc8127] text-white disabled:bg-slate-700 disabled:text-slate-500 transition-all active:scale-95"
                      >
                        {canjeando === premio.id ? 'Canjeando...' : agotado ? 'Agotado' : alcanza ? 'Canjear' : 'Puntos insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historial de canjes */}
        {misCanjes.length > 0 && (
          <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Mis canjes
            </h3>
            <div className="space-y-2">
              {misCanjes.map(canje => (
                <div key={canje.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div>
                    <p className="text-xs font-bold text-white">{canje.premio?.nombre || 'Premio'}</p>
                    <p className="text-[10px] text-slate-500">{new Date(canje.created_at).toLocaleDateString('es-AR')} · {canje.puntos_gastados} pts</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    canje.estado === 'entregado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {canje.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
