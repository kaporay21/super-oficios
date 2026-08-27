"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, Users, TrendingUp, Star, Shield,
  MessageSquare, BarChart2, Bell, Zap, ArrowRight,
  Briefcase, Globe, Award, Clock, DollarSign,
  ChevronDown, Phone, Wrench
} from 'lucide-react';
import Logo from '@/components/Logo';


const beneficios = [
  {
    icon: Users,
    color: 'bg-blue-50 text-[#00355f]',
    titulo: 'Clientes reales en tu zona',
    descripcion: 'Accedé a un flujo constante de solicitudes de clientes verificados que necesitan exactamente lo que vos hacés, cerca de donde trabajás.',
  },
  {
    icon: BarChart2,
    color: 'bg-orange-50 text-[#fc8127]',
    titulo: 'Panel profesional completo',
    descripcion: 'Gestioná tus presupuestos, seguí el estado de cada trabajo, revisá tus ingresos y medí tu reputación desde un dashboard intuitivo.',
  },
  {
    icon: MessageSquare,
    color: 'bg-green-50 text-green-600',
    titulo: 'Chat directo con el cliente',
    descripcion: 'Comunicación inmediata sin intermediarios. Coordiná horarios, aclará dudas y cerrá acuerdos en segundos desde la app.',
  },
  {
    icon: DollarSign,
    color: 'bg-purple-50 text-purple-600',
    titulo: 'Enviá presupuestos online',
    descripcion: 'Presentá tus propuestas de forma profesional. El cliente recibe, compara y acepta tu presupuesto en un solo lugar.',
  },
  {
    icon: Star,
    color: 'bg-yellow-50 text-yellow-600',
    titulo: 'Construí tu reputación',
    descripcion: 'Cada trabajo bien hecho suma una reseña a tu perfil. Más estrellas = más clientes. Tu historial es tu mejor carta de presentación.',
  },
  {
    icon: Shield,
    color: 'bg-teal-50 text-teal-600',
    titulo: 'Verificación y confianza',
    descripcion: 'Tu matrícula e identidad son verificadas por OficiosYa. Los clientes te contratan con tranquilidad porque confían en el sello de calidad.',
  },
  {
    icon: Bell,
    color: 'bg-red-50 text-red-500',
    titulo: 'Alertas de trabajos nuevos',
    descripcion: 'Recibí notificaciones instantáneas cuando aparezca un trabajo nuevo en tu categoría y zona. Nunca más te perdés una oportunidad.',
  },
  {
    icon: Globe,
    color: 'bg-indigo-50 text-indigo-600',
    titulo: 'Perfil público visible',
    descripcion: 'Tu perfil aparece en el directorio público de OficiosYa, donde miles de clientes buscan profesionales todos los días.',
  },
  {
    icon: Award,
    color: 'bg-pink-50 text-pink-600',
    titulo: 'Planes para escalar',
    descripcion: 'Empezá gratis y cuando quieras más visibilidad, accedé a planes Premium con destaque en búsquedas y mayor alcance de zona.',
  },
];

const estadisticas = [
  { valor: '0%', label: 'Comisión por trabajo', icon: Users },
  { valor: '+500', label: 'Profesionales activos', icon: Wrench },
  { valor: '4.8★', label: 'Valoración promedio', icon: Star },
  { valor: '< 2hs', label: 'Tiempo de primer contacto', icon: Clock },
];

const pasos = [
  {
    num: '01',
    titulo: 'Creá tu cuenta gratis',
    desc: 'Completá tus datos, cargá tu foto y describí tus especialidades. Tarda menos de 5 minutos.',
  },
  {
    num: '02',
    titulo: 'Completá tu perfil profesional',
    desc: 'Agregá fotos de trabajos anteriores, tu zona de cobertura, tus tarifas orientativas y tus certificaciones.',
  },
  {
    num: '03',
    titulo: 'Recibí solicitudes y cotizá',
    desc: 'Revisá el muro de trabajos, enviá presupuestos a los que más te convengan y empezá a cerrar contratos.',
  },
  {
    num: '04',
    titulo: 'Trabajá, finalizá y cobrá',
    desc: 'Coordiná por chat, realizá el trabajo, marcalo como finalizado y acumulá reseñas que hacen crecer tu negocio.',
  },
];

const faq = [
  {
    pregunta: '¿Cuánto cuesta unirme?',
    respuesta: 'Registrarte y crear tu perfil es completamente GRATIS. Solo existen planes opcionales de mayor visibilidad para profesionales que quieren crecer más rápido.',
  },
  {
    pregunta: '¿Cómo me verifican?',
    respuesta: 'Al registrarte podés enviar foto de tu matrícula o carnet profesional. El equipo de OficiosYa lo valida en menos de 24hs y aparece el sello de verificado en tu perfil.',
  },
  {
    pregunta: '¿OficiosYa cobra comisión por cada trabajo?',
    respuesta: 'No. Vos y el cliente acuerdan directamente el precio. OficiosYa no cobra comisión sobre tus trabajos. Los planes premium son opcionales y de precio fijo mensual.',
  },
  {
    pregunta: '¿En qué zonas está disponible?',
    respuesta: 'Actualmente operamos en toda Argentina. Podés configurar tu radio de trabajo para recibir solo solicitudes de tu zona.',
  },
];

export default function ServiciosProfesionalPage() {
  const router = useRouter();
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  return (
    <main className="bg-white min-h-screen font-sans text-gray-900 selection:bg-[#0f4c81] selection:text-white">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-12 h-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="lg" theme="light" />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-[#00355f] font-bold text-sm hover:underline hidden md:block"
          >
            Inicio
          </button>
          <button
            onClick={() => router.push('/login')}
            className="text-[#00355f] font-bold text-sm hover:underline hidden md:block"
          >
            Ingresar
          </button>
          <button
            onClick={() => router.push('/registro-profesional')}
            className="bg-[#fc8127] hover:bg-[#e67320] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            Unirme gratis →
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-4 md:px-12 text-center overflow-hidden bg-gradient-to-br from-[#00355f] via-[#0f4c81] to-[#00355f]">
        {/* Blobs decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#fc8127]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#fc8127]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold mb-6 border border-white/20 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 fill-[#fc8127] text-[#fc8127]" />
            Para plomeros, electricistas, albañiles, pintores y más
          </span>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Hacé crecer tu negocio<br />
            con <span className="text-[#fc8127]">OficiosYa</span>
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            La plataforma que conecta a los mejores profesionales de oficios con miles de clientes reales en toda Argentina. <strong className="text-white">Sin comisiones. Sin intermediarios.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/registro-profesional')}
              className="bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl text-lg flex items-center justify-center gap-2 active:scale-95"
            >
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/buscar-profesionales')}
              className="bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-lg flex items-center justify-center gap-2 active:scale-95"
            >
              Ver cómo funciona
            </button>
          </div>
        </div>

        {/* Stats flotantes */}
        <div className="relative z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {estadisticas.map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
              <stat.icon className="w-6 h-6 text-[#fc8127] mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-white">{stat.valor}</p>
              <p className="text-xs text-blue-200 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Beneficios ── */}
      <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#fc8127]/10 text-[#fc8127] text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Todo lo que obtenés
          </span>
          <h3 className="text-3xl md:text-5xl font-extrabold text-[#00355f] leading-tight">
            Tu negocio, potenciado al máximo
          </h3>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
            Cada herramienta fue diseñada para que pases menos tiempo buscando clientes y más tiempo trabajando.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficios.map((b) => (
            <div
              key={b.titulo}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#00355f]/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <b.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00355f] transition-colors">{b.titulo}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{b.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-24 bg-gray-50 px-4 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#00355f]/10 text-[#00355f] text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Simple y rápido
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#00355f]">
              En 4 pasos estás trabajando
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pasos.map((paso, i) => (
              <div
                key={paso.num}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex gap-5 hover:shadow-lg transition-shadow"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00355f] to-[#0f4c81] text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                  {paso.num}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{paso.titulo}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Panel Profesional Preview ── */}
      <section className="py-24 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-[#00355f] rounded-3xl overflow-hidden relative p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          {/* Texto izq */}
          <div className="relative z-10 flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-blue-100 text-[10px] uppercase font-extrabold tracking-widest mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Tu panel siempre disponible
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Todo tu negocio en una sola pantalla
            </h3>
            <ul className="space-y-3 mb-8">
              {[
                'Ver y aceptar presupuestos nuevos',
                'Chatear con clientes en tiempo real',
                'Seguir el estado de cada trabajo',
                'Medir tus ingresos y reputación',
                'Editar tu perfil público cuando quieras',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-blue-100 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/registro-profesional')}
              className="bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
            >
              Crear mi cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Preview del panel (mockup visual) */}
          <div className="relative z-10 shrink-0 w-full md:w-96">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-3">
              {/* Header simulado */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#fc8127] rounded-full flex items-center justify-center text-white text-xs font-bold">JP</div>
                  <div>
                    <p className="text-white text-xs font-bold">Juan Pérez</p>
                    <p className="text-blue-200 text-[10px]">Plomero · Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Disponible
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Trabajos', val: '142' },
                  { label: 'Rating', val: '4.9★' },
                  { label: 'Ingresos', val: '+$85k' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
                    <p className="text-white font-bold text-sm">{s.val}</p>
                    <p className="text-blue-200 text-[9px] font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Solicitudes */}
              <div className="space-y-2">
                <p className="text-blue-200 text-[10px] font-extrabold uppercase tracking-wider">Solicitudes nuevas</p>
                {[
                  { titulo: 'Fuga en baño', zona: 'Palermo', urgente: true },
                  { titulo: 'Instalación termotanque', zona: 'San Isidro', urgente: false },
                ].map((sol) => (
                  <div key={sol.titulo} className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-xs font-bold">{sol.titulo}</p>
                      <p className="text-blue-200 text-[10px]">{sol.zona}</p>
                    </div>
                    {sol.urgente
                      ? <span className="bg-red-500/30 text-red-200 text-[9px] font-bold px-2 py-0.5 rounded-full">URGENTE</span>
                      : <span className="bg-blue-500/20 text-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-full">Normal</span>
                    }
                  </div>
                ))}
              </div>

              {/* CTA mini */}
              <button onClick={() => router.push('/registro-profesional')} className="w-full py-2 bg-[#fc8127] text-white rounded-xl text-xs font-bold hover:bg-[#e67320] transition-colors">
                Ver mi panel completo →
              </button>
            </div>
          </div>

          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#fc8127]/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── Testimonio rápido ── */}
      <section className="py-16 px-4 md:px-12 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              nombre: 'Ricardo M.',
              oficio: 'Plomero Matriculado · CABA',
              texto: '"Desde que me sumé a OficiosYa conseguí 3 veces más clientes por mes. El panel me ayuda a organizarme mejor que antes."',
              avatar: 'https://i.pravatar.cc/80?u=ricardo',
              rating: 5,
            },
            {
              nombre: 'Lucía F.',
              oficio: 'Electricista · GBA Norte',
              texto: '"Pedir un presupuesto antes era un caos. Ahora todo llega al chat y puedo responder desde el celular en segundos."',
              avatar: 'https://i.pravatar.cc/80?u=lucia',
              rating: 5,
            },
            {
              nombre: 'Jorge R.',
              oficio: 'Albañil · Córdoba',
              texto: '"Me parece muy justo que no cobren comisión. Lo que acordé con el cliente es lo que cobré, sin sorpresas."',
              avatar: 'https://i.pravatar.cc/80?u=jorge',
              rating: 5,
            },
          ].map((t) => (
            <div key={t.nombre} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#fc8127] text-[#fc8127]" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">{t.texto}</p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <img src={t.avatar} alt={t.nombre} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.nombre}</p>
                  <p className="text-xs text-gray-400">{t.oficio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 md:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#00355f]">Preguntas frecuentes</h3>
        </div>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
              >
                <span className="font-bold text-gray-900 text-sm">{item.pregunta}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${faqAbierta === i ? 'rotate-180' : ''}`}
                />
              </button>
              {faqAbierta === i && (
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {item.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 px-4 md:px-12 text-center bg-gradient-to-br from-[#00355f] to-[#0f4c81]">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Registro gratuito · Sin tarjeta
          </span>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            ¿Listo para conseguir más clientes?
          </h3>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Creá tu perfil en menos de 5 minutos y empezá a recibir solicitudes hoy mismo.
          </p>
          <button
            onClick={() => router.push('/registro-profesional')}
            className="bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-10 py-5 rounded-2xl text-xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:translate-y-0 inline-flex items-center gap-3"
          >
            Crear mi cuenta gratis
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-blue-200/60 text-xs mt-5">Sin comisiones · Sin costos ocultos · Cancelá cuando quieras</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 md:px-12 bg-[#00355f] border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <Logo size="md" theme="dark" />
          </div>
          <div className="flex gap-6 text-xs text-blue-200/70 font-medium">
            <button onClick={() => router.push('/')} className="hover:text-white transition-colors">Inicio</button>
            <button onClick={() => router.push('/terminos')} className="hover:text-white transition-colors">Términos</button>
            <button onClick={() => router.push('/privacidad')} className="hover:text-white transition-colors">Privacidad</button>
            <button onClick={() => router.push('/soporte')} className="hover:text-white transition-colors">Soporte</button>
          </div>
          <p className="text-xs text-blue-200/50">© 2026 OficiosYa · Argentina</p>
        </div>
      </footer>

    </main>
  );
}
