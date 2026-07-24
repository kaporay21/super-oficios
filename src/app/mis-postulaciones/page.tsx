"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, BookmarkPlus, MapPin, 
  Clock, Trash2, Building2, AlertCircle,
  CheckCircle2, XCircle
} from 'lucide-react';
import Logo from '@/components/Logo';
import { dbHelper } from '@/lib/supabase';

export default function MisPostulacionesPage() {
  const router = useRouter();
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      const storedPerfil = localStorage.getItem('oficiosya_profesional_perfil');
      let currentPerfil = null;
      if (storedPerfil) {
        currentPerfil = JSON.parse(storedPerfil);
        setPerfil(currentPerfil);
      }
      
      const nombrePro = currentPerfil?.nombre || 'Usuario Profesional';
      
      try {
        const misPost = await dbHelper.getMisPostulaciones(nombrePro);
        setPostulaciones(misPost);
      } catch (error) {
        console.error("Error al cargar postulaciones:", error);
      }
    };
    
    initData();
  }, []);

  const handleRetirar = async (empleoId: number) => {
    if (!confirm('¿Estás seguro que deseas retirar tu postulación?')) return;
    
    const nombrePro = perfil?.nombre || 'Usuario Profesional';
    
    try {
      await dbHelper.deletePostulacion(empleoId, nombrePro);
      
      const actualizadas = postulaciones.filter(p => p.empleoId !== empleoId);
      setPostulaciones(actualizadas);
    } catch (error) {
      console.error("Error al retirar postulación:", error);
      alert("Hubo un error al retirar la postulación.");
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En revisión': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Aceptado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rechazado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'En revisión': return <Clock className="w-3.5 h-3.5" />;
      case 'Aceptado': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Rechazado': return <XCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const formatearFecha = (fecha: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-AR', options);
  };

  return (
    <div className="bg-[#f7fafc] text-[#181c1e] min-h-screen flex flex-col font-sans md:pl-20">
      
      {/* Top AppBar */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center px-4 h-16 bg-white shadow-sm border-b border-gray-200">
        <button 
          onClick={() => router.back()} 
          className="p-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-3 cursor-pointer md:hidden" onClick={() => router.push('/panel-profesional')}>
          <Logo size="sm" theme="light" />
        </div>
        <h1 className="text-lg font-black text-[#00355f] ml-auto md:ml-4">Mis Postulaciones</h1>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 pt-20 pb-12">
        
        {/* Banner Dinámico Superior */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-md group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=2000')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f4c81]/95 to-[#fc8127]/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f4c81] to-transparent opacity-80"></div>
          
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                <BookmarkPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">Tus postulaciones</h2>
                <p className="text-sm text-blue-100 font-medium mt-1 drop-shadow-sm max-w-md">
                  Da seguimiento a todas las oportunidades a las que aplicaste. ¡Estás a un paso de tu próximo trabajo!
                </p>
              </div>
            </div>
          </div>
        </div>

        {postulaciones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">No tenés postulaciones activas</h3>
            <p className="text-sm text-gray-500 mb-6">Explorá la bolsa de empleo y encontrá nuevas oportunidades.</p>
            <button
              onClick={() => router.push('/bolsa-empleo')}
              className="px-6 py-3 bg-[#fc8127] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#e06b16] transition-colors"
            >
              Ir a la Bolsa de Empleo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {postulaciones.map((postulacion, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#fc8127]"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-[#00355f] transition-colors">
                      {postulacion.tituloEmpleo}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{postulacion.empleador}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${getEstadoColor(postulacion.estado)}`}>
                    {getEstadoIcon(postulacion.estado)}
                    {postulacion.estado}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Oficio</span>
                    <span className="text-sm font-bold text-gray-700">{postulacion.oficio}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Tipo</span>
                    <span className="text-sm font-bold text-gray-700">{postulacion.tipo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Ubicación</span>
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-[#fc8127]"/> {postulacion.provincia}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Postulación</span>
                    <span className="text-sm font-bold text-gray-700">{formatearFecha(postulacion.fecha)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/chat')}
                    className="px-4 py-2 text-sm font-bold text-[#00355f] bg-[#00355f]/5 rounded-lg hover:bg-[#00355f]/10 transition-colors"
                  >
                    Contactar Empleador
                  </button>
                  <button
                    onClick={() => handleRetirar(postulacion.empleoId)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Retirar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
