"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Phone, MoreVertical, 
  Send, CheckCheck, Loader2
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
  const conversacionId = params.id as string;
  const { user, profile } = useAuth();
  
  const [message, setMessage] = useState("");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation data
  useEffect(() => {
    const loadChat = async () => {
      if (!user) return;
      
      try {
        // Get conversation details
        const { data: conv, error: convError } = await supabase
          .from('conversaciones')
          .select('*')
          .eq('id', conversacionId)
          .single();

        if (convError || !conv) {
          console.error('Conversación no encontrada');
          setLoading(false);
          return;
        }

        // Determine who the partner is
        const partnerId = conv.usuario1_id === user.id ? conv.usuario2_id : conv.usuario1_id;
        const partnerProfile = await dbHelper.getUserProfile(partnerId);
        setPartner(partnerProfile);

        // Load messages
        const msgs = await dbHelper.getMensajes(conversacionId);
        setMensajes(msgs);

        // Mark messages as read
        await dbHelper.marcarMensajesLeidos(conversacionId, user.id);

      } catch (err) {
        console.error('Error al cargar chat:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [conversacionId, user]);

  // Subscribe to real-time messages
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
        (payload) => {
          setMensajes(prev => [...prev, payload.new]);
          // Auto-mark as read if we are the receptor
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

  // Scroll to bottom when messages change
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

  const formatHora = (fecha: string) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#fc8127] animate-spin" />
          <p className="text-sm font-bold text-gray-500">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">💬</div>
          <h1 className="text-2xl font-bold text-[#00355f]">Conversación no encontrada</h1>
          <p className="text-gray-500">Esta conversación no existe o fue eliminada.</p>
          <button
            onClick={() => router.push('/chat')}
            className="bg-[#00355f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f4c81] transition-colors"
          >
            Volver a mensajes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-20 shrink-0">
        <button 
          onClick={() => router.push('/chat')} 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img 
          src={partner.avatar || partner.fotoPerfil || 'https://i.pravatar.cc/150?u=' + partner.id} 
          alt={partner.name || partner.nombre}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm text-[#00355f] truncate">{partner.name || partner.nombre}</h2>
          {partner.trade && (
            <p className="text-[10px] text-[#fc8127] font-bold uppercase tracking-wider">{partner.trade}</p>
          )}
        </div>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mensajes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400">Enviá el primer mensaje para iniciar la conversación.</p>
          </div>
        ) : (
          mensajes.map((msg) => {
            const isMe = msg.emisor_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isMe
                      ? 'bg-[#00355f] text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.texto}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {formatHora(msg.created_at)}
                    </span>
                    {isMe && (
                      <CheckCheck className={`w-3.5 h-3.5 ${msg.leido ? 'text-blue-300' : 'text-blue-200/50'}`} />
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
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-[#f7fafc] focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none text-sm"
            placeholder="Escribí un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              message.trim()
                ? 'bg-[#fc8127] text-white hover:bg-[#e67320] active:scale-95 shadow-md'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}