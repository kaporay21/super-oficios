"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Phone, MoreVertical, Send, CheckCheck, Loader2,
  FileText, ShieldCheck, Clock, CheckCircle2, XCircle, DollarSign,
  Plus, AlertCircle, FolderCheck, Lock
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthContext';
import { dbHelper, supabase } from '@/lib/supabase';

export default function ChatIDPage() {
  return (
    <AuthGuard>
      <ChatIDContent />
    </AuthGuard>
  );
}

function ChatIDContent() {
  const router = useRouter();
  const params = useParams();
  const { id: conversacionId } = React.use(params as any) as { id: string };
  const { user, profile } = useAuth();
  
  const [message, setMessage] = useState("");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [conversacion, setConversacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Formulario para emitir Presupuesto Estructurado (Profesional)
  const [showPresupuestoModal, setShowPresupuestoModal] = useState(false);
  const [presupuestoForm, setPresupuestoForm] = useState({
    monto: '',
    tiempo_estimado: '4 horas',
    garantia: '30_dias',
    detalle: '',
    materiales_incluidos: true,
    observaciones: ''
  });
  const [enviandoPresupuesto, setEnviandoPresupuesto] = useState(false);

  // Presupuestos guardados indexados por ID
  const [presupuestosCache, setPresupuestosCache] = useState<Record<string, any>>({});
  const [procesandoAceptacion, setProcesandoAceptacion] = useState<string | null>(null);

  const isProfesional = profile?.rol === 'profesional';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadChat = async () => {
      if (!user) return;
      
      try {
        const { data: conv } = await supabase
          .from('conversaciones')
          .select('*')
          .eq('id', conversacionId)
          .single();

        if (conv) {
          setConversacion(conv);
          const partnerId = conv.usuario1_id === user.id ? conv.usuario2_id : conv.usuario1_id;
          const partnerProfile = await dbHelper.getUserProfile(partnerId);
          setPartner(partnerProfile);
        }

        const msgs = await dbHelper.getMensajes(conversacionId);
        setMensajes(msgs);

        // Cargar detalles de presupuestos vinculados en mensajes
        const presupuestoIds = msgs
          .filter((m: any) => m.texto?.startsWith('📄 PRESUPUESTO_ENVIADO:'))
          .map((m: any) => m.texto.replace('📄 PRESUPUESTO_ENVIADO:', ''));

        if (presupuestoIds.length > 0) {
          const { data: presList } = await supabase
            .from('presupuestos_estructurados')
            .select('*')
            .in('id', presupuestoIds);

          if (presList) {
            const cache: Record<string, any> = {};
            presList.forEach(p => { cache[p.id] = p; });
            setPresupuestosCache(cache);
          }
        }

        await dbHelper.marcarMensajesLeidos(conversacionId, user.id);
      } catch (err: any) {
        console.warn('Error al cargar chat:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [conversacionId, user]);

  useEffect(() => {
    if (!conversacionId) return;

    const channel = supabase
      .channel(`mensajes:${conversacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        async (payload) => {
          setMensajes(prev => [...prev, payload.new]);

          if (payload.new.texto?.startsWith('📄 PRESUPUESTO_ENVIADO:')) {
            const pId = payload.new.texto.replace('📄 PRESUPUESTO_ENVIADO:', '');
            const { data: pData } = await supabase
              .from('presupuestos_estructurados')
              .select('*')
              .eq('id', pId)
              .single();
            if (pData) {
              setPresupuestosCache(prev => ({ ...prev, [pId]: pData }));
            }
          }

          if (user && payload.new.receptor_id === user.id) {
            dbHelper.marcarMensajesLeidos(conversacionId, user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversacionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const handleSend = async () => {
    if (!message.trim() || !user || !partner || sending) return;
    
    setSending(true);
    try {
      await dbHelper.enviarMensaje(
        conversacionId,
        user.id,
        partner.id,
        message.trim()
      );
      setMessage('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    } finally {
      setSending(false);
    }
  };

  const handleEnviarPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partner || !presupuestoForm.monto || !presupuestoForm.detalle.trim()) return;

    setEnviandoPresupuesto(true);
    try {
      await dbHelper.crearPresupuestoEstructurado({
        conversacion_id: conversacionId,
        profesional_id: user.id,
        cliente_id: partner.id,
        monto: parseFloat(presupuestoForm.monto),
        tiempo_estimado: presupuestoForm.tiempo_estimado,
        garantia: presupuestoForm.garantia,
        detalle: presupuestoForm.detalle,
        materiales_incluidos: presupuestoForm.materiales_incluidos,
        observaciones: presupuestoForm.observaciones
      });

      setShowPresupuestoModal(false);
      setPresupuestoForm({
        monto: '',
        tiempo_estimado: '4 horas',
        garantia: '30_dias',
        detalle: '',
        materiales_incluidos: true,
        observaciones: ''
      });
    } catch (err: any) {
      alert(err?.message || 'Error al enviar presupuesto.');
    } finally {
      setEnviandoPresupuesto(false);
    }
  };

  const handleAceptarPresupuesto = async (presupuestoId: string) => {
    if (!user?.id) return;
    setProcesandoAceptacion(presupuestoId);
    try {
      const { orden, expediente } = await dbHelper.aceptarPresupuestoEstructurado(presupuestoId, user.id);
      setConversacion((prev: any) => ({ ...prev, estado_chat: 'trabajo' }));
      
      // Actualizar cache local
      setPresupuestosCache(prev => ({
        ...prev,
        [presupuestoId]: { ...prev[presupuestoId], estado: 'aceptado' }
      }));

      if (expediente?.id) {
        router.push(`/expediente/${expediente.id}`);
      }
    } catch (err: any) {
      alert(err?.message || 'Error al aceptar el presupuesto.');
    } finally {
      setProcesandoAceptacion(null);
    }
  };

  const handleRechazarPresupuesto = async (presupuestoId: string) => {
    if (!user?.id) return;
    const motivo = prompt('Motivo del rechazo (opcional):', 'Elegí otra propuesta');
    try {
      await dbHelper.rechazarPresupuestoEstructurado(presupuestoId, user.id, motivo || undefined);
      setPresupuestosCache(prev => ({
        ...prev,
        [presupuestoId]: { ...prev[presupuestoId], estado: 'rechazado', motivo_rechazo: motivo }
      }));
    } catch (err: any) {
      alert(err?.message || 'Error al rechazar el presupuesto.');
    }
  };

  const formatHora = (fecha: string) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b33] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#001b33] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-6xl">💬</div>
          <h1 className="text-2xl font-black text-white">Conversación no encontrada</h1>
          <button
            onClick={() => router.push('/chat')}
            className="bg-[#fc8127] text-white px-6 py-3 rounded-xl font-black hover:bg-[#e06d19] transition-colors"
          >
            Volver a mensajes
          </button>
        </div>
      </div>
    );
  }

  const estadoChat = conversacion?.estado_chat || 'consulta';

  return (
    <div className="flex flex-col h-screen bg-[#001529] text-white font-sans">
      
      {/* Header Con Banner de Estado de Chat */}
      <header className="bg-[#001b33] border-b border-slate-800 px-4 py-3 z-20 shrink-0 space-y-2">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/chat')} className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img 
            src={partner.avatar || partner.fotoPerfil || 'https://i.pravatar.cc/150?u=' + partner.id} 
            alt={partner.name || partner.nombre}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700" 
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-sm text-white truncate">{partner.name || partner.nombre}</h2>
            <p className="text-[10px] text-slate-400 capitalize">{partner.trade || partner.rol || 'Usuario'}</p>
          </div>

          {/* Botón de Enviar Presupuesto (Sólo Profesional) */}
          {isProfesional && estadoChat !== 'finalizado' && (
            <button
              onClick={() => setShowPresupuestoModal(true)}
              className="bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <FileText className="w-4 h-4" /> Presupuestar
            </button>
          )}
        </div>

        {/* Estado del Chat Banner */}
        <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center justify-between ${
          estadoChat === 'trabajo' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          estadoChat === 'finalizado' ? 'bg-slate-800 border-slate-700 text-slate-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <span className="capitalize">💬 Chat de {estadoChat}</span>
          {estadoChat === 'trabajo' && (
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-md font-black">
              Orden de Trabajo Activa
            </span>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-950/80">
        {mensajes.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-sm">Enviá un mensaje para iniciar la negociación.</p>
          </div>
        ) : (
          mensajes.map((msg) => {
            const isMe = msg.emisor_id === user?.id;

            // Renderizar Tarjeta de Presupuesto Estructurado si el mensaje es especial
            if (msg.texto?.startsWith('📄 PRESUPUESTO_ENVIADO:')) {
              const presId = msg.texto.replace('📄 PRESUPUESTO_ENVIADO:', '');
              const presData = presupuestosCache[presId];

              if (!presData) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
                      Cargando detalles del presupuesto...
                    </div>
                  </div>
                );
              }

              const estaPendiente = presData.estado === 'pendiente';
              const estaAceptado = presData.estado === 'aceptado';
              const estaRechazado = presData.estado === 'rechazado';

              return (
                <div key={msg.id} className="flex justify-center my-3 w-full">
                  <div className="bg-[#001529] border-2 border-slate-700 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#fc8127] tracking-wider">Presupuesto Formal</span>
                        <h3 className="text-2xl font-black text-white mt-0.5">
                          ${parseFloat(presData.monto || 0).toLocaleString('es-AR')}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${
                        estaAceptado ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        estaRechazado ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {presData.estado}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <p><strong className="text-white">Detalle:</strong> {presData.detalle || 'Servicio profesional'}</p>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                        <div>⏱️ <strong>Tiempo:</strong> {presData.tiempo_estimado || 'A convenir'}</div>
                        <div>🛡️ <strong>Garantía:</strong> {presData.garantia || '30 días'}</div>
                      </div>
                      {presData.materiales_incluidos && (
                        <p className="text-[11px] text-emerald-400 font-bold">✓ Incluye materiales de trabajo</p>
                      )}
                    </div>

                    {/* Acciones de Aceptar / Rechazar para el Cliente */}
                    {!isProfesional && estaPendiente && (
                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleAceptarPresupuesto(presData.id)}
                          disabled={procesandoAceptacion === presData.id}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5"
                        >
                          {procesandoAceptacion === presData.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Aceptar Presupuesto</>}
                        </button>
                        <button
                          onClick={() => handleRechazarPresupuesto(presData.id)}
                          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-[#fc8127] text-white rounded-br-none'
                      : 'bg-[#001529] text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.texto}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'justify-end text-orange-200' : 'justify-start text-slate-500'}`}>
                    <span>{formatHora(msg.created_at)}</span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${msg.leido ? 'text-white' : 'text-orange-200/50'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#001b33] border-t border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            className="flex-1 h-12 px-4 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] text-xs"
            placeholder={estadoChat === 'finalizado' ? 'Este chat se encuentra bloqueado para nuevas consultas...' : 'Escribí un mensaje...'}
            disabled={estadoChat === 'finalizado'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending || estadoChat === 'finalizado'}
            className="w-12 h-12 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white font-bold flex items-center justify-center transition-all disabled:opacity-40"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MODAL EMITIR PRESUPUESTO ESTRUCTURADO (PROFESIONAL) */}
      {showPresupuestoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleEnviarPresupuesto} className="bg-[#001529] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#fc8127]" /> Emitir Presupuesto Formal
              </h3>
              <button type="button" onClick={() => setShowPresupuestoModal(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Monto total ($) *</label>
              <input
                type="number"
                required
                placeholder="Ej: 45000"
                value={presupuestoForm.monto}
                onChange={e => setPresupuestoForm(f => ({ ...f, monto: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Plazo estimado</label>
                <input
                  type="text"
                  placeholder="Ej: 3 horas"
                  value={presupuestoForm.tiempo_estimado}
                  onChange={e => setPresupuestoForm(f => ({ ...f, tiempo_estimado: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Garantía</label>
                <select
                  value={presupuestoForm.garantia}
                  onChange={e => setPresupuestoForm(f => ({ ...f, garantia: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#fc8127]"
                >
                  <option value="sin_garantia">Sin garantía</option>
                  <option value="30_dias">30 días</option>
                  <option value="90_dias">90 días</option>
                  <option value="6_meses">6 meses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Detalle del servicio *</label>
              <textarea
                required
                rows={3}
                placeholder="Describí los trabajos a realizar..."
                value={presupuestoForm.detalle}
                onChange={e => setPresupuestoForm(f => ({ ...f, detalle: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fc8127] resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mat"
                checked={presupuestoForm.materiales_incluidos}
                onChange={e => setPresupuestoForm(f => ({ ...f, materiales_incluidos: e.target.checked }))}
                className="w-4 h-4 accent-[#fc8127]"
              />
              <label htmlFor="mat" className="text-xs text-slate-300 cursor-pointer">Incluye materiales e insumos</label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPresupuestoModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviandoPresupuesto}
                className="px-5 py-2.5 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white text-xs font-black flex items-center gap-1.5"
              >
                {enviandoPresupuesto ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Enviar Presupuesto</>}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}