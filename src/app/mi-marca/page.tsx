"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Share2, TrendingUp, Eye, MessageSquare,
  Users, Copy, CheckCircle2, Loader2, Star, Award, Zap,
  Download, ExternalLink, BarChart2, Heart,
  Shield, Globe, MessageCircle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

// Iconos de marca reales (lucide-react no trae logos de terceros).
// Cada uno toma el color de marca oficial vía fill, no depende de className.
const IconoWhatsApp = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="#25D366"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.1c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.97s.73-2.11.99-2.4c.26-.29.56-.36.75-.36h.53c.17 0 .4-.03.62.48.24.56.81 1.94.88 2.08.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.28.37-.23.62-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z"/></svg>
);
const IconoFacebook = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
);
const IconoX = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="text-slate-200"><path d="M18.24 2H21l-6.55 7.49L22.2 22h-6.4l-5.02-6.57L4.98 22H2.2l7-8.01L1.5 2h6.56l4.54 6.01L18.24 2zm-1.12 18h1.77L7 3.9H5.1L17.12 20z"/></svg>
);
const IconoLinkedIn = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
);

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
  const [compartiendo, setCompartiendo] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profesional/${user?.id}`
    : '';
  const tarjetaUrl = profileUrl ? `${profileUrl}/tarjeta` : '';

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

  /** Comparte la imagen real de la tarjeta con el menú nativo (WhatsApp, Instagram, etc.); si el navegador no lo soporta, cae a copiar el link. */
  const compartirTarjeta = async () => {
    const oficioTexto = profile?.oficios?.[0] ? ` (${profile.oficios[0]})` : '';
    const texto = `¿Necesitás un profesional de confianza${oficioTexto}? Este es mi perfil en OficiosYa`;

    if (typeof navigator !== 'undefined' && navigator.share && tarjetaUrl) {
      setCompartiendo(true);
      try {
        const res = await fetch(tarjetaUrl);
        const blob = await res.blob();
        const file = new File([blob], 'tarjeta-oficiosya.png', { type: blob.type || 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Mi perfil en OficiosYa', text: `${texto}\n${profileUrl}` });
        } else {
          await navigator.share({ title: 'Mi perfil en OficiosYa', text: texto, url: profileUrl });
        }
        return;
      } catch {
        // El usuario cancelo el menu nativo, o el share con archivo fallo: no es un error a mostrar.
        return;
      } finally {
        setCompartiendo(false);
      }
    }

    copiarLink();
  };

  const compartirEn = (red: string) => {
    const oficioTexto = profile?.oficios?.[0] ? ` (${profile.oficios[0]})` : '';
    const texto = encodeURIComponent(
      `¿Necesitás un profesional de confianza${oficioTexto}? Este es mi perfil en OficiosYa 👇\n${profileUrl}`
    );
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

        {/* Tu tarjeta para compartir */}
        <div className="bg-[#001529] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-1 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#fc8127]" /> Tu tarjeta para compartir
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Con tu foto, tu oficio y tu reputación real. Descargala y posteala en WhatsApp, Instagram o Facebook —
            el QR y el link llevan directo a tu perfil.
          </p>

          {tarjetaUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 mb-4 bg-slate-950/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tarjetaUrl}
                alt="Tu tarjeta profesional de OficiosYa"
                className="w-full h-auto block"
              />
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button onClick={compartirTarjeta} disabled={compartiendo}
              className="flex-1 bg-[#fc8127] hover:bg-[#e06d19] disabled:opacity-60 text-white text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition-all">
              {compartiendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
              {compartiendo ? 'Preparando...' : 'Compartir tarjeta'}
            </button>
            <a
              href={tarjetaUrl}
              download="tarjeta-oficiosya.png"
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button onClick={copiarLink}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                copiado ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}>
              {copiado ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Redes sociales (comparten el link; para mandar la imagen usa "Compartir tarjeta") */}
          <p className="text-[10px] text-slate-500 mb-2">O compartí el link directo en:</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { red: 'whatsapp', label: 'WhatsApp', color: 'hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400', Icono: IconoWhatsApp },
              { red: 'facebook', label: 'Facebook', color: 'hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400', Icono: IconoFacebook },
              { red: 'twitter', label: 'Twitter/X', color: 'hover:bg-sky-500/20 hover:border-sky-500/30 hover:text-sky-400', Icono: IconoX },
              { red: 'linkedin', label: 'LinkedIn', color: 'hover:bg-blue-700/20 hover:border-blue-700/30 hover:text-blue-500', Icono: IconoLinkedIn },
            ].map(r => (
              <button key={r.red} onClick={() => compartirEn(r.red)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border border-slate-800 text-slate-400 text-[10px] font-bold transition-all ${r.color}`}>
                <r.Icono />
                {r.label}
              </button>
            ))}
          </div>

          <button onClick={() => router.push(`/profesional/${user?.id}`)}
            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#fc8127] hover:underline">
            Ver perfil público <ExternalLink className="w-3 h-3" />
          </button>
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
