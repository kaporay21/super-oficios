"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, Crown, Sparkles, ShieldCheck, 
  Zap, Calculator, FileText, ChevronDown, ChevronUp, Check, 
  HelpCircle, Briefcase, FileSpreadsheet, PhoneCall, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PlanesPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'semestral' | 'anual'>('mensual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('oficiosya_profesional_perfil');
    if (stored) {
      setPerfil(JSON.parse(stored));
    } else {
      const defaultProfile = {
        nombre: 'Roberto Gómez',
        correo: 'roberto@gmail.com',
        telefono: '+54 9 381 123 4567',
        plan: 'Gratis',
        postulacionesUsadas: 0
      };
      setPerfil(defaultProfile);
      localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(defaultProfile));
    }
  }, []);

  const handleSeleccionarPlan = (nombrePlan: string) => {
    if (!perfil) return;
    const nuevoPerfil = { ...perfil, plan: nombrePlan };
    setPerfil(nuevoPerfil);
    localStorage.setItem('oficiosya_profesional_perfil', JSON.stringify(nuevoPerfil));

    // Sincronizar bidireccionalmente con los usuarios del panel de administración
    const storedUsers = localStorage.getItem('oficiosya_admin_users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const updated = users.map((u: any) => u.email === perfil.correo ? { ...u, plan: nombrePlan } : u);
        localStorage.setItem('oficiosya_admin_users', JSON.stringify(updated));
      } catch (e) {}
    }

    // Efecto de celebración con confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#fc8127', '#00355f', '#10B981', '#F59E0B']
    });

    alert(`¡Felicitaciones! Ahora tu suscripción activa es el Plan ${nombrePlan}. Ya podés disfrutar de todos tus beneficios.`);
  };

  const planActivo = perfil?.plan || 'Gratis';

  // Descuentos por ciclo de pago
  const getMultiplier = () => {
    if (billingCycle === 'semestral') return 0.8; // 20% OFF
    if (billingCycle === 'anual') return 0.7; // 30% OFF
    return 1.0;
  };

  const mult = getMultiplier();

  const precioPro = Math.round(8500 * mult);
  const precioMaster = Math.round(15000 * mult);
  const precioContable = Math.round(35000 * mult);

  const faqs = [
    {
      q: "¿En qué consiste el Plan Contable & Monotributo VIP de $35.000?",
      a: "Incluye un Contador Público matriculado asignado a tu disposición las 24hs. Se encarga de tu Alta y recategorización en Monotributo (ARCA/AFIP), inscripción en Rentas provincial (Ingresos Brutos), facturación electrónica y la presentación formal de tus declaraciones juradas mensuales y anuales."
    },
    {
      q: "¿La Atención de Soporte 24hs aplica para Plan Pro y Master?",
      a: "Sí, tanto el Plan Pro, Plan Master y Plan Contable VIP incluyen atención de soporte prioritario las 24 horas del día por canal directo de WhatsApp."
    },
    {
      q: "¿Cómo funcionan los descuentos Semestral (20%) y Anual (30%)?",
      a: "Al abonar semestralmente ahorrás un 20% en cada cuota mensual. Si elegís la modalidad Anual, obtenés un 30% de descuento directo en el valor mensual durante todo el año."
    },
    {
      q: "¿Puedo cambiar de plan cuando lo necesite?",
      a: "Podés subir de plan o cambiar tu frecuencia de facturación en cualquier momento con efecto inmediato."
    }
  ];

  return (
    <div className="min-h-screen bg-[#001b33] font-sans text-slate-100 selection:bg-[#fc8127] selection:text-white pb-24">
      
      {/* Header */}
      <header className="bg-[#001529]/80 backdrop-blur-xl px-4 md:px-8 py-4 sticky top-0 z-50 border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 rounded-full hover:bg-slate-800 text-white transition-colors border border-slate-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
            Oficios<span className="text-[#fc8127]">Ya</span>
            <span className="text-xs bg-orange-500/20 text-[#fc8127] border border-orange-500/30 px-2 py-0.5 rounded-full font-bold uppercase">Planes & Servicios</span>
          </span>
        </div>

        <button 
          onClick={() => router.push('/panel-profesional')} 
          className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all border border-slate-700"
        >
          Volver al Panel
        </button>
      </header>

      {/* HERO SECTION VISUAL */}
      <section className="relative pt-12 pb-14 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#fc8127]/15 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#fc8127] uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Solución Integral para Profesionales
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
              Evolucioná tu Trabajo & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fc8127] via-amber-400 to-orange-500">Gestión Contable</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
              Elegí el plan perfecto para potenciar tu oficio. Accedé al <strong>Presupuestador Flex Pro</strong>, soporte 24hs e <strong>incluí Contador Profesional a disposición</strong> para tus trámites de Monotributo y Rentas.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Soporte 24hs Incluido
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Contador Profesional
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hasta 30% OFF en anual
              </div>
            </div>
          </div>

          {/* Banner Hero */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl group">
              <img 
                src="/plans-hero.png" 
                alt="Planes OficiosYa" 
                className="w-full h-80 md:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001b33] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-[#001529]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fc8127] text-white rounded-xl flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Gestoría Contable Incluida</p>
                    <p className="text-[11px] text-slate-300">Monotributo + DDJJ + Rentas</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase">VIP 35k</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TOGGLE DE FACTURACIÓN (MENSUAL vs SEMESTRAL -20% vs ANUAL -30%) */}
      <section className="max-w-7xl mx-auto px-4 mb-14">
        <div className="text-center mb-3">
          <p className="text-xs font-extrabold text-[#fc8127] uppercase tracking-wider">Elegí tu modalidad de pago y ahorrá</p>
        </div>
        <div className="flex justify-center">
          <div className="bg-[#001529] p-1.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-center gap-1.5">
            <button 
              onClick={() => setBillingCycle('mensual')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                billingCycle === 'mensual' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pago Mensual
            </button>
            <button 
              onClick={() => setBillingCycle('semestral')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                billingCycle === 'semestral' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Semestral</span>
              <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">20% OFF</span>
            </button>
            <button 
              onClick={() => setBillingCycle('anual')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                billingCycle === 'anual' ? 'bg-[#fc8127] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">30% OFF 🔥</span>
            </button>
          </div>
        </div>
      </section>

      {/* TARJETAS DE PRECIOS MEJORADAS (4 PLANES) */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* PLAN BÁSICO (GRATIS) */}
          <div className={`bg-[#001529] rounded-3xl p-6 border flex flex-col justify-between relative transition-all duration-300 ${
            planActivo === 'Gratis' ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-xl' : 'border-slate-800 hover:border-slate-700'
          }`}>
            {planActivo === 'Gratis' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                Plan Activo
              </div>
            )}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Para Iniciar</span>
                <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">01</span>
              </div>
              
              <h3 className="text-xl font-black text-white mb-1">Básico</h3>
              <p className="text-xs text-slate-400 mb-5 min-h-[32px]">Para profesionales que recién comienzan.</p>
              
              <div className="mb-5 pb-5 border-b border-slate-800">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-slate-400 text-xs ml-1 font-semibold">/ mes</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Presupuestador Básico</strong> (Lista de insumos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Postularse a <strong>5 trabajos</strong> por mes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Hasta <strong>5 fotos</strong> en portafolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Soporte estándar</span>
                </li>
              </ul>
            </div>

            {planActivo === 'Gratis' ? (
              <button disabled className="w-full py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold text-xs cursor-default">
                Tu Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handleSeleccionarPlan('Gratis')} 
                className="w-full py-3.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Cambiar a Básico
              </button>
            )}
          </div>

          {/* PLAN PRO */}
          <div className={`bg-[#001529] rounded-3xl p-6 border flex flex-col justify-between relative transition-all duration-300 ${
            planActivo === 'Pro' ? 'border-[#fc8127] ring-2 ring-[#fc8127]/30 shadow-xl' : 'border-slate-800 hover:border-slate-700'
          }`}>
            {planActivo === 'Pro' && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#fc8127] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                Plan Activo
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-[#fc8127] uppercase tracking-widest">Para Crecimiento</span>
                <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">02</span>
              </div>

              <h3 className="text-xl font-black text-white mb-1">Pro</h3>
              <p className="text-xs text-slate-400 mb-5 min-h-[32px]">Cómputos de obra y soporte 24hs.</p>

              <div className="mb-5 pb-5 border-b border-slate-800">
                <span className="text-3xl font-black text-white">
                  ${precioPro.toLocaleString('es-AR')}
                </span>
                <span className="text-slate-400 text-xs ml-1 font-semibold">/ mes</span>
                {billingCycle !== 'mensual' && (
                  <p className="text-[10px] text-amber-400 font-bold mt-1">
                    {billingCycle === 'semestral' ? 'Con 20% OFF en el plan' : 'Con 30% OFF en el plan'}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Presupuestador Flex Pro</strong> (Cómputos por m²)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white font-extrabold">Soporte 24hs Atento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Sección <strong>"Mis Trabajos"</strong> en el panel</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Postularse a <strong>15 trabajos</strong> por mes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">Hasta <strong>15 fotos</strong> en portafolio</span>
                </li>
              </ul>
            </div>

            {planActivo === 'Pro' ? (
              <button disabled className="w-full py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold text-xs cursor-default">
                Tu Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handleSeleccionarPlan('Pro')} 
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors active:scale-95"
              >
                Evolucionar a Pro
              </button>
            )}
          </div>

          {/* PLAN MASTER (VIP) */}
          <div className={`bg-gradient-to-b from-[#002547] to-[#001529] rounded-3xl p-6 border-2 flex flex-col justify-between relative shadow-xl transition-all duration-300 ${
            planActivo === 'Master' ? 'border-[#fc8127] ring-4 ring-[#fc8127]/30 scale-102' : 'border-[#fc8127]/70 hover:border-[#fc8127]'
          }`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#fc8127] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
              <Crown className="w-3.5 h-3.5" /> Más Elegido
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 pt-1">
                <span className="text-[10px] font-extrabold text-[#fc8127] uppercase tracking-widest">Control Total</span>
                <span className="w-7 h-7 rounded-full bg-[#fc8127]/20 text-[#fc8127] flex items-center justify-center font-black text-xs border border-[#fc8127]/30">03</span>
              </div>

              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-1.5">
                Master <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-blue-200/80 mb-5 min-h-[32px]">Postulaciones ilimitadas y 1° puesto en búsquedas.</p>

              <div className="mb-5 pb-5 border-b border-slate-700/80">
                <span className="text-3xl font-black text-white">
                  ${precioMaster.toLocaleString('es-AR')}
                </span>
                <span className="text-blue-200 text-xs ml-1 font-semibold">/ mes</span>
                {billingCycle !== 'mensual' && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">
                    {billingCycle === 'semestral' ? '20% OFF aplicado' : '30% OFF aplicado'}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6 text-xs font-semibold">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                  <span className="text-white"><strong>Postulaciones ILIMITADAS</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                  <span className="text-white"><strong>Presupuestador Flex Pro Completo</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                  <span className="text-white"><strong>Soporte Prioritario 24hs</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                  <span className="text-white">1° Puesto como <strong>"Más Recomendado"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fc8127] shrink-0 mt-0.5" />
                  <span className="text-white">Portafolio de fotos <strong>ILIMITADO</strong></span>
                </li>
              </ul>
            </div>

            {planActivo === 'Master' ? (
              <button disabled className="w-full py-3.5 rounded-xl bg-white/10 text-white font-extrabold text-xs border border-white/20 cursor-default">
                Tu Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handleSeleccionarPlan('Master')} 
                className="w-full py-3.5 rounded-xl bg-[#fc8127] hover:bg-[#e06d19] text-white font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-wider"
              >
                Activar Master
              </button>
            )}
          </div>

          {/* NUEVO PLAN CONTABLE & MONOTRIBUTO VIP ($35.000) */}
          <div className={`bg-gradient-to-b from-amber-950/40 via-[#001529] to-[#001529] rounded-3xl p-6 border-2 flex flex-col justify-between relative shadow-2xl transition-all duration-300 ${
            planActivo === 'Contable VIP' ? 'border-amber-400 ring-4 ring-amber-500/30 scale-102' : 'border-amber-500/80 hover:border-amber-400'
          }`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <Award className="w-3.5 h-3.5" /> Contador Incluido
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 pt-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Empresa & AFIP</span>
                <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30">04</span>
              </div>

              <h3 className="text-xl font-black text-white mb-1 flex items-center gap-1.5">
                Contable VIP <Briefcase className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-amber-200/80 mb-5 min-h-[32px]">Contador a disposición para Monotributo, Rentas y DDJJ.</p>

              <div className="mb-5 pb-5 border-b border-slate-800">
                <span className="text-3xl font-black text-amber-400">
                  ${precioContable.toLocaleString('es-AR')}
                </span>
                <span className="text-slate-400 text-xs ml-1 font-semibold">/ mes</span>
                {billingCycle !== 'mensual' && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">
                    {billingCycle === 'semestral' ? '20% OFF aplicado' : '30% OFF aplicado'}
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 text-xs font-semibold">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-white"><strong>Contador Profesional las 24hs</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Alta y gestión en <strong>Monotributo ARCA/AFIP</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Alta e inscripción en <strong>Rentas provincial</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Presentaciones de <strong>DDJJ mensuales y anuales</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Asesoramiento impositivo sin límites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200"><strong>Incluye Todo el Plan Master</strong></span>
                </li>
              </ul>
            </div>

            {planActivo === 'Contable VIP' ? (
              <button disabled className="w-full py-3.5 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30 cursor-default">
                Tu Plan Actual
              </button>
            ) : (
              <button 
                onClick={() => handleSeleccionarPlan('Contable VIP')} 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-wider"
              >
                Activar Contable VIP
              </button>
            )}
          </div>

        </div>
      </section>

      {/* SECCIÓN ILUSTRADA DE CARACTERÍSTICAS DE IMPACTO */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-[#001529] rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Herramientas y Servicios Integrales para Oficios
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Conocé las soluciones que podés activar con tu suscripción en OficiosYa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#001b33] p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3 group hover:border-slate-700 transition-all">
              <img 
                src="/plan-calc.png" 
                alt="Calculadora de Presupuestos" 
                className="w-28 h-28 object-contain shrink-0 transform group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fc8127]">
                  <Calculator className="w-4 h-4" /> Presupuestador Flex Pro
                </div>
                <h4 className="text-base font-bold text-white">Cómputos Inteligentes por m²</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculá insumos y mano de obra para muros, losas, pintura y armado de presupuestos en PDF.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#001b33] p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3 group hover:border-slate-700 transition-all">
              <img 
                src="/plan-badge.png" 
                alt="Insignias de Verificación" 
                className="w-28 h-28 object-contain shrink-0 transform group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Crown className="w-4 h-4" /> Posicionamiento VIP
                </div>
                <h4 className="text-base font-bold text-white">Insignia "Recomendado"</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aparecé en el 1° puesto de las búsquedas con insignia verificada para recibir hasta 3x más consultas.
                </p>
              </div>
            </div>

            {/* Feature 3: Contador VIP */}
            <div className="bg-[#001b33] p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3 group hover:border-slate-700 transition-all">
              <img 
                src="/plan-accountant.png" 
                alt="Contador Profesional" 
                className="w-28 h-28 object-contain shrink-0 transform group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" /> Contador a Disposición
                </div>
                <h4 className="text-base font-bold text-white">Gestión de Monotributo & Rentas</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tu propio contador asignado las 24hs para altas, facturación y declaraciones juradas mensuales y anuales.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ ACCORDION) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#fc8127]" /> Preguntas Frecuentes
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="bg-[#001529] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-white">{faq.q}</h4>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#fc8127]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}