"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Folder, ArrowLeft, FileText, CheckCircle2, ShieldCheck,
  Calendar, User, DollarSign, Download, MessageSquare, Wrench,
  Loader2, Image as ImageIcon, ExternalLink, ShieldAlert, Award
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, supabase } from '@/lib/supabase';
import { uploadImageToSupabase } from '@/lib/supabaseStorage';
import Logo from '@/components/Logo';

export default function ExpedienteTrabajoPage() {
  return (
    <AuthGuard>
      <ExpedienteContent />
    </AuthGuard>
  );
}

function ExpedienteContent() {
  const router = useRouter();
  const params = useParams();
  const expedienteId = params?.id as string;
  const { user } = useAuth();

  const [expediente, setExpediente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState<'antes' | 'despues' | null>(null);

  const handleSubirFoto = async (tipo: 'antes' | 'despues', file: File | undefined) => {
    if (!file || !expediente?.id) return;
    setSubiendoFoto(tipo);
    try {
      const { publicUrl, error: uploadError } = await uploadImageToSupabase('trabajos', `expedientes/${expediente.id}/${tipo}_${Date.now()}.jpg`, file);
      if (uploadError || !publicUrl) throw uploadError || new Error('No se pudo subir la imagen.');
      await dbHelper.agregarFotoExpediente(expediente.id, tipo, publicUrl);
      setExpediente((prev: any) => ({
        ...prev,
        [tipo === 'antes' ? 'fotos_antes' : 'fotos_despues']: [...(prev[tipo === 'antes' ? 'fotos_antes' : 'fotos_despues'] || []), publicUrl],
      }));
    } catch (err) {
      console.error('Error al subir foto de expediente:', err);
      alert('No pudimos subir la foto. Probá de nuevo.');
    } finally {
      setSubiendoFoto(null);
    }
  };

  useEffect(() => {
    if (expedienteId) loadExpediente();
  }, [expedienteId]);

  const loadExpediente = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dbHelper.getExpedienteTrabajo(expedienteId);
      setExpediente(data);
    } catch (err: any) {
      console.warn('Error al cargar expediente:', err);
      setError('Expediente no encontrado o sin permisos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b33] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
      </div>
    );
  }

  if (error || !expediente) {
    return (
      <div className="min-h-screen bg-[#001b33] flex items-center justify-center p-4">
        <div className="bg-[#001529] border border-slate-800 rounded-3xl p-8 text-center max-w-sm w-full space-y-4">
          <Folder className="w-12 h-12 text-slate-700 mx-auto" />
          <h2 className="text-xl font-black text-white">Expediente No Encontrado</h2>
          <p className="text-xs text-slate-400">{error || 'No pudimos acceder a este expediente digital.'}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#fc8127] text-white font-black text-xs rounded-xl"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const pres = expediente.presupuestos_estructurados;
  const orden = expediente.ordenes_trabajo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#001b33] to-slate-900 text-white font-sans selection:bg-[#fc8127] pb-12">
      {/* Header */}
      <header className="bg-[#001529]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800/60 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" theme="dark" />
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" /> Expediente Digital
            </span>
          </div>
        </div>

        {expediente.conversacion_id && (
          <button
            onClick={() => router.push(`/chat/${expediente.conversacion_id}`)}
            className="bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> Ver Chat
          </button>
        )}
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Hero Card Expediente */}
        <section className="bg-gradient-to-r from-[#001529] via-[#002547] to-[#001529] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black text-[#fc8127] uppercase tracking-widest">Expediente #{expediente.id.slice(0, 8)}</span>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-0.5">{expediente.titulo}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">
                ${parseFloat(expediente.costo_total || 0).toLocaleString('es-AR')}
              </p>
              <span className="text-[10px] text-slate-400">Monto total registrado</span>
            </div>
          </div>

          {/* Grid de Actores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <img
                src={expediente.profesional?.foto_perfil || expediente.profesional?.fotoperfil || 'https://i.pravatar.cc/150'}
                alt={expediente.profesional?.nombre || 'Profesional'}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Profesional Contratado</span>
                <h4 className="font-black text-sm text-white">{expediente.profesional?.nombre || 'Profesional'}</h4>
                <p className="text-[11px] text-[#fc8127] font-bold">{expediente.profesional?.oficios?.[0] || 'Especialista'}</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <img
                src={expediente.cliente?.foto_perfil || expediente.cliente?.fotoperfil || 'https://i.pravatar.cc/150'}
                alt={expediente.cliente?.nombre || 'Cliente'}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente Contratante</span>
                <h4 className="font-black text-sm text-white">{expediente.cliente?.nombre || 'Cliente'}</h4>
                <p className="text-[11px] text-emerald-400 font-bold">✓ Verificado</p>
              </div>
            </div>
          </div>
        </section>

        {/* Presupuesto Aprobado & Garantía */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-[#001529] border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#fc8127]" /> Presupuesto Estructurado
            </h3>
            {pres ? (
              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-white">Detalle:</strong> {pres.detalle}</p>
                <p><strong className="text-white">Tiempo estimado:</strong> {pres.tiempo_estimado || '4 horas'}</p>
                <p><strong className="text-white">Materiales incluidos:</strong> {pres.materiales_incluidos ? 'Sí' : 'No'}</p>
                {pres.observaciones && <p><strong className="text-white">Observaciones:</strong> {pres.observaciones}</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Presupuesto acordado directamente en conversación.</p>
            )}
          </section>

          <section className="bg-[#001529] border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Garantía de Satisfacción
            </h3>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                Garantía Coberta: {expediente.garantia?.replace('_', ' ') || '30 días'}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Este trabajo se encuentra protegido bajo la garantía formal de OficiosYa.
              </p>
            </div>
          </section>
        </div>

        {/* Galería de Registro Antes y Después */}
        <section className="bg-[#001529] border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" /> Galería del Trabajo (Antes / Después)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-black text-slate-400 uppercase">Fotos Antes</span>
              {expediente.fotos_antes?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {expediente.fotos_antes.map((url: string, i: number) => (
                    <img key={i} src={url} alt="Antes" className="w-full h-24 object-cover rounded-xl border border-slate-700" />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 py-6">Sin imágenes registradas al inicio</p>
              )}
              {user?.id === expediente.profesional_id && (
                <label className="block cursor-pointer text-[11px] font-bold text-[#fc8127] hover:underline pt-1">
                  {subiendoFoto === 'antes' ? 'Subiendo...' : '+ Agregar foto'}
                  <input type="file" accept="image/*" className="hidden" disabled={subiendoFoto !== null}
                    onChange={e => handleSubirFoto('antes', e.target.files?.[0])} />
                </label>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase">Fotos Después</span>
              {expediente.fotos_despues?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {expediente.fotos_despues.map((url: string, i: number) => (
                    <img key={i} src={url} alt="Después" className="w-full h-24 object-cover rounded-xl border border-slate-700" />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 py-6">Sin imágenes registradas al finalizar</p>
              )}
              {user?.id === expediente.profesional_id && (
                <label className="block cursor-pointer text-[11px] font-bold text-emerald-400 hover:underline pt-1">
                  {subiendoFoto === 'despues' ? 'Subiendo...' : '+ Agregar foto'}
                  <input type="file" accept="image/*" className="hidden" disabled={subiendoFoto !== null}
                    onChange={e => handleSubirFoto('despues', e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
