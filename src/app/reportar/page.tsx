"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, Send, CheckCircle2, Loader2,
  ShieldAlert, User, MapPin, XCircle, Clock, Flag
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function ReportarPage() {
  return (
    <AuthGuard>
      <ReportarContent />
    </AuthGuard>
  );
}

const TIPOS_REPORTE = [
  { value: 'incumplimiento', label: 'Incumplimiento del servicio', icon: <XCircle className="w-4 h-4" /> },
  { value: 'direccion_incorrecta', label: 'Dirección o datos incorrectos', icon: <MapPin className="w-4 h-4" /> },
  { value: 'cancelacion_frecuente', label: 'Cancelaciones frecuentes', icon: <Clock className="w-4 h-4" /> },
  { value: 'conducta_inapropiada', label: 'Conducta inapropiada', icon: <ShieldAlert className="w-4 h-4" /> },
  { value: 'cliente_no_responde', label: 'Cliente no responde (para profesionales)', icon: <User className="w-4 h-4" /> },
  { value: 'otro', label: 'Otro motivo', icon: <Flag className="w-4 h-4" /> },
];

function ReportarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const reportadoId = searchParams.get('reportadoId') || '';
  const reportadoNombre = searchParams.get('reportadoNombre') || '';
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !tipo || !descripcion.trim() || !reportadoId) return;
    setEnviando(true);
    setError(null);
    try {
      await dbHelper.createReporte({
        reportador_id: user.id,
        reportado_id: reportadoId,
        tipo,
        descripcion,
      });
      setEnviado(true);
    } catch (err: any) {
      setError(err?.message || 'Error al enviar el reporte. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[#001b33] flex items-center justify-center p-4">
        <div className="bg-[#001529] border border-emerald-500/30 rounded-2xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Reporte enviado</h2>
          <p className="text-sm text-slate-400 mb-6">
            Tu reporte fue recibido. El equipo de OficiosYa lo revisará y tomará las medidas necesarias.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Los reportes se procesan en un plazo de 24-48 horas hábiles.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-[#fc8127] text-white font-black text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white">
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shadow-xl">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Reportar un problema</h1>
            <p className="text-[10px] text-slate-400">Bidireccional: cliente y profesional</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!reportadoId ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">Falta indicar a quién estás reportando</p>
              <p className="text-[10px] text-slate-400">
                Este formulario tiene que abrirse desde el chat o el perfil de la persona que querés reportar, para que el reporte quede vinculado a esa cuenta. Volvé a esa conversación y usá el botón "Reportar" de ahí.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">Vas a reportar a: {reportadoNombre || 'este usuario'}</p>
              <p className="text-[10px] text-slate-400">
                Todos los reportes son revisados por el equipo de OficiosYa y se mantienen confidenciales.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        <form onSubmit={handleEnviar} className="space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label className="text-xs font-black text-white block mb-3">¿Cuál es el motivo del reporte? *</label>
            <div className="space-y-2">
              {TIPOS_REPORTE.map(tipo_opt => (
                <button
                  key={tipo_opt.value}
                  type="button"
                  onClick={() => setTipo(tipo_opt.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-sm font-bold transition-all text-left ${
                    tipo === tipo_opt.value
                      ? 'bg-[#fc8127]/10 border-[#fc8127]/50 text-[#fc8127]'
                      : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className={tipo === tipo_opt.value ? 'text-[#fc8127]' : 'text-slate-500'}>
                    {tipo_opt.icon}
                  </span>
                  {tipo_opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-black text-white block mb-2">Describí el problema *</label>
            <textarea
              required
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={5}
              placeholder="Describí con detalle qué ocurrió, incluyendo fechas, nombres y cualquier información relevante que ayude a resolver el problema..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none leading-relaxed"
            />
            <p className="text-[10px] text-slate-500 mt-1">{descripcion.length}/500 caracteres</p>
          </div>

          {/* Info del reportador */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reportando como</p>
            <p className="text-sm font-bold text-white">{profile?.nombre || user?.email}</p>
            <p className="text-[10px] text-slate-500 capitalize">{profile?.rol || 'usuario'}</p>
          </div>

          {/* Aclaraciones */}
          <div className="space-y-2 text-[10px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Tu identidad se mantiene confidencial ante el reportado</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Los reportes falsos o maliciosos pueden resultar en suspensión de cuenta</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Respondemos en 24-48 horas hábiles</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando || !tipo || !descripcion.trim() || !reportadoId}
            className="w-full py-4 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {enviando ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Enviando reporte...</>
            ) : (
              <><Send className="w-5 h-5" /> Enviar reporte</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
