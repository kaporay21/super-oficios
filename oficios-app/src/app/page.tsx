"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Wrench, Search, Star, Droplet, Zap, 
  MessageSquare, CheckCircle, TrendingUp, Mail, Globe, ClipboardList 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  
  // Estados para los filtros de búsqueda
  const [provincia, setProvincia] = useState('');
  const [oficio, setOficio] = useState('');

  // Listado completo de todas las provincias de Argentina
  const provinciasArgentinas = [
    'Buenos Aires',
    'CABA (Ciudad Autónoma de Buenos Aires)',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  // Listado completo de todos los oficios
  const todosLosOficios = [
    'Plomería',
    'Electricidad',
    'Albañilería',
    'Pintura',
    'Carpintería',
    'Gasista',
    'Cerrajería',
    'Durlock / Yeso',
    'Aire Acondicionado (Instalación y service)',
    'Jardinería',
    'Fumigación',
    'Herrería',
    'Techista / Impermeabilización',
    'Fletes y Mudanzas'
  ];

  // Lógica corregida: Ahora redirige al directorio de profesionales
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (provincia && provincia !== 'Todas las provincias') {
      params.append('provincia', provincia);
    }
    if (oficio && oficio !== 'Todos los oficios') {
      params.append('oficio', oficio);
    }

    const queryString = params.toString();
    if (queryString) {
      router.push(`/buscar-profesionales?${queryString}`); // ← Cambiado aquí
    } else {
      router.push('/buscar-profesionales'); // ← Cambiado aquí
    }
  };

  return (
    <main className="bg-white min-h-screen font-sans selection:bg-[#0f4c81] selection:text-white">
      
      {/* TopAppBar Public */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-12 h-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-2xl">👷🏻‍♂️</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#00355f]">
            Oficios<span className="text-[#fc8127]">Ya</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/bienvenida')}
            className="text-[#00355f] font-bold text-sm hover:underline hidden md:block"
          >
            Crear cuenta
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="bg-[#00355f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0f4c81] transition-colors shadow-md active:scale-95"
          >
            Ingresar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex flex-col justify-center px-4 md:px-12 py-24 md:py-32 overflow-hidden bg-[#00355f]">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(15, 76, 129, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(252, 129, 39, 0.3) 0%, transparent 50%)' }}></div>
        
        <div className="relative z-10 max-w-xl lg:max-w-2xl pt-10 w-full lg:w-[55%] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold mb-6 backdrop-blur-md border border-white/20">
            <Star className="w-3.5 h-3.5 fill-[#fc8127] text-[#fc8127]" /> 
            Confiado por +10k familias
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Tu hogar, en manos de <span className="text-[#fc8127]">expertos</span>
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-lg leading-relaxed">
            Encontrá profesionales verificados para cualquier tarea. Rápido, seguro y cerca de tu casa.
          </p>

          {/* Search Area Funcional */}
          <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl w-full flex flex-col gap-4 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <div className="relative group">
                <label className="absolute left-4 top-2 text-[10px] uppercase font-extrabold text-gray-500 transition-colors">Provincia</label>
                <div className="flex items-center bg-gray-50 rounded-xl px-4 pt-6 pb-2 border border-transparent focus-within:border-[#00355f] transition-all">
                  <MapPin className="text-[#00355f] mr-2 w-5 h-5 shrink-0" />
                  <select 
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-gray-900 w-full font-bold text-sm p-0 appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Todas las provincias</option>
                    {provinciasArgentinas.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative group">
                <label className="absolute left-4 top-2 text-[10px] uppercase font-extrabold text-gray-500 transition-colors">Oficio</label>
                <div className="flex items-center bg-gray-50 rounded-xl px-4 pt-6 pb-2 border border-transparent focus-within:border-[#00355f] transition-all">
                  <Wrench className="text-[#00355f] mr-2 w-5 h-5 shrink-0" />
                  <select 
                    value={oficio}
                    onChange={(e) => setOficio(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-gray-900 w-full font-bold text-sm p-0 appearance-none outline-none cursor-pointer"
                  >
                    <option value="">Todos los oficios</option>
                    {todosLosOficios.map((trade) => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSearch}
              className="w-full bg-[#fc8127] hover:bg-[#e67320] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-base md:text-lg mt-1"
            >
              <Search className="w-5 h-5" />
              Buscar Profesional
            </button>
          </div>
        </div>

        <div className="hidden lg:block absolute right-0 bottom-0 w-[45%] h-[95%] pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#00355f] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#00355f]"></div>
          <img 
            src="/image_f32344.png" 
            alt="Familia feliz" 
            className="w-full h-full object-contain object-bottom opacity-90 mix-blend-multiply brightness-110 saturate-110"
          />
        </div>
      </section>

      {/* Servicios Populares */}
      <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-3xl font-extrabold text-[#00355f]">Servicios Populares</h3>
            <div className="h-1.5 w-16 bg-[#fc8127] rounded-full mt-2"></div>
          </div>
          <button onClick={() => router.push('/buscar-profesionales')} className="text-[#00355f] font-bold text-sm flex items-center gap-1 hover:underline">
            Ver todos &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Plomeria */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-[#00355f] hover:shadow-xl transition-all group cursor-pointer" onClick={() => router.push('/buscar-profesionales?oficio=Plomería')}>
            <div className="relative h-56 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuATY8flL-MfyUm7rRccSGypPj-4UZKhm6f0Ld8Js-Y3Jem5W4lOqCr4eCWve4w8GwhlgYq5_JMnjV928e9nnbYOIJ0_Vb3PBLDdYHjIHjm4GOVsvEqzw7lHHUakYr-msGguBzKQF4ZeG8gJQLTVna6m7YHvOnOS9yTXxcpYeW0sTz_2ahlhfSiqOgKIs_kLSXZichHSHpzZjY9mUyh6N_OeICgK1KO023Svr-TJkSWtaZ4YW9670CZZoUh3lBF4qNu3gM5PpcyYXATG" alt="Plomería" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-[#00355f] text-[#00355f]" />
                <span className="text-xs font-bold text-[#00355f]">4.9 (240+)</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-extrabold text-xl text-gray-900 group-hover:text-[#00355f] transition-colors">Plomería</h4>
                <Droplet className="w-6 h-6 text-[#fc8127]" />
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Reparaciones, instalaciones y urgencias las 24hs en todo momento.</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Desde $15.000</span>
                <button className="bg-blue-50 text-[#00355f] font-bold px-5 py-2.5 rounded-xl text-sm group-hover:bg-[#00355f] group-hover:text-white transition-colors">Solicitar</button>
              </div>
            </div>
          </div>

          {/* Electricidad */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-[#00355f] hover:shadow-xl transition-all group cursor-pointer" onClick={() => router.push('/buscar-profesionales?oficio=Electricidad')}>
            <div className="relative h-56 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1W2fOmSq-AynqbO3ZoWLKh_XWhnamU4gzNipXAwgMd19QXjrLW74lvJpK-ZQeavvPt4luRYD7mhyI0qQuA6QCs8afpj3cqqLqgCs6S4po0rIeUYesugVkfTIMWiABeNBgEH8TIKJHiZdH_Pv9DLWbTS8ggXJkSpU6taEOfoFmwVs-S04n62fGxmqyzsGqJSR4eb_sNOrD5MTYiXByZcjscbg4QHwR8TpMzDU7dtp1JrFSPFMp9pBSecyG65yj2h2KnVBnkMvHuipY" alt="Electricidad" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-[#00355f] text-[#00355f]" />
                <span className="text-xs font-bold text-[#00355f]">4.8 (180+)</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-extrabold text-xl text-gray-900 group-hover:text-[#00355f] transition-colors">Electricidad</h4>
                <Zap className="w-6 h-6 text-[#fc8127]" />
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Tableros, cortocircuitos e iluminación LED para el hogar.</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Desde $12.000</span>
                <button className="bg-blue-50 text-[#00355f] font-bold px-5 py-2.5 rounded-xl text-sm group-hover:bg-[#00355f] group-hover:text-white transition-colors">Solicitar</button>
              </div>
            </div>
          </div>
          
          {/* Carpintería */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-[#00355f] hover:shadow-xl transition-all group hidden md:block lg:block cursor-pointer" onClick={() => router.push('/buscar-profesionales?oficio=Carpintería')}>
            <div className="relative h-56 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAgOMzC9Txmeq9CdoFTw6_3bgil2-7-nBXHS_JH8YoDFRU0aUZopfmpuA-HlTRhsBfhNq7UtZ5sJNxGknJ78rpxsA74yx2-c66pwyNbKlN5C0ND0dKlRwsNKYqC1vrGMoFbqZsg8Nj2LQpu3B6cKPAVRQIu_l5HNHCY7kwwrJPuIGByvijn4ykMiCSP0_cEYR26662kNy51kkFKQMrrjnsiBbUz26tkfatA__r1zQhH2MX4bxzm2_YDUHdpJS9fOB_BL2OQQ9CuTWH" alt="Carpintería" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-[#00355f] text-[#00355f]" />
                <span className="text-xs font-bold text-[#00355f]">4.9 (95+)</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-extrabold text-xl text-gray-900 group-hover:text-[#00355f] transition-colors">Carpintería</h4>
                <Wrench className="w-6 h-6 text-[#fc8127]" />
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Muebles a medida y restauración de madera.</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Desde $20.000</span>
                <button className="bg-blue-50 text-[#00355f] font-bold px-5 py-2.5 rounded-xl text-sm group-hover:bg-[#00355f] group-hover:text-white transition-colors">Solicitar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section className="py-24 bg-gray-50 overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#00355f] mb-3">¿Cómo funciona OficiosYa?</h3>
            <p className="text-gray-500 text-lg">Tu solución en 3 simples pasos</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
            <div className="flex flex-col items-center text-center max-w-[280px] z-10 bg-gray-50">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform border border-gray-100 relative">
                <Search className="w-10 h-10 text-[#00355f]" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#fc8127] text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
              </div>
              <h5 className="font-extrabold text-xl mb-3 text-gray-900">Buscá el servicio</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Explorá profesionales calificados y verificados cerca de tu ubicación.</p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[280px] z-10 bg-gray-50">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 -rotate-3 hover:rotate-0 transition-transform border border-gray-100 relative">
                <MessageSquare className="w-10 h-10 text-[#fc8127]" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#fc8127] text-white flex items-center justify-center font-bold text-sm shadow-md">2</div>
              </div>
              <h5 className="font-extrabold text-xl mb-3 text-gray-900">Chateá y Coordiná</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Hablá directamente, pedí presupuestos y coordiná el horario ideal.</p>
            </div>

            <div className="flex flex-col items-center text-center max-w-[280px] z-10 bg-gray-50">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform border border-gray-100 relative">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#fc8127] text-white flex items-center justify-center font-bold text-sm shadow-md">3</div>
              </div>
              <h5 className="font-extrabold text-xl mb-3 text-gray-900">Calificá la solución</h5>
              <p className="text-gray-500 text-sm leading-relaxed">Pagá de forma segura y ayudá a la comunidad con tu calificación.</p>
            </div>
            
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gray-200 z-0"></div>
          </div>
        </div>
      </section>

      {/* === NUEVA SECCIÓN: CTA CLIENTE (Pedir Presupuesto) === */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-3xl overflow-hidden relative p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-lg">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#fc8127]/10 text-[#fc8127] px-4 py-1.5 rounded-full text-[10px] uppercase font-extrabold tracking-widest mb-6">
              <Star className="w-4 h-4 fill-current" /> Para tu hogar o negocio
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#00355f] mb-6 leading-tight">
              Pedí tu presupuesto <span className="text-[#fc8127]">sin cargo</span>
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg text-lg leading-relaxed font-medium">
              Registrate como cliente, contanos qué necesitás arreglar y recibí múltiples propuestas de profesionales verificados. <br className="hidden md:block"/><strong className="text-[#00355f]">¡Vos tenés el control y elegís la que más te convenga!</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => router.push('/registro-cliente')}
                className="bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md active:scale-95 text-lg flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-5 h-5" /> Solicitar Presupuesto
              </button>
            </div>
          </div>
          
          {/* Ilustración interactiva visual del lado derecho */}
          <div className="relative z-10 shrink-0 mt-8 md:mt-0 w-full md:w-auto flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00355f]/5 rounded-full blur-3xl transform scale-150"></div>
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative z-10 flex flex-col gap-4 w-72 transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                     <CheckCircle className="w-6 h-6 text-green-600" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-900">¡3 Presupuestos recibidos!</p>
                     <p className="text-xs text-gray-500">Hace 5 minutos</p>
                   </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-blue-50 hover:border-[#fc8127] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xl">👨🏻‍🔧</div>
                     <div>
                       <p className="text-xs font-bold text-[#00355f]">Juan P.</p>
                       <div className="flex text-[#fc8127]"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
                     </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">$15.000</span>
                </div>
                <button onClick={() => router.push('/registro-cliente')} className="w-full py-2 bg-[#00355f] text-white rounded-lg text-xs font-bold mt-1 hover:bg-[#0f4c81] transition-colors">Elegir Profesional</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Profesional */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="bg-[#00355f] rounded-3xl overflow-hidden relative p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-blue-100 text-[10px] uppercase font-extrabold tracking-widest mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Oportunidades Abiertas
            </div>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">¡Hacé crecer tu trabajo!</h3>
            <p className="text-blue-100 mb-10 max-w-lg text-lg leading-relaxed">
              Unite a la red más grande y recibí solicitudes de clientes reales en tu zona hoy mismo. Sin intermediarios molestos.
            </p>
            <button 
              onClick={() => router.push('/registro-profesional')}
              className="w-full md:w-auto bg-[#fc8127] hover:bg-[#e67320] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl active:scale-95 text-lg"
            >
              Quiero ser Profesional
            </button>
          </div>
          <div className="relative z-10 shrink-0 mt-8 md:mt-0">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQXyFv-fjrGe6bDCBHdr-pSoTQLiAIJ-EFnegmf3FxmsG3_94UNnT_Smqcy9wCrkg3AI5XRGAq6PizuLvIuaFOAXPNniBp7tqTgqv6EF0KlZtLdRE10ceK2w5AguI_3IBAZQPBQPx2vaTtFUTfrK_JZ1HqwQ3pdq2uBpA3BHzZHK_NoZZN3j27DxpH3eO-icxX96EO6DoP5-DvWPwEV_fH83tCkveJc7h-TETJC208aDBDV7LXjq_u5GDlJsDmShvkYjR_tN12wmwc" 
                alt="Profesional" 
                className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl border-4 border-white/10 shadow-2xl" 
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Nuevos Ingresos</p>
                  <p className="text-base font-bold text-[#00355f]">+$85.000 / sem</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#fc8127]/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-4 md:px-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                  <span className="text-xl">👷🏻‍♂️</span>
                </div>
                <h2 className="font-extrabold text-2xl text-[#00355f]">Oficios<span className="text-[#fc8127]">Ya</span></h2>
              </div>
              <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
                Lideramos el mercado conectando hogares con los mejores talentos locales. Calidad y confianza en cada trabajo.
              </p>
            </div>
            
            <div>
              <h6 className="font-bold text-[#00355f] mb-6 text-lg">Secciones</h6>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><button onClick={() => router.push('/bienvenida')} className="hover:text-[#fc8127] transition-colors">Buscá Profesionales</button></li>
                <li><button onClick={() => router.push('/registro-profesional')} className="hover:text-[#fc8127] transition-colors">Registrá tu Oficio</button></li>
                <li><button onClick={() => router.push('/como-funciona')} className="hover:text-[#fc8127] transition-colors">¿Cómo funciona?</button></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-bold text-[#00355f] mb-6 text-lg">Legales</h6>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><button onClick={() => router.push('/terminos')} className="hover:text-[#fc8127] transition-colors">Términos y Condiciones</button></li>
                <li><button onClick={() => router.push('/terminos')} className="hover:text-[#fc8127] transition-colors">Políticas de Privacidad</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-medium text-gray-400">© 2026 OficiosYa. Hecho con ❤️ para tu hogar.</p>
            <p className="text-xs font-medium text-gray-400">Argentina</p>
          </div>
        </div>
      </footer>
      
    </main>
  );
}