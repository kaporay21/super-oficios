"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, Briefcase, MapPin, 
  CheckCircle2, XCircle, Search, Mail,
  MessageSquare, Star, Clock, AlertCircle
} from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthContext';
import { dbHelper } from '@/lib/supabase';

export default function CandidatosEmpleoPage() {
  const router = useRouter();
  const { profile: perfil } = useAuth();

  // Estado local
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [empleosPropios, setEmpleosPropios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [error, setError] = useState<string | null>(null);
  const [contactandoId, setContactandoId] = useState<number | null>(null);

  useEffect(() => {
    if (!perfil?.nombre) return;

    const loadPostulaciones = async () => {
      try {
        const data = await dbHelper.getPostulaciones(perfil.nombre);
        setPostulaciones(data);
      } catch (err) {
        console.error("Error al cargar postulaciones:", err);
        setError('No pudimos cargar tus postulantes. Probá recargar la página.');
      }
    };

    loadPostulaciones();
  }, [perfil?.nombre]);

  /** Abre (o crea) la conversación real con el candidato -- antes mandaba siempre a la bandeja general. */
  const handleChatearConCandidato = async (postulacion: any) => {
    if (!postulacion.candidatoId) {
      alert('Esta postulación es de antes de tener chat directo -- no podemos identificar al candidato. Buscalo en Mensajes.');
      router.push('/chat');
      return;
    }
    if (!perfil?.id || perfil.id === postulacion.candidatoId) return;
    setContactandoId(postulacion.id || postulacion.idPostulacion);
    try {
      const conv = await dbHelper.getOrCreateConversation(perfil.id, postulacion.candidatoId);
      if (conv?.id) router.push(`/chat/${conv.id}`);
      else throw new Error('No se pudo abrir la conversación');
    } catch (err: any) {
      alert(err?.message || 'No pudimos abrir el chat. Intentá de nuevo en un momento.');
    } finally {
      setContactandoId(null);
    }
  };

  const handleCambiarEstado = async (idPostulacion: number, nuevoEstado: string) => {
    try {
      await dbHelper.updatePostulacion(idPostulacion, nuevoEstado, perfil?.nombre || '');
      
      const actualizadas = postulaciones.map(p => 
        p.id === idPostulacion || p.idPostulacion === idPostulacion || p.empleoId === idPostulacion
          ? { ...p, estado: nuevoEstado } 
          : p
      );
      setPostulaciones(actualizadas);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const formatearFecha = (fecha: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return new Date(fecha).toLocaleDateString('es-AR', options);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En revisión': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Aceptado': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rechazado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const postulacionesFiltradas = postulaciones.filter(p => {
    const matchBusqueda = p.candidato?.toLowerCase().includes(busqueda.toLowerCase()) || 
                          p.tituloEmpleo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

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
        <h1 className="text-lg font-black text-[#00355f] ml-auto md:ml-4">Candidatos</h1>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 pt-20 pb-12">

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        {/* Encabezado Fotográfico */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-md group h-48 md:h-64 flex items-end">
          <div 
            className="absolute inset-0 bg-cover bg-top transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/candidatos_obreros.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#00355f] via-[#00355f]/60 to-transparent opacity-90"></div>
          
          <div className="relative z-10 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">Candidatos</h2>
                <p className="text-sm text-blue-100 font-medium mt-1 drop-shadow-sm max-w-md">
                  Revisá perfiles y seleccioná a los mejores profesionales para tu obra.
                </p>
              </div>
            </div>
            <div className="flex shrink-0">
               <button 
                 onClick={() => router.push('/publicar-empleo')}
                 className="w-full md:w-auto px-6 py-3 bg-[#fc8127] text-white font-bold text-sm rounded-xl hover:bg-[#e06b16] transition-colors shadow-lg flex items-center justify-center gap-2"
               >
                 + Nuevo Empleo
               </button>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por candidato o puesto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00355f] focus:border-transparent outline-none text-sm bg-gray-50"
            />
          </div>
          <div className="flex shrink-0">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-[#00355f]"
            >
              <option value="Todos">Todos los estados</option>
              <option value="En revisión">En revisión</option>
              <option value="Aceptado">Aceptados</option>
              <option value="Rechazado">Rechazados</option>
            </select>
          </div>
        </div>

        {/* Lista de Candidatos */}
        {postulaciones.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-[#00355f]/50" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Aún no hay postulantes</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Tus ofertas de empleo están activas. En cuanto alguien se postule, lo verás reflejado en esta sección.
            </p>
          </div>
        ) : postulacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-500">No hay candidatos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {postulacionesFiltradas.map((postulacion, index) => (
              <div 
                key={postulacion.idPostulacion || index}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={postulacion.candidatoAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxtS7RKDHLyY5y6lNafj3BeDhG6IkxEq9VqlAXNANvWQ0SDvyNg94IhrR7NRCH5ipJoHo-ctwaJAmv5swv96O-FKX13VwDYhVA7svtWDswJpd_GgvEvGZ2kobHqyW59sVXYLQijNtWB1mibdA-N4IwLEP7cqf3Pb_3NUsJU3Yh-tx-hpOfZwKqGR20Dm2ulgvMhMPYTc9gxHnptp4OxVKkIgJoTBpASBRrRy5nVKP5AIfU3iuTa-K100p7Pvb_fXmD1yrqla1Jas'} 
                      alt={postulacion.candidato} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-50"
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-base">{postulacion.candidato || 'Usuario Anónimo'}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mt-0.5">
                        <Star className="w-3.5 h-3.5 text-[#fc8127] fill-current" />
                        <span>{postulacion.candidatoRating || '4.0'}</span>
                        {postulacion.candidatoVerificado && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Verificado</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getEstadoColor(postulacion.estado)}`}>
                    {postulacion.estado}
                  </div>
                </div>

                {/* Job Detail */}
                <div className="mb-4 flex-grow">
                  <div className="flex items-start gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-[#00355f] shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-[#00355f] leading-snug">
                      Puesto: {postulacion.tituloEmpleo}
                    </p>
                  </div>
                  
                  {postulacion.mensaje && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 relative">
                      <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-gray-300" />
                      <p className="text-xs text-gray-600 pl-6 italic line-clamp-3">
                        "{postulacion.mensaje}"
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-3">
                    Postulado el {formatearFecha(postulacion.fecha)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() => handleChatearConCandidato(postulacion)}
                    disabled={contactandoId === (postulacion.id || postulacion.idPostulacion)}
                    className="flex-1 py-2.5 bg-blue-50 text-[#00355f] rounded-xl font-bold text-xs hover:bg-blue-100 disabled:opacity-60 transition-colors flex justify-center items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" /> Chatear
                  </button>
                  
                  {postulacion.estado === 'En revisión' && (
                    <>
                      <button 
                        onClick={() => handleCambiarEstado(postulacion.id || postulacion.idPostulacion || postulacion.empleoId, 'Aceptado')}
                        className="flex-1 py-2.5 bg-[#fc8127] text-white rounded-xl font-bold text-xs hover:bg-[#e67320] transition-colors shadow-sm"
                      >
                        Aceptar
                      </button>
                      <button 
                        onClick={() => handleCambiarEstado(postulacion.id || postulacion.idPostulacion || postulacion.empleoId, 'Rechazado')}
                        className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        Descartar
                      </button>
                    </>
                  )}
                  {postulacion.estado === 'Aceptado' && (
                    <button 
                      disabled
                      className="flex-1 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Contratado
                    </button>
                  )}
                  {postulacion.estado === 'Rechazado' && (
                    <button 
                      disabled
                      className="flex-1 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Descartado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
