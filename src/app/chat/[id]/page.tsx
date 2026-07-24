"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Phone, MoreVertical, Paperclip, 
  Send, FileText, CheckCheck, Camera, Smile, Star, CheckCircle, Hammer, Clock
} from 'lucide-react';

interface TrabajoActivo {
  id: string;
  profesionalId: number;
  profesionalNombre: string;
  profesionalAvatar: string;
  profesionalTrade: string;
  trabajoTitulo: string;
  precio: number;
  fechaInicio: string;
  estado: 'en_curso' | 'finalizado';
  chatId: string;
}

export default function ChatIDPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");
  const [trabajoActivo, setTrabajoActivo] = useState<TrabajoActivo | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [userRole, setUserRole] = useState<'cliente' | 'profesional'>('cliente');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const pro = localStorage.getItem('oficiosya_profesional_perfil');
    const client = localStorage.getItem('oficiosya_cliente_perfil');
    if (pro) {
      setUserRole('profesional');
      const p = JSON.parse(pro);
      setUserName(p.nombre || 'Roberto');
    } else if (client) {
      setUserRole('cliente');
      const c = JSON.parse(client);
      setUserName(c.nombre || 'Cliente');
    }
  }, []);

  // Cargar trabajo activo vinculado a este chat
  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_trabajos_activos');
    if (stored) {
      const trabajos: TrabajoActivo[] = JSON.parse(stored);
      const activo = trabajos.find(t => t.chatId === chatId && t.estado === 'en_curso');
      if (activo) {
        setTrabajoActivo(activo);
      }
    }
  }, [chatId]);

  // Configuración dinámica del interlocutor y mensajes
  const chatPartner = React.useMemo(() => {
    if (userRole === 'profesional') {
      // Los chats del Profesional son con Clientes
      if (chatId === '2') {
        return {
          nombre: 'Mariana Solís',
          avatar: 'https://i.pravatar.cc/150?u=MarianaSolis',
          montoPresupuesto: '$13.800',
          descripcionPresupuesto: 'Incluye mano de obra por reparación de filtración, cambio de tramo de caño y sellado.',
          mensajes: [
            { id: 1, texto: 'Hola Roberto, vi tu postulación en el muro. ¿A qué hora sale para la cañería?', hora: 'Ayer', emisor: 'otro' },
            { id: 2, texto: 'Hola Mariana, en 15 minutos estoy saliendo para tu domicilio. Ya te dejé cargado el presupuesto formal.', hora: 'Hace 5m', emisor: 'yo' }
          ]
        };
      } else {
        // Fallback o ID 1
        return {
          nombre: 'Ricardo Gómez',
          avatar: 'https://i.pravatar.cc/150?u=RicardoGomez',
          montoPresupuesto: '$85.000',
          descripcionPresupuesto: 'Instalación eléctrica completa, materiales básicos, cableado y llaves térmicas.',
          mensajes: [
            { id: 1, texto: 'Hola Roberto, vi tu presupuesto para la instalación. ¿Te parece si pasas hoy?', hora: '10:15', emisor: 'otro' },
            { id: 2, texto: 'Hola Ricardo, sí, perfecto. Nos vemos a las 14:30hs.', hora: '10:20', emisor: 'yo' }
          ]
        };
      }
    } else {
      // Los chats del Cliente son con Profesionales
      if (chatId === '2') {
        return {
          nombre: 'Lucía Ferreyra',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlVCn8FRzTbVmZxic91A-2Ugh1qFBfezVm0wqIKlK38GDjuh2U6BsS9cS4zgLxeCMeUJsDJTluGVvtCoxYzGLllutVL9VFc2SrplBpzopr-qWY5s5igTFagEH0SSVO1Guaku8KqEvFomdFF2iBq1jSsEvjwMlhS7AtAIIOo00YPiuGl-8phMWi49kjhbMIJlKx53XoXFj35c4I8CDVN5DTgxJLofVISU8aZNRfS6Q1mlob5-BG_hOeTLKJPogDS15WJ20ty764J5OU',
          montoPresupuesto: '$15.000',
          descripcionPresupuesto: 'Revisión general de disyuntor y llaves térmicas, recambio de fusible dañado en tablero principal.',
          mensajes: [
            { id: 1, texto: 'Hola, ¿me podrías dar más detalles del cortocircuito?', hora: 'Ayer', emisor: 'otro' },
            { id: 2, texto: 'Hola Lucía, se cortó la luz en la cocina y huele a quemado.', hora: 'Ayer', emisor: 'yo' }
          ]
        };
      } else if (chatId === '3') {
        return {
          nombre: 'Roberto Gómez',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXiZUE8_fhvf-GjicTx03yLdFbwlLwUKVnmaCssfIfzN0czjPxP-_AvZc5N_Bp_ZMbeX3Redepy16tKrGYCxHSRu9VZPiYs73CHLhaWJAG9626Et5WY6Ehzzq9h-VPJ53uddMujQuXLO5bU9Sm-CYy9KqqH4InAr0ZjMbGLyImFjGmvjHTXRZvkDdMdOMa8Xx4rIgi0ltimCU_zlWg33HFoS5EnmtBiRepV3H67TzuHs9XqcsDmYvyJrgsWH0-EeCDxV1gySLESmM8',
          montoPresupuesto: '$13.800',
          descripcionPresupuesto: 'Incluye mano de obra por reparación de filtración, cambio de tramo de caño y sellado.',
          mensajes: [
            { id: 1, texto: 'Hola, ya envié el presupuesto para la reparación del caño bajo mesada. Quedo a disposición.', hora: '11:00', emisor: 'otro' },
            { id: 2, texto: 'Hola Roberto, excelente, ya lo reviso y coordinamos.', hora: '11:15', emisor: 'yo' }
          ]
        };
      } else {
        // Fallback o ID 1 (Carlos Méndez)
        return {
          nombre: 'Carlos Méndez',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJFksOrbm_vwGQaTq5Vuqr1acUBEH2jxptCR5CusLDf2Sb5qZ8fqxqznYXUigT9dEfKpCENJlHaLhC_WoPDhEQJYKRkRbxGiFrH2Jf4hrRkaq4pffxxwX2ietvZfajbBEyvOb665wnkChMjc88JXD3dUq70dprcIy22fOVZalBnuC390ApdZb18RNQjeSD56KQnd4KnVj3W9Vf6W_rfyL2JkZDhnRQLKr0smIh2slCZIjrr0crl5Ri-6h1zRMK70Hxc9PXqDijgpuj',
          montoPresupuesto: '$12.500',
          descripcionPresupuesto: 'Instalación de grifería completa, sellado de silicona y pruebas de pérdida de agua.',
          mensajes: [
            { id: 1, texto: 'Hola, vi tu solicitud de reparación. ¿Te parece si paso el jueves?', hora: '10:15', emisor: 'otro' },
            { id: 2, texto: 'Hola Carlos, dale me queda bien a la mañana. ¿A qué hora podrías?', hora: '10:20', emisor: 'yo' }
          ]
        };
      }
    }
  }, [userRole, chatId]);

  return (
    <main className="flex flex-col h-screen bg-[#f7fafc] font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#00355f]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={chatPartner.avatar} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                alt="Avatar"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="font-bold text-[#00355f] leading-none">{chatPartner.nombre}</h1>
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-[#00355f] rounded-full transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#00355f] rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Banner de Trabajo en Curso → ¿Ya finalizó? (Solo visible para el Cliente) */}
      {userRole === 'cliente' && trabajoActivo && !bannerDismissed && (
        <div className="bg-gradient-to-r from-[#00355f] to-[#0f4c81] text-white px-4 py-3 flex items-center justify-between gap-3 shrink-0 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/15 rounded-xl shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Trabajo en curso: {trabajoActivo.trabajoTitulo}</p>
              <p className="text-[10px] text-blue-200">¿Ya terminó el trabajo con {trabajoActivo.profesionalNombre}?</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                router.push(`/finalizar-trabajo?trabajoId=${trabajoActivo.id}`);
              }}
              className="px-3 py-1.5 bg-[#fc8127] text-white text-xs font-bold rounded-lg hover:bg-[#e67320] transition-colors active:scale-95 whitespace-nowrap"
            >
              Sí, calificar
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="px-3 py-1.5 bg-white/15 text-white text-xs font-bold rounded-lg hover:bg-white/25 transition-colors active:scale-95 whitespace-nowrap"
            >
              Aún no
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        
        {/* Aviso de seguridad */}
        <div className="flex justify-center my-2">
          <p className="bg-blue-50 text-[#00355f] text-[10px] font-bold px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-tight">
            Chat protegido por OficiosYa
          </p>
        </div>

        {/* Burbujas de Mensaje */}
        {chatPartner.mensajes.map((msg) => (
          <div 
            key={msg.id} 
            className={`max-w-[80%] flex flex-col ${msg.emisor === 'yo' ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div className={`p-3 rounded-2xl text-sm shadow-sm ${
              msg.emisor === 'yo' 
                ? 'bg-[#00355f] text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {msg.texto}
            </div>
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] text-gray-400 font-medium">{msg.hora}</span>
              {msg.emisor === 'yo' && <CheckCheck className="w-3 h-3 text-blue-400" />}
            </div>
          </div>
        ))}

        {/* Quote Card (Presupuesto) */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md max-w-[90%] self-start animate-in slide-in-from-left duration-300">
          <div className="bg-[#00355f] p-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {userRole === 'cliente' ? 'Presupuesto Recibido' : 'Presupuesto Enviado'}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">#8821</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Instalación Grifería</span>
              <span className="text-lg font-black text-[#00355f]">{chatPartner.montoPresupuesto}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-[#fc8127] pl-3">
              {chatPartner.descripcionPresupuesto}
            </p>
            {/* Acciones según el rol y si el trabajo está activo */}
            {trabajoActivo ? (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Presupuesto Aceptado
              </div>
            ) : userRole === 'cliente' ? (
              <button 
                onClick={() => router.push('/comparar-presupuestos')}
                className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                Ver Presupuestos
              </button>
            ) : (
              <div className="w-full bg-orange-50 border border-orange-200 text-[#fc8127] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Pendiente de Aceptación
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Footer */}
      <footer className="p-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button className="p-2.5 text-gray-400 hover:text-[#00355f] transition-colors">
            <Paperclip className="w-6 h-6" />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center border border-transparent focus-within:border-[#00355f] focus-within:bg-white transition-all px-2">
            <button className="p-2 text-gray-400">
              <Smile className="w-5 h-5" />
            </button>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..." 
              rows={1}
              className="flex-1 bg-transparent py-3 px-1 text-sm focus:outline-none resize-none max-h-32"
            />
            <button className="p-2 text-gray-400">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <button 
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all ${
              message.trim() 
                ? 'bg-[#fc8127] text-white shadow-md active:scale-90' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Espaciado para iPhone Home Indicator */}
        <div className="h-2 md:hidden"></div>
      </footer>
    </main>
  );
}