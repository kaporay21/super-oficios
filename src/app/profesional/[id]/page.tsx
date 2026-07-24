"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Share2, MoreVertical, Star, FileText, 
  MessageSquare, CheckCircle, ShieldCheck, Home, 
  ClipboardList, User, Bell 
} from 'lucide-react';
import { PROFESSIONALS } from '@/data';
import { dbHelper } from '@/lib/supabase';
import Tooltip from '@/components/Tooltip';
import Logo from '@/components/Logo';

export default function PerfilProfesional() {
  const params = useParams();
  const router = useRouter();
  const proId = String(params.id);

  const [pro, setPro] = useState<any>(null);
  const [resenasReales, setResenasReales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dbProfile = await dbHelper.getUserProfile(proId);
        setPro(dbProfile);

        const dbReviews = await dbHelper.getReviewsForProfessional(proId);
        setResenasReales(dbReviews);
      } catch (err) {
        console.error("Error al cargar datos en perfil profesional:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [proId]);

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

  // Calcular calificación promedio si hay opiniones reales
  const avgRating = resenasReales.length > 0 
    ? resenasReales.reduce((acc, curr) => acc + curr.rating, 0) / resenasReales.length 
    : 5.0;

  // Datos extendidos del profesional (combinados con mock para la demo)
  const perfilCompleto = {
    ...pro,
    rating: avgRating,
    experiencia: pro.experiencia || '5+ años',
    trabajosRealizados: 30 + resenasReales.length,
    zona: pro.location,
    whatsapp: '5493811234567',
    descripcion: pro.biografia || `Profesional especializado en ${pro.trade}. Trabajo con seriedad, puntualidad y garantía en cada tarea. Atiendo toda la zona de ${pro.location}.`,
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
          <div className="flex items-center gap-2">
            <Tooltip text="Compartir perfil" position="bottom">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip text="Más opciones" position="bottom">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
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
              <div className="relative shrink-0">
                <img 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md" 
                  alt={perfilCompleto.name}
                  src={perfilCompleto.avatar}
                />
                <div className="absolute bottom-1 right-1 bg-[#00355f] text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-[#00355f]">{perfilCompleto.name}</h1>
                  <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-green-700" /> {perfilCompleto.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-[#fc8127] font-bold text-sm uppercase tracking-wide mb-5">
                  {perfilCompleto.trade}
                </p>
                
                <div className="flex flex-wrap gap-5 mb-4">
                  <div className="flex flex-col">
                    <span className="text-lg text-[#00355f] font-bold">{perfilCompleto.trabajosRealizados}+</span>
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
                
                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => router.push(`/chat/${proId}`)} className="bg-[#fc8127] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] transition-all shadow-md sm:flex-1 active:scale-[0.98]">
                    <FileText className="w-5 h-5" /> Pedir Presupuesto
                  </button>
                  <button onClick={() => router.push(`/chat/${proId}`)} className="border-2 border-[#00355f] text-[#00355f] px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors sm:w-auto active:scale-[0.98]">
                    <MessageSquare className="w-5 h-5" /> Contactar
                  </button>
                  <a 
                    href={`https://wa.me/${perfilCompleto.whatsapp}?text=${encodeURIComponent(`Hola ${perfilCompleto.name}, te contacto a través de OficiosYa y me gustaría pedirte un presupuesto.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition-colors shadow-md sm:w-auto active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Sección Galería Bento */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-1">
                <h2 className="text-xl font-bold text-[#00355f]">Galería de trabajos</h2>
                <button className="text-[#00355f] text-sm font-bold hover:underline">Ver todo</button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl h-64 md:h-auto border border-gray-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt="Trabajo realizado" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0lRHfSHITKHttZBmEZDQNs2_VEsKjOPwJ2LJwrm1p8phhvgv0Odvw2RFR2bnl_SCgi6qA-TT96rEupvC3_rc8574TtEr3lCyFcork9t24aLLquXMRyIsgROrlwwd7Lv8E0z1_IMe-TcLBOI4BQJDxnEdkxO8pGdySRa99LB3XhIY9oo-qRITd2Qpp6b0xIsilRvYx5EuiIkSEQWp5zL90LXtpmOjevzMmQ7WvfRDoTK_Bjds8sfd1K_0EwSitJZeXIXlkMcJvFAwN"
                  />
                  <span className="absolute bottom-4 left-4 z-20 text-white font-bold text-sm">Trabajo destacado</span>
                </div>
                <div className="relative group overflow-hidden rounded-2xl aspect-square border border-gray-100 shadow-sm">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Trabajo 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnyVVnQONVJ8PZ8gnbQKGIYn2AHQfQ49zRB76NjAEwDjOCBKI6R3hCKHVjX-ddmL2so9oojEdXtJpiuR495QyGuPFo9j5IDhQqHtPeVv5g3Amp78OXl0xK_1iOT6fJ_uZyCqFnQJek5Gk9zrQCb6j8oYIk_xCGQc7QscqK1rk8ouFHPJpVamKR6XCxBDvfnPqc8wmbLSfESOCGsx_n0C9iOvLND5Nxjqwo7B8unMKjN0NuLrSXe7I3R9xfbQzEmhgHEqxAMyBlX6i3"/>
                </div>
                <div className="relative group overflow-hidden rounded-2xl aspect-square border border-gray-100 shadow-sm">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Trabajo 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV3oeUMtvr-62lv2Y7V8pDDLGqViqkXUSExnL9Yfo0ub1BDzCktdL77TZIFRTlnwsPZaRl4idiREt7c3sI-pNMl-BtbuSJ_2kS_20f7zqOPFxDmbINB2P33vsgyFUNwAunfIROZqBHnVlO8JcVkGpFg7py-zlFczeZKLpkQw0Fm4t3CJ2izc1_QKnqKiwh1LQGXUgQpeqThJKHVKVnW7EUWN2weL8PXf-_r8hZtjwdqfRA67EGwAFDe34tvaVrVWVHTYvUfv0cdLFV"/>
                </div>
                <div className="col-span-2 relative group overflow-hidden rounded-2xl h-40 border border-gray-100 cursor-pointer shadow-sm">
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity z-20 hover:bg-black/40">
                    <span className="text-white font-bold">+12 fotos más</span>
                  </div>
                  <img className="w-full h-full object-cover" alt="Más trabajos" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHKmtQWygapwtMOi2pQ03eElhxHjNH1m-hrcU7df0gmkXUGP4dBQjF6pca6fNSToaza_zVXSlAPM9973jtn_fQtCDs5zFBf6tVyAEE92R0D0BvJKolUuE_43Fr5dVqUsFUCJh7WzLP0MVnR1h3qgZHbnIeF2PrE5ta1EIw_06o7cNHHVOqdaMRDTXJHvrCTu8sENMU126OSxtU1g7d6rNhalLElfeML20hWhrFG5LKx1FEj_dayskTn6tkNpuypjx2gexBoAm60ng6"/>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Confianza y Reseñas */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Badge de Verificación */}
            <div className="bg-[#104C82] text-white p-6 rounded-2xl flex flex-col gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#fc8127]" />
                <h3 className="text-lg font-bold">Profesional Verificado</h3>
              </div>
              <ul className="text-sm space-y-3 opacity-90 font-medium">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0" /> Identidad validada
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0" /> Matrícula vigente
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0" /> Fondo de garantía OficiosYa
                </li>
              </ul>
            </div>

            {/* Reseñas */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#00355f] px-1">Opiniones recientes</h2>
              
              <div className="space-y-4">

                {/* Reseñas Dinámicas (de clientes reales) */}
                {resenasReales.map((resena) => (
                  <div key={resena.id} className="bg-white border-2 border-[#fc8127]/30 p-5 rounded-2xl shadow-sm relative">
                    <div className="absolute top-3 right-3">
                      <span className="bg-[#fc8127]/10 text-[#fc8127] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md">Verificada</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img className="w-10 h-10 rounded-full object-cover border-2 border-[#fc8127]/30" alt={resena.clienteNombre} src={resena.clienteAvatar} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{resena.clienteNombre}</p>
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
                  </div>
                ))}

                {/* Reseñas Estáticas (mock) */}
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full object-cover" alt="Mariana S." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGoFDAGFQPJAxM_8frPjeqMvonNJimYNsbXSFS3XL7IHT9M0WjRaY4M5mZqxHtwuth5o1P3v-dlo45EjO2-xDd9N93c_Lh0hT7Ks13R5lKqQaQgsCVpuW1DsAGgaUZ29qCVQteaFJeijV6UJSA3fdOnaV19egZxi3uqb93RH6PL-OTO5jLe7-OJ53ZxyiimF0G0K0yT_hPMRMrLUGaMkz2Jnbf69h-TBiF6VZ-DEdVYQNr2bw4qbyBYqNqoA1F-LHMNDuu9oKIVQwa"/>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Mariana S.</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#fc8127] text-[#fc8127]" />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Hace 2 días</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Muy profesional y puntual. Resolvió el problema rápidamente y el presupuesto fue exactamente el acordado. Lo recomiendo.
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full object-cover" alt="Carlos G." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGlwTkEIFFVjRupVG00DSVQpFre8MOWQ8GGizpx6bjLrlRp6s28-piGrUg1yjJMhaWbyHhM3n2D4khxrG2_lPSka0xD6mX2lrxHG-qZDtb-0tlP7Dq7LHxNjOMnEUEzkHb60t9f_X8ely5s1Gh-dXgwtp0-yHkMRZKMyp_j8ohXp2ZT5GbEh-liZO7TIa8OM9CXH3g0RqvqUbGddpNIMqbQ62bIOjdnSE2BFaSpvIEBCBr6vGLHNyk1YnhUAtp54ZiQNCpRlDWiASr"/>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Carlos G.</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#fc8127] text-[#fc8127]" />)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">Hace 1 semana</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Excelente trabajo. Me explicó todo el proceso y dejó todo limpio al terminar. Sin dudas lo vuelvo a contratar.
                  </p>
                </div>
              </div>
              
              <button className="w-full py-3 text-[#00355f] font-bold text-sm border border-[#00355f] rounded-xl hover:bg-blue-50 transition-colors mt-2">
                Leer las {48 + resenasReales.length} opiniones
              </button>
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

    </main>
  );
}