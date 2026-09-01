"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Share2, Star, FileText,
  MessageSquare, CheckCircle, ShieldCheck, Home,
  ClipboardList, User, Bell, Award, Camera, Lock, Loader2, Check, Heart
} from 'lucide-react';
import { dbHelper, getCurrentProfile } from '@/lib/supabase';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';
import CameraCaptureModal from '@/components/CameraCaptureModal';

/** Cuántas opiniones se muestran antes de pedir "ver todas". */
const RESENAS_INICIALES = 3;

export default function ProfesionalCliente() {
  const params = useParams();
  const router = useRouter();
  const proId = String(params.id);

  const [pro, setPro] = useState<any>(null);
  const [resenasReales, setResenasReales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [abriendoChat, setAbriendoChat] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [verTodasResenas, setVerTodasResenas] = useState(false);
  const [compartiendoResenaId, setCompartiendoResenaId] = useState<string | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);

  /** Comparte la imagen de una reseña puntual con el menú nativo; si falla, comparte el link del perfil. */
  const compartirResena = async (resena: any) => {
    const imagenUrl = `${window.location.origin}/profesional/${proId}/resena/${resena.id}`;
    const texto = `Mirá lo que dicen de ${pro?.name || 'este profesional'} en OficiosYa`;
    setCompartiendoResenaId(resena.id);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const res = await fetch(imagenUrl);
          const blob = await res.blob();
          const file = new File([blob], 'resena-oficiosya.png', { type: blob.type || 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: texto, text: texto });
          } else {
            await navigator.share({ title: texto, text: texto, url: window.location.href });
          }
          return;
        } catch {
          return;
        }
      }
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } finally {
      setCompartiendoResenaId(null);
    }
  };

  /** Comparte el perfil: menú nativo en celular, copiar link en escritorio. */
  const compartirPerfil = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const titulo = pro?.name ? `${pro.name} en OficiosYa` : 'Perfil en OficiosYa';

    // Solo el dueño del perfil suma puntos/logro por compartirlo -- no un
    // cliente cualquiera que comparte el perfil de otro.
    const otorgarCredito = () => {
      if (pro?.id && currentUser?.id === pro.id) {
        dbHelper.otorgarPuntosUnaVez(pro.id, 'compartir_perfil', 50, 'Compartiste tu perfil');
        dbHelper.desbloquearLogro(pro.id, 'compartir_perfil', 'Compartí tu perfil', 'Compartiste tu link de perfil');
      }
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        otorgarCredito();
        return;
      } catch {
        // El usuario canceló el menú nativo: no es un error.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
      otorgarCredito();
    } catch {
      console.warn('No se pudo copiar el link al portapapeles');
    }
  };

  /**
   * Abre (o crea) la conversación con este profesional y navega al chat.
   * Si no hay sesión, manda a login guardando el destino para volver acá.
   */
  const abrirChat = async () => {
    if (!pro?.id) return;

    if (!currentUser?.id) {
      router.push(`/login?redirect=${encodeURIComponent(`/profesional/${proId}`)}`);
      return;
    }
    if (currentUser.id === pro.id) return; // no tiene sentido chatear con uno mismo

    setAbriendoChat(true);
    try {
      const conv = await dbHelper.getOrCreateConversation(currentUser.id, pro.id);
      if (conv?.id) router.push(`/chat/${conv.id}`);
      else throw new Error('No se pudo abrir la conversación');
    } catch (err: any) {
      console.error('Error al abrir el chat:', err);
      alert(err?.message || 'No pudimos abrir el chat. Intentá de nuevo en un momento.');
    } finally {
      setAbriendoChat(false);
    }
  };

  useEffect(() => {
    getCurrentProfile().then(setCurrentUser).catch(() => null);
  }, []);

  const handleUpdateFotoCamara = async (base64: string) => {
    if (!pro?.id) return;
    try {
      await dbHelper.updateFotoPerfilCamara(pro.id, base64);
      setPro((prev: any) => ({ ...prev, avatar: base64, fotoPerfil: base64 }));
    } catch (err) {
      alert('Error al actualizar la foto de perfil.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Sin fallback al perfil propio: antes, si el id no existía en la BD,
        // se cargaba getCurrentProfile() y la página mostraba TU perfil como si
        // fuera el del profesional buscado. Ahora un id inexistente muestra el
        // estado "no encontrado", que es la verdad.
        const dbProfile = await dbHelper.getUserProfile(proId).catch(() => null);

        setPro(dbProfile);

        if (dbProfile?.id) {
          const dbReviews = await dbHelper.getReviewsForProfessional(dbProfile.id).catch(() => []);
          setResenasReales(dbReviews);
        }
      } catch (err) {
        console.error("Error al cargar datos en perfil profesional:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [proId]);

  // Registra la visita real al perfil -- salvo que sea el propio dueño
  // mirando su perfil, que no cuenta como visita de un cliente.
  useEffect(() => {
    if (!pro?.id) return;
    if (currentUser?.id === pro.id) return;
    dbHelper.registrarVistaPerfil(pro.id, currentUser?.id);
  }, [pro?.id, currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !pro?.id || currentUser.id === pro.id) return;
    dbHelper.getFavoritosIds(currentUser.id)
      .then((ids: string[]) => setEsFavorito(ids.includes(pro.id)))
      .catch(() => null);
  }, [currentUser?.id, pro?.id]);

  const handleToggleFavorito = async () => {
    if (!currentUser?.id) {
      router.push(`/login?redirect=/profesional/${proId}`);
      return;
    }
    if (currentUser.id === pro?.id || cargandoFavorito) return;
    const nuevoValor = !esFavorito;
    setEsFavorito(nuevoValor);
    setCargandoFavorito(true);
    try {
      await dbHelper.toggleFavorito(currentUser.id, pro.id, nuevoValor);
    } catch (err) {
      setEsFavorito(!nuevoValor);
      console.error('Error al actualizar favorito:', err);
    } finally {
      setCargandoFavorito(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#fc8127] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  // Estado de "no encontrado"
  if (!pro) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] font-sans flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-[#00355f]">Profesional no encontrado</h1>
          <p className="text-gray-500">El perfil que buscás no existe o fue eliminado.</p>
          <button
            onClick={() => router.push('/buscar-profesionales')}
            className="bg-[#00355f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f4c81] transition-colors"
          >
            Volver al directorio
          </button>
        </div>
      </main>
    );
  }

  // Cuenta suspendida o eliminada por moderación: no mostramos el perfil
  // completo ni dejamos contactar, aunque alguien tenga el link guardado.
  if (pro.status && pro.status !== 'Activo') {
    return (
      <main className="min-h-screen bg-[#F8F9FA] font-sans flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-[#00355f]">Perfil no disponible</h1>
          <p className="text-gray-500">Este profesional no está disponible en este momento.</p>
          <button
            onClick={() => router.push('/buscar-profesionales')}
            className="bg-[#00355f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f4c81] transition-colors"
          >
            Volver al directorio
          </button>
        </div>
      </main>
    );
  }

  // Calificación promedio real. Sin reseñas queda en 0 y la UI muestra "Nuevo":
  // antes se mostraba 5.0 a todo profesional recién registrado.
  const tieneResenas = resenasReales.length > 0;
  const resenasVisibles = verTodasResenas
    ? resenasReales
    : resenasReales.slice(0, RESENAS_INICIALES);
  const avgRating = tieneResenas
    ? resenasReales.reduce((acc, curr) => acc + curr.rating, 0) / resenasReales.length
    : 0;

  // Datos extendidos del profesional
  const perfilCompleto = {
    ...pro,
    rating: avgRating,
    // Sin dato cargado mostramos "—", no un "5+ años" inventado.
    experiencia: pro.experiencia || '—',
    // Antes era `30 + resenasReales.length`: le regalaba 30 trabajos
    // ficticios a cualquiera que se registrara.
    trabajosRealizados: resenasReales.length,
    zona: pro.location || pro.ciudad || 'Argentina',
    descripcion: (pro.biografia || pro.bio) 
      ? (pro.biografia || pro.bio) 
      : (pro.trade || (pro.oficios && pro.oficios.length > 0)
        ? `Profesional especializado en ${pro.trade || pro.oficios.join(', ')}. Trabajo con seriedad, puntualidad y garantía en cada tarea.` 
        : `Profesional verificado registrado en la plataforma.`),
  };

  // Calcular las fechas relativas
  const fechaRelativa = (fecha: string) => {
    const hoy = new Date();
    const dia = new Date(fecha);
    const diff = Math.floor((hoy.getTime() - dia.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semana${Math.floor(diff / 7) > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diff / 30)} mes${Math.floor(diff / 30) > 1 ? 'es' : ''}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 md:pb-0 text-gray-900">
      
      {/* Cabecera Superior (Top Navigation) */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="flex justify-between items-center w-full px-4 max-w-7xl mx-auto py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 transition-colors rounded-full text-gray-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <Logo size="md" theme="light" />
            </div>
          </div>
          {/* "Compartir" no hacía nada y "Más opciones" abría un menú inexistente.
              Compartir ahora usa la Web Share API (nativa en celulares) con
              fallback a copiar el link; el menú fantasma se eliminó. */}
          <div className="flex items-center gap-2">
            {currentUser?.id !== pro?.id && (
              <Tooltip text={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'} position="bottom">
                <button
                  onClick={handleToggleFavorito}
                  disabled={cargandoFavorito}
                  aria-label={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                >
                  <Heart className={`w-5 h-5 ${esFavorito ? 'fill-[#fc8127] text-[#fc8127]' : ''}`} />
                </button>
              </Tooltip>
            )}
            <Tooltip text={linkCopiado ? '¡Link copiado!' : 'Compartir perfil'} position="bottom">
              <button
                onClick={compartirPerfil}
                aria-label="Compartir perfil"
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              >
                {linkCopiado
                  ? <Check className="w-5 h-5 text-green-600" />
                  : <Share2 className="w-5 h-5" />}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Lado Izquierdo: Info del Perfil y Galería */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Tarjeta Principal de Información */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
              <div className="relative shrink-0 group">
                <img 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md" 
                  alt={perfilCompleto.name}
                  src={perfilCompleto.avatar}
                />
                <div className="absolute bottom-1 right-1 bg-[#00355f] text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                {/* Botón flotante para cambiar foto con cámara en vivo si es su perfil */}
                {currentUser && (currentUser.id === pro?.id || currentUser.id === proId) && (
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="absolute inset-0 rounded-full bg-black/50 text-white font-bold text-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center"
                    title="Solo se permite actualizar foto sacándote otra con la cámara en tiempo real"
                  >
                    <Camera className="w-6 h-6 text-[#fc8127] mb-1" />
                    <span>Cambiar foto con cámara</span>
                  </button>
                )}
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[#00355f]">{perfilCompleto.name}</h1>
                  
                  {/* `avatar` siempre trae fallback, así que la condición vieja
                      le daba el sello a todos. Solo cuenta la captura en vivo. */}
                  {perfilCompleto.fotoVerificada && (
                    <span className="bg-blue-50 text-[#00355f] border border-blue-200 px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm" title="Foto capturada con cámara en vivo">
                      <Camera className="w-3.5 h-3.5 text-[#fc8127]" /> Rostro Verificado
                    </span>
                  )}

                  {(perfilCompleto.verificado || perfilCompleto.estadoDNI === 'Validado') && (
                    <span className="bg-green-100 text-green-800 border border-green-200 px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm" title="DNI Verificado por Administración">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 fill-green-100" /> DNI Verificado
                    </span>
                  )}

                  {(perfilCompleto.matriculadoVerificado || perfilCompleto.estadoCertificados === 'Validado') && (
                    <span className="bg-orange-100 text-orange-900 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm" title="Matrícula y Títulos Validados por Administración">
                      <Award className="w-3.5 h-3.5 text-[#fc8127]" /> Matriculado / Certificado
                    </span>
                  )}

                  {tieneResenas ? (
                    <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-green-700" /> {perfilCompleto.rating.toFixed(1)}
                      <span className="text-green-600/70 font-medium">({resenasReales.length})</span>
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                      Sin calificaciones aún
                    </span>
                  )}
                </div>
                <p className="text-[#fc8127] font-bold text-sm uppercase tracking-wide mb-5">
                  {perfilCompleto.trade}
                </p>
                
                <div className="flex flex-wrap gap-5 mb-4">
                  <div className="flex flex-col">
                    <span className="text-lg text-[#00355f] font-bold">
                      {perfilCompleto.trabajosRealizados > 0 ? perfilCompleto.trabajosRealizados : '—'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Trabajos</span>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="text-lg text-[#00355f] font-bold">{perfilCompleto.experiencia}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Exp</span>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div className="flex flex-col">
                    <span className="text-lg text-[#00355f] font-bold">{perfilCompleto.location.split(',')[0]}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Zona</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-5">{perfilCompleto.descripcion}</p>
                
                {/* Botones de Acción
                    Antes ambos hacían router.push(`/chat/${proId}`), pero
                    /chat/[id] espera el id de la CONVERSACIÓN, no el del
                    profesional: el botón siempre caía en "Conversación no
                    encontrada". Ahora se resuelve la conversación primero. */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => abrirChat()}
                    disabled={abriendoChat}
                    className="bg-[#fc8127] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e06d19] transition-all shadow-md sm:flex-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {abriendoChat
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Abriendo chat...</>
                      : <><FileText className="w-5 h-5" /> Pedir Presupuesto</>}
                  </button>
                  <button
                    onClick={() => abrirChat()}
                    disabled={abriendoChat}
                    className="border-2 border-[#00355f] text-[#00355f] px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors sm:w-auto active:scale-[0.98] disabled:opacity-70"
                  >
                    <MessageSquare className="w-5 h-5" /> Contactar
                  </button>
                </div>

                {/* El teléfono se revela recién cuando hay un trabajo contratado.
                    Antes había acá un botón de WhatsApp público apuntando a un
                    número hardcodeado ('5493811234567') que no era de nadie. */}
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-150 rounded-xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-[#00355f] shrink-0 mt-px" />
                  <span>
                    Coordinás todo por el chat de OficiosYa. El teléfono se
                    intercambia automáticamente cuando aceptás un presupuesto,
                    así queda registro de lo acordado.
                  </span>
                </div>
              </div>
            </div>

            {/* Sección Galería */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-1">
                <h2 className="text-xl font-bold text-[#00355f]">Galería de trabajos</h2>
                {(perfilCompleto.portafolio && perfilCompleto.portafolio.length > 0) && (
                  <span className="text-gray-400 text-xs font-bold">{perfilCompleto.portafolio.length} foto{perfilCompleto.portafolio.length > 1 ? 's' : ''}</span>
                )}
              </div>
              
              {(!perfilCompleto.portafolio || perfilCompleto.portafolio.length === 0) ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm font-medium">
                  📷 Este profesional aún no ha subido fotos a su galería de trabajos.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {perfilCompleto.portafolio.map((item: any, idx: number) => {
                    const imgUrl = typeof item === 'string' ? item : item.url;
                    return (
                      <div key={item.id || idx} className="aspect-square relative group overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={`Trabajo ${idx + 1}`} 
                          src={imgUrl}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Lado Derecho: Confianza y Reseñas */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Estado de verificación REAL.
                Antes esta tarjeta afirmaba "Identidad validada", "Matrícula
                vigente" y "Fondo de garantía" para todos los perfiles sin
                comprobar nada: era el reclamo de confianza más fuerte de la
                página y también el más falso. Ahora refleja el estado de cada
                control, incluidos los que faltan. */}
            <div className="bg-[#104C82] text-white p-6 rounded-2xl flex flex-col gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#fc8127]" />
                <h3 className="text-lg font-bold">Estado de verificación</h3>
              </div>
              <ul className="text-sm space-y-3 font-medium">
                {[
                  {
                    ok: !!perfilCompleto.fotoVerificada,
                    si: 'Rostro capturado en vivo',
                    no: 'Sin foto en vivo',
                  },
                  {
                    ok: perfilCompleto.verificado || perfilCompleto.estadoDNI === 'Validado',
                    si: 'Identidad (DNI) validada',
                    no: 'DNI sin validar',
                  },
                  {
                    ok: perfilCompleto.matriculadoVerificado || perfilCompleto.estadoCertificados === 'Validado',
                    si: 'Matrícula / certificados validados',
                    no: 'Matrícula no acreditada',
                  },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 ${item.ok ? 'opacity-95' : 'opacity-50'}`}>
                    {item.ok
                      ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-300" />
                      : <Lock className="w-5 h-5 shrink-0 text-white/40" />}
                    {item.ok ? item.si : item.no}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reseñas */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#00355f] px-1">Opiniones recientes</h2>
              
              <div className="space-y-4">

                {/* Reseñas Dinámicas (de clientes reales) */}
                {resenasVisibles.map((resena) => (
                  <div key={resena.id} className="bg-white border-2 border-[#fc8127]/30 p-5 rounded-2xl shadow-sm relative">
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#fc8127]/10 text-[#fc8127] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">Verificada</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img className="w-10 h-10 rounded-full object-cover border-2 border-[#fc8127]/30" alt={resena.clienteNombre} src={resena.clienteAvatar} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{resena.clienteNombre}</p>
                            {/* Confianza hiperlocal: si quien reseñó vive en la misma
                                ciudad (o al menos provincia) que el profesional, se lo
                                marcamos -- un rating de un vecino real pesa más. */}
                            {resena.clienteCiudad && pro?.ciudad && resena.clienteCiudad.toLowerCase() === pro.ciudad.toLowerCase() ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">🏘️ Vecino de {resena.clienteCiudad}</span>
                            ) : resena.clienteProvincia && pro?.provincia && resena.clienteProvincia.toLowerCase() === pro.provincia.toLowerCase() ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">🏘️ De {resena.clienteProvincia}</span>
                            ) : null}
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i <= resena.rating ? 'fill-[#fc8127] text-[#fc8127]' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">{fechaRelativa(resena.fecha)}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{resena.trabajoTitulo}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {resena.texto}
                    </p>
                    <button
                      onClick={() => compartirResena(resena)}
                      disabled={compartiendoResenaId === resena.id}
                      className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[#fc8127] hover:underline disabled:opacity-60"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {compartiendoResenaId === resena.id ? 'Preparando...' : 'Compartir esta reseña'}
                    </button>
                  </div>
                ))}

                {resenasReales.length === 0 && (
                  <div className="text-center py-8 bg-white border border-gray-100 rounded-2xl">
                    <p className="text-gray-500 text-sm">Este profesional aún no tiene opiniones.</p>
                  </div>
                )}
              </div>
              
              {/* Antes este botón no hacía nada: la lista ya renderizaba todas
                  las reseñas. Ahora se muestran 3 y el botón expande de verdad. */}
              {resenasReales.length > RESENAS_INICIALES && (
                <button
                  onClick={() => setVerTodasResenas(v => !v)}
                  className="w-full py-3 text-[#00355f] font-bold text-sm border border-[#00355f] rounded-xl hover:bg-blue-50 transition-colors mt-2 active:scale-[0.98]"
                >
                  {verTodasResenas
                    ? 'Ver menos opiniones'
                    : `Ver todas las ${resenasReales.length} opiniones`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Inferior (Visible en móviles) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-3 z-50 pb-safe md:hidden">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00355f] cursor-pointer transition-colors" onClick={() => router.push('/')}>
            <div className="p-1.5">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium">Explorar</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => router.push('/publicar-trabajo')}>
            <div className="p-1.5">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium">Publicar</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer relative" onClick={() => router.push('/notificaciones')}>
            <div className="p-1.5">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium">Notificaciones</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.push('/perfil-cliente')}>
            <div className="bg-[#00355f] text-white p-1.5 rounded-xl shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#00355f]">Perfil</span>
          </div>
        </div>
      </nav>

      {/* Modal de Cámara en vivo para actualizar foto de perfil */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleUpdateFotoCamara}
        title="Actualizar Foto de Perfil con Cámara"
      />
    </main>
  );
}