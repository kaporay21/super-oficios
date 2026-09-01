"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, Loader2, Send, CheckCircle2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function MisDisputasPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <MisDisputasContent />
    </AuthGuard>
  );
}

function MisDisputasContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [disputas, setDisputas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondiendoId, setRespondiendoId] = useState<string | null>(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (user?.id) cargar();
  }, [user?.id]);

  const cargar = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await dbHelper.getDisputasProfesional(user.id);
      setDisputas(data);
    } catch (err) {
      console.warn('Error cargando disputas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (id: string) => {
    if (!respuestaTexto.trim()) return;
    setEnviando(true);
    try {
      await dbHelper.responderDisputaProfesional(id, respuestaTexto.trim());
      setDisputas(prev => prev.map(d => d.id === id ? { ...d, descripcion_profesional: respuestaTexto.trim() } : d));
      setRespondiendoId(null);
      setRespuestaTexto('');
    } catch (err) {
      console.error('Error al responder disputa:', err);
      alert('Ocurrió un error al enviar tu respuesta.');
    } finally {
      setEnviando(false);
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
        <button onClick={() => router.push('/panel-profesional')} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Reclamos</h1>
            <p className="text-[10px] text-slate-400">Casos abiertos por clientes que te involucran</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400">
            Cuando un cliente abre un reclamo sobre un trabajo tuyo, podés dar tu versión acá antes de que el equipo de OficiosYa decida. No hace falta que estés de acuerdo con el resultado — solo contar lo que pasó.
          </p>
        </div>

        {disputas.length === 0 ? (
          <div className="text-center py-16">
            <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No tenés reclamos abiertos</p>
            <p className="text-xs text-slate-600 mt-1">Cuando exista alguno, vas a poder ver el detalle y responder acá.</p>
          </div>
        ) : (
          disputas.map(d => (
            <div key={d.id} className="bg-[#001529] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  d.estado === 'escalado_admin' ? 'bg-red-500/20 text-red-400' :
                  d.resolucion_admin ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>{d.estado?.replace('_', ' ') || 'en proceso'}</span>
                <span className="text-[10px] text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleDateString('es-AR') : ''}</span>
              </div>
              <p className="text-xs text-slate-400">Reclamo de <b className="text-white">{d.cliente?.nombre || 'un cliente'}</b>:</p>
              <p className="text-sm text-slate-200 bg-slate-900/60 rounded-xl p-3 leading-relaxed">{d.descripcion}</p>

              {d.descripcion_profesional ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-blue-400 mb-1">Tu versión:</p>
                  <p className="text-xs text-slate-300">{d.descripcion_profesional}</p>
                </div>
              ) : respondiendoId === d.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={respuestaTexto}
                    onChange={e => setRespuestaTexto(e.target.value)}
                    placeholder="Contá tu versión de lo ocurrido..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setRespondiendoId(null)} className="text-xs text-slate-500 font-bold px-3 py-2 hover:underline">Cancelar</button>
                    <button
                      onClick={() => handleResponder(d.id)}
                      disabled={enviando || !respuestaTexto.trim()}
                      className="text-xs bg-[#fc8127] hover:bg-[#e06d19] disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      {enviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Enviar mi versión
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setRespondiendoId(d.id); setRespuestaTexto(''); }}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl"
                >
                  Dar mi versión
                </button>
              )}

              {d.resolucion_admin && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-green-400">Resolución de OficiosYa:</p>
                    <p className="text-xs text-slate-300 mt-1">{d.resolucion_admin}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
