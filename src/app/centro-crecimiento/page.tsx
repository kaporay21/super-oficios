"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Trophy, Star, Zap, Target, Award, CheckCircle2,
  Loader2, TrendingUp, Users, MessageSquare, Camera, Clock,
  ChevronRight, Lock
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function CentroOportunidadesPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <CentroCrecimientoContent />
    </AuthGuard>
  );
}

const MISIONES_ESTATICAS = [
  { id: 'perfil_completo', titulo: 'Perfil al 100%', descripcion: 'Completá foto, descripción, zona y oficios', puntos: 50, icono: '👤', campo: 'perfilCompleto' },
  { id: 'primera_resena', titulo: 'Primera reseña', descripcion: 'Recibí tu primera reseña verificada de un cliente', puntos: 30, icono: '⭐', campo: 'resenas' },
  { id: 'verificado', titulo: 'Identidad verificada', descripcion: 'Completá el proceso de verificación de identidad', puntos: 100, icono: '🛡️', campo: 'verificado' },
  { id: 'cinco_trabajos', titulo: '5 trabajos completados', descripcion: 'Completá 5 órdenes de trabajo desde la plataforma', puntos: 75, icono: '🔧', campo: 'trabajos5' },
  { id: 'respuesta_rapida', titulo: 'Respuesta rápida', descripcion: 'Respondé mensajes en menos de 30 minutos', puntos: 40, icono: '⚡', campo: 'tiempoRespuesta' },
  { id: 'compartir_perfil', titulo: 'Compartí tu perfil', descripcion: 'Compartí tu link de perfil en redes sociales', puntos: 20, icono: '📤', campo: 'compartido' },
];

function CentroCrecimientoContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [logros, setLogros] = useState<any[]>([]);
  const [indiceConfianza, setIndiceConfianza] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalTrabajos, setTotalTrabajos] = useState(0);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [logrosData, confianza, ordenes] = await Promise.all([
        dbHelper.getLogros(user.id),
        dbHelper.calcularIndiceConfianza(user.id),
        dbHelper.getOrdenesTrabajoProfesional(user.id),
      ]);
      setLogros(logrosData);
      setIndiceConfianza(confianza);
      const finalizados = ordenes.filter((o: any) => ['finalizado', 'con_garantia'].includes(o.estado)).length;
      setTotalTrabajos(finalizados);
    } catch (err) {
      console.warn('Error cargando Centro de Crecimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  const nivelInfo = dbHelper.getNivelPlataforma(totalTrabajos);

  // Evalúa si una misión está completada según datos reales
  const estaCompletada = (mision: any): boolean => {
    if (!indiceConfianza) return false;
    switch (mision.campo) {
      case 'perfilCompleto': return indiceConfianza.desglose.perfilCompleto >= 15;
      case 'verificado': return indiceConfianza.desglose.identidad >= 20;
      case 'trabajos5': return totalTrabajos >= 5;
      case 'tiempoRespuesta': return indiceConfianza.desglose.tiempoRespuesta >= 10;
      default: return logros.some(l => l.tipo === mision.id);
    }
  };

  const misionesCompletadas = MISIONES_ESTATICAS.filter(estaCompletada).length;
  const porcentajeMisiones = Math.round((misionesCompletadas / MISIONES_ESTATICAS.length) * 100);

  const progreso = nivelInfo.siguiente > 0
    ? Math.round((totalTrabajos / nivelInfo.siguiente) * 100)
    : 100;

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
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Centro de Crecimiento</h1>
            <p className="text-[10px] text-slate-400">Misiones, logros y nivel</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Nivel actual */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu nivel</p>
              <h2 className="text-3xl font-black text-white mt-0.5">
                {nivelInfo.emoji} {nivelInfo.nivel}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{totalTrabajos} trabajos completados</p>
              {nivelInfo.siguiente > 0 && (
                <p className="text-xs font-bold text-amber-400 mt-0.5">
                  Faltan {nivelInfo.siguiente - totalTrabajos} para {nivelInfo.nivel === 'Bronce' ? '🥈 Plata' : nivelInfo.nivel === 'Plata' ? '🥇 Oro' : '💎 Platino'}
                </p>
              )}
            </div>
          </div>
          {nivelInfo.siguiente > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{nivelInfo.nivel}</span>
                <span>{nivelInfo.siguiente} trabajos</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all"
                  style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Progreso de misiones */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#fc8127]" /> Misiones activas
            </h3>
            <span className="text-xs font-bold text-[#fc8127]">{misionesCompletadas}/{MISIONES_ESTATICAS.length}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#fc8127] to-amber-400 rounded-full transition-all"
              style={{ width: `${porcentajeMisiones}%` }} />
          </div>

          <div className="space-y-2.5">
            {MISIONES_ESTATICAS.map(mision => {
              const completada = estaCompletada(mision);
              return (
                <div key={mision.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  completada ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/50'
                }`}>
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {mision.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black ${completada ? 'text-emerald-400' : 'text-white'}`}>{mision.titulo}</p>
                    <p className="text-[10px] text-slate-500 truncate">{mision.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-amber-400">+{mision.puntos}</span>
                    {completada
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logros desbloqueados */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Logros desbloqueados
          </h3>
          {logros.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Completá misiones para desbloquear logros y certificados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {logros.map(logro => (
                <div key={logro.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-sm font-black text-white">{logro.titulo}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(logro.desbloqueado_en).toLocaleDateString('es-AR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-3">Mejorar mi posición</h3>
          <div className="space-y-2">
            {[
              { label: 'Ver mi Índice de Confianza', route: '/mi-marca', icon: <Star className="w-4 h-4 text-amber-400" /> },
              { label: 'Crear Orden de Trabajo', route: '/orden-trabajo', icon: <Zap className="w-4 h-4 text-[#fc8127]" /> },
              { label: 'Completar mi perfil', route: '/configuracion-profesional', icon: <Users className="w-4 h-4 text-blue-400" /> },
            ].map(accion => (
              <button key={accion.route} onClick={() => router.push(accion.route)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700 transition-all">
                {accion.icon}
                <span className="text-sm font-bold text-white flex-1 text-left">{accion.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
