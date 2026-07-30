"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Share2, QrCode, TrendingUp, Eye, MessageSquare,
  Users, Copy, CheckCircle2, Loader2, Star, Award, Zap,
  Download, ExternalLink, ChevronRight, BarChart2, Heart,
  Shield, Globe, MessageCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function MiMarcaPage() {
  return (
    <AuthGuard requiredRole="profesional">
      <MiMarcaContent />
    </AuthGuard>
  );
}

function MiMarcaContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [indiceConfianza, setIndiceConfianza] = useState<any>(null);
  const [logros, setLogros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profesional/${user?.id}`
    : '';

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [stats, confianza, logrosData] = await Promise.all([
        dbHelper.getEstadisticasPerfil(user.id),
        dbHelper.calcularIndiceConfianza(user.id),
        dbHelper.getLogros(user.id),
      ]);
      setEstadisticas(stats);
      setIndiceConfianza(confianza);
      setLogros(logrosData);
    } catch (err) {
      console.warn('Error cargando Mi Marca:', err);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartirEn = (red: string) => {
    const texto = encodeURIComponent(`¡Mirá mi perfil profesional en SuperOficios! ${profileUrl}`);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${texto}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${texto}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    };
    if (urls[red]) window.open(urls[red], '_blank');
  };

  const getConfianzaColor = (total: number) => {
    if (total >= 80) return 'text-emerald-400';
    if (total >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const PILARES = [
    { key: 'identidad', label: 'Identidad verificada', maxPts: 20 },
    { key: 'perfilCompleto', label: 'Perfil completo', maxPts: 15 },
    { key: 'trabajos', label: 'Trabajos completados', maxPts: 20 },
    { key: 'rating', label: 'Rating de reseñas', maxPts: 20 },
    { key: 'tiempoRespuesta', label: 'Tiempo de respuesta', maxPts: 15 },
    { key: 'sinReclamos', label: 'Sin reclamos activos', maxPts: 10 },
  ];

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
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white">Mi Marca</h1>
            <p className="text-[10px] text-slate-400">Centro de marketing personal</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Índice de Confianza */}
        {indiceConfianza && (
          <div className="bg-gradient-to-br from-[#001529] to-slate-900 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Índice de Confianza</p>
                <h2 className={`text-5xl font-black mt-1 ${getConfianzaColor(indiceConfianza.total)}`}>
                  {indiceConfianza.total}<span className="text-xl text-slate-500">/100</span>
                </h2>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={indiceConfianza.total >= 80 ? '#10b981' : indiceConfianza.total >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeDasharray={`${(indiceConfianza.total / 100) * 175.9} 175.9`} strokeLinecap="round" />
                </svg>
                <Shield className="w-6 h-6 absolute inset-0 m-auto text-slate-400" />
              </div>
            </div>

            {/* Desglose de pilares */}
            <div className="space-y-2 mb-4">
              {PILARES.map(pilar => {
                const pts = indiceConfianza.desglose[pilar.key] || 0;
                const pct = Math.round((pts / pilar.maxPts) * 100);
                return (
                  <div key={pilar.key}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-400">{pilar.label}</span>
                      <span className={pts === pilar.maxPts ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{pts}/{pilar.maxPts}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pts === pilar.maxPts ? 'bg-emerald-500' : 'bg-[#fc8127]'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sugerencias de mejora */}
            {indiceConfianza.sugerencias.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-[10px] font-black text-amber-400 mb-2 uppercase tracking-wider">Para mejorar tu índice:</p>
                <ul className="space-y-1">
                  {indiceConfianza.sugerencias.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                      <span className="text-amber-400 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas del perfil */}
        {estadisticas && (
          <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#fc8127]" /> Estadísticas de tu Perfil
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Visitas esta semana', value: estadisticas.visitasSemana || '—', icon: <Eye className="w-4 h-4 text-blue-400" /> },
                { label: 'Contactos esta semana', value: estadisticas.contactosSemana || '—', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
                { label: 'Clientes recurrentes', value: estadisticas.clientesRecurrentes || '—', icon: <Heart className="w-4 h-4 text-pink-400" /> },
                { label: 'Logros desbloqueados', value: logros.length, icon: <Award className="w-4 h-4 text-amber-400" /> },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className="text-base font-black text-white">{stat.value}</p>
                    <p className="text-[9px] text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compartir perfil */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-1 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#fc8127]" /> Compartir tu Perfil
          </h3>
          <p className="text-xs text-slate-400 mb-4">Cada vez que compartís tu perfil, más clientes pueden encontrarte.</p>

          {/* Link del perfil */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-400 truncate">
              {profileUrl || '/profesional/tu-perfil'}
            </div>
            <button onClick={copiarLink}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copiado ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-[#fc8127] text-white hover:bg-[#e06d19]'
              }`}>
              {copiado ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
            </button>
          </div>

          {/* Redes sociales */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { red: 'whatsapp', label: 'WhatsApp', color: 'hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400', icon: '💬' },
              { red: 'facebook', label: 'Facebook', color: 'hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400', icon: '📘' },
              { red: 'twitter', label: 'Twitter/X', color: 'hover:bg-sky-500/20 hover:border-sky-500/30 hover:text-sky-400', icon: '🐦' },
              { red: 'linkedin', label: 'LinkedIn', color: 'hover:bg-blue-700/20 hover:border-blue-700/30 hover:text-blue-500', icon: '💼' },
            ].map(r => (
              <button key={r.red} onClick={() => compartirEn(r.red)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-800 text-slate-400 text-[10px] font-bold transition-all ${r.color}`}>
                <span className="text-xl">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* QR del perfil */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-12 h-12 text-slate-800" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4 text-[#fc8127]" /> QR de tu Perfil
            </h3>
            <p className="text-xs text-slate-400 mb-3">Imprimilo en tu vehículo, tarjeta, uniforme o factura.</p>
            <button onClick={() => router.push(`/perfil-publico-cliente?id=${user?.id}`)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#fc8127] hover:underline">
              Ver perfil público <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Logros */}
        {logros.length > 0 && (
          <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Tus Logros
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {logros.map(logro => (
                <div key={logro.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-lg">{logro.tipo === 'primer_trabajo' ? '🏠' : logro.tipo === 'primer_resena' ? '⭐' : '🏆'}</div>
                  <div>
                    <p className="text-xs font-bold text-white">{logro.titulo}</p>
                    <p className="text-[9px] text-slate-500">{new Date(logro.desbloqueado_en).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {logros.length === 0 && (
          <div className="bg-[#001529] border border-dashed border-slate-700 rounded-2xl p-5 text-center">
            <Award className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Completá trabajos para desbloquear logros y certificados compartibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
