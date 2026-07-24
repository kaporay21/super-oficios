"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, MoreVertical, Paperclip, 
  Send, FileText, CheckCheck, Camera, Smile 
} from 'lucide-react';

export default function ChatIDPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  // Simulación de mensajes para la maqueta
  const mensajes = [
    {
      id: 1,
      texto: "Hola, vi tu solicitud de reparación. ¿Te parece si paso el jueves?",
      hora: "10:15",
      emisor: "otro"
    },
    {
      id: 2,
      texto: "Hola Juan, dale me queda bien a la mañana. ¿A qué hora podrías?",
      hora: "10:20",
      emisor: "yo"
    }
  ];

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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCat-5vEpGaFT5nuFtM5xBjbs2F8f3anTHp1SU43md3NtZ0GS8nzRJxRw7nv_K1uilmzc-VahxG0eNXCpI4VjR1GHcDJKKqRSVpKMHoZ-AlXKRwICrrQTj2Lk8kequ7evgBTHXoy1Sh2DIXTkN9WIgb2acmkdGpP6T6U1C9upsJs7Bff6ya-I9CniSh8ah3t64VmuLMIQhwLBCHVI1rD5vK2GiAFEVsQcyD96j9GM-34X-i_2Ia14sV0K1dGG0GN7FdGDx-y-Mhm0lc" 
                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                alt="Avatar"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h1 className="font-bold text-[#00355f] leading-none">Juan Pérez</h1>
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        
        {/* Aviso de seguridad */}
        <div className="flex justify-center my-2">
          <p className="bg-blue-50 text-[#00355f] text-[10px] font-bold px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-tight">
            Chat protegido por OficiosYa
          </p>
        </div>

        {/* Burbujas de Mensaje */}
        {mensajes.map((msg) => (
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
              <span className="text-xs font-bold uppercase tracking-wider">Presupuesto Enviado</span>
            </div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">#8821</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Instalación Grifería</span>
              <span className="text-lg font-black text-[#00355f]">$85.000</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-[#fc8127] pl-3">
              Incluye materiales básicos, sellado de juntas y 3 meses de garantía por escrito.
            </p>
            <button 
              onClick={() => router.push('/finalizar-trabajo')}
              className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              Aceptar Presupuesto
            </button>
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