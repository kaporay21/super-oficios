"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Edit3, CreditCard, MessageSquare, 
  CheckCircle2, Award, Search, Wrench, Wallet,
  HelpCircle, Sparkles, Check, UploadCloud, MapPin, 
  Star, ShieldCheck, LogIn, UserPlus, Home
} from 'lucide-react';
import Logo from '@/components/Logo';
import confetti from 'canvas-confetti';

export default function ComoFuncionaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'client' | 'pro'>('client');
  const [isProLoggedIn, setIsProLoggedIn] = useState(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);

  // Estados interactivos para los mockups de Clientes
  const [step1ClientPhoto, setStep1ClientPhoto] = useState<'idle' | 'uploading' | 'uploaded'>('idle');
  const [step2ClientBudget, setStep2ClientBudget] = useState<number | null>(null);
  const [step3ClientChat, setStep3ClientChat] = useState<'idle' | 'typing' | 'replied' | 'hired'>('idle');
  const [step4ClientRating, setStep4ClientRating] = useState<number>(0);

  // Estados interactivos para los mockups de Profesionales
  const [step1ProVerified, setStep1ProVerified] = useState<boolean>(false);
  const [step2ProJobState, setStep2ProJobState] = useState<'idle' | 'sending' | 'applied'>('idle');
  const [step3ProTasks, setStep3ProTasks] = useState<boolean[]>([false, false, false]);
  const [step4ProPaid, setStep4ProPaid] = useState<boolean>(false);

  useEffect(() => {
    const pro = localStorage.getItem('oficiosya_profesional_perfil');
    const client = localStorage.getItem('oficiosya_cliente_perfil');
    if (pro) {
      setIsProLoggedIn(true);
      setActiveTab('pro');
    } else if (client) {
      setIsClientLoggedIn(true);
      setActiveTab('client');
    }
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  const handleBottomCTA = () => {
    triggerConfetti();
    setTimeout(() => {
      if (isProLoggedIn) {
        router.push('/panel-profesional');
      } else if (isClientLoggedIn) {
        router.push('/cliente');
      } else {
        router.push('/bienvenida');
      }
    }, 800);
  };

  // Toggle tasks for Pro Step 3
  const handleToggleProTask = (index: number) => {
    const newTasks = [...step3ProTasks];
    newTasks[index] = !newTasks[index];
    setStep3ProTasks(newTasks);
  };

  // Reset interactive steps when switching tabs
  const handleTabChange = (tab: 'client' | 'pro') => {
    setActiveTab(tab);
    // Reset states
    setStep1ClientPhoto('idle');
    setStep2ClientBudget(null);
    setStep3ClientChat('idle');
    setStep4ClientRating(0);
    setStep1ProVerified(false);
    setStep2ProJobState('idle');
    setStep3ProTasks([false, false, false]);
    setStep4ProPaid(false);
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans relative overflow-x-hidden selection:bg-[#00355f] selection:text-white">
      
      {/* Fondo Decorativo Superior */}
      <div 
        className="absolute top-0 inset-x-0 h-[500px] z-0 opacity-40 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(0, 53, 95, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(252, 129, 39, 0.08) 0%, transparent 45%)' 
        }}
      ></div>

      {/* TopAppBar de Ancho Completo */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <Logo size="md" theme="light" />
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-slate-600 hover:text-[#00355f] font-bold text-sm rounded-xl hover:bg-slate-50 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          {isProLoggedIn && (
            <button 
              onClick={() => router.push('/panel-profesional')}
              className="bg-gradient-to-r from-[#00355f] to-[#0f4c81] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-900/10 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Ir a mi Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isClientLoggedIn && !isProLoggedIn && (
            <button 
              onClick={() => router.push('/cliente')}
              className="bg-gradient-to-r from-[#fc8127] to-[#e67320] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Buscar Oficios</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {!isProLoggedIn && !isClientLoggedIn && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/login')}
                className="text-[#00355f] font-bold text-sm hover:underline px-3 py-2 flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
              <button 
                onClick={() => router.push('/bienvenida')}
                className="bg-[#00355f] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0f4c81] transition-all active:scale-95 flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden xs:inline">Registrarse</span>
              </button>
            </div>
          )}

          <button 
            onClick={() => alert('Soporte de OficiosYa - Escribinos a soporte@oficiosya.com')} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            title="Ayuda / Soporte"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area (Full-Width, Centered) */}
      <main className="mt-28 flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="text-center py-6 max-w-3xl mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00355f]/5 text-[#00355f] text-xs font-extrabold mb-4 border border-[#00355f]/15 shadow-sm tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#fc8127] animate-pulse" />
            Guía Interactiva de OficiosYa
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
            ¿Cómo funciona Oficios<span className="text-[#fc8127]">Ya</span>?
          </h2>
          <p className="text-base md:text-lg text-slate-600 font-medium">
            Conectamos el talento y la necesidad en pasos sencillos. Interactuá con los ejemplos abajo para ver el flujo en tiempo real.
          </p>
        </section>

        {/* Tab Selector Capsule */}
        <div className="relative bg-white/70 backdrop-blur-md border border-slate-200 p-1.5 rounded-3xl shadow-lg max-w-md w-full mb-12 flex z-20">
          <button 
            onClick={() => handleTabChange('client')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'client' 
                ? 'bg-gradient-to-r from-[#fc8127] to-[#e67320] text-white shadow-md shadow-orange-500/20 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            PARA CLIENTES
          </button>
          
          <button 
            onClick={() => handleTabChange('pro')}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'pro' 
                ? 'bg-gradient-to-r from-[#00355f] to-[#0f4c81] text-white shadow-md shadow-blue-900/20 scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            PARA PROFESIONALES
          </button>
        </div>

        {/* CONTENIDO PARA CLIENTES */}
        {activeTab === 'client' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Paso 1 */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-orange-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-orange-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-orange-500/10 transition-colors">01</span>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fc8127] border border-orange-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 shadow-inner transition-all duration-300">
                    <Edit3 className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">1. Publicá tu necesidad</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Describí el arreglo o proyecto que necesitás con claridad y subí fotos para que los profesionales entiendan el trabajo al instante.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 1 Clientes */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Demo interactiva
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#00355f]">Categoría</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-[#fc8127] font-bold text-[10px]">Plomería</span>
                    </div>
                    <div className="font-semibold text-slate-800">"Tengo una filtración bajo la bacha de la cocina"</div>
                    
                    {step1ClientPhoto === 'idle' && (
                      <button 
                        onClick={() => setStep1ClientPhoto('uploading')}
                        className="mt-2 py-2 px-3 border-2 border-dashed border-slate-200 hover:border-orange-450 hover:bg-orange-50/30 rounded-lg flex items-center justify-center gap-1.5 text-slate-500 font-bold transition-all"
                      >
                        <UploadCloud className="w-4 h-4 text-orange-500" />
                        <span>Subir Foto del Arreglo</span>
                      </button>
                    )}

                    {step1ClientPhoto === 'uploading' && (
                      <div className="mt-2 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-2 text-slate-500 font-semibold animate-pulse">
                        <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Procesando imagen...</span>
                        {setTimeout(() => setStep1ClientPhoto('uploaded'), 1200) && null}
                      </div>
                    )}

                    {step1ClientPhoto === 'uploaded' && (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-bold text-[11px]">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <span>¡Foto cargada con éxito!</span>
                        </div>
                        <button 
                          onClick={() => {
                            triggerConfetti();
                            setStep1ClientPhoto('idle');
                          }}
                          className="py-1.5 bg-[#00355f] text-white hover:bg-[#0f4c81] rounded-lg font-bold transition-all text-[11px]"
                        >
                          Publicar Solicitud 🚀
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Paso 2 */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-orange-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-orange-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-orange-500/10 transition-colors">02</span>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fc8127] border border-orange-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 shadow-inner transition-all duration-300">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">2. Recibí presupuestos</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Compará presupuestos detallados enviados por profesionales matriculados y calificados por vecinos reales de la comunidad.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 2 Clientes */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Presupuestos recibidos
                  </div>
                  
                  {step2ClientBudget === null ? (
                    <div className="flex flex-col gap-2 text-xs">
                      {/* Presupuesto 1 */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 hover:border-orange-300 transition-all">
                        <div>
                          <div className="font-extrabold text-[#00355f]">Juan Carlos M.</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-0.5">⭐ 4.9 (24 reseñas)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900">$12.500</div>
                          <button 
                            onClick={() => setStep2ClientBudget(12500)}
                            className="mt-1 px-2.5 py-1 bg-[#fc8127] hover:bg-[#e67320] text-white rounded-md font-bold text-[10px] transition-all"
                          >
                            Aceptar
                          </button>
                        </div>
                      </div>

                      {/* Presupuesto 2 */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 hover:border-orange-300 transition-all">
                        <div>
                          <div className="font-extrabold text-[#00355f] flex items-center gap-1">
                            Carlos G. 
                            <span className="bg-green-100 text-green-700 text-[8px] px-1 rounded font-black uppercase">Recomendado</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-0.5">⭐ 5.0 (48 reseñas)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900">$14.000</div>
                          <button 
                            onClick={() => setStep2ClientBudget(14000)}
                            className="mt-1 px-2.5 py-1 bg-[#fc8127] hover:bg-[#e67320] text-white rounded-md font-bold text-[10px] transition-all"
                          >
                            Aceptar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex flex-col items-center text-center gap-2 text-xs">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                        <Check className="w-5 h-5 font-bold" />
                      </div>
                      <div>
                        <div className="font-extrabold text-green-800">¡Presupuesto aceptado!</div>
                        <div className="text-green-600 font-semibold mt-0.5">Monto de trabajo acordado: ${step2ClientBudget.toLocaleString('es-AR')}</div>
                      </div>
                      <button 
                        onClick={() => setStep2ClientBudget(null)}
                        className="text-[10px] text-green-800 underline hover:text-green-950 font-bold transition-all"
                      >
                        Comparar ofertas de nuevo
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Paso 3 */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-orange-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-orange-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-orange-500/10 transition-colors">03</span>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fc8127] border border-orange-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 shadow-inner transition-all duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">3. Chateá y contratá</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Coordiná visitas, compartí detalles técnicos y confirmá la contratación mediante el chat interno seguro de la app.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 3 Clientes */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Chat interno seguro
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 text-[11px] h-36 justify-between">
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-24 scrollbar-none">
                      <div className="bg-slate-100 text-slate-800 p-2 rounded-lg max-w-[85%] self-start font-medium">
                        Hola, puedo pasar hoy a la tarde a cambiar la grifería.
                      </div>
                      
                      {step3ClientChat !== 'idle' && (
                        <div className="bg-orange-500 text-white p-2 rounded-lg max-w-[85%] self-end font-semibold shadow-sm animate-in fade-in duration-200">
                          ¡Bárbaro! Te espero a partir de las 16hs.
                        </div>
                      )}

                      {step3ClientChat === 'replied' && (
                        <div className="bg-slate-100 text-slate-800 p-2 rounded-lg max-w-[85%] self-start font-medium animate-in fade-in duration-300">
                          Perfecto, ya agendé el horario. 👍
                        </div>
                      )}

                      {step3ClientChat === 'hired' && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-2 rounded-lg text-center font-bold text-[10px] w-full self-center animate-in zoom-in duration-250">
                          🤝 ¡TRABAJO CONTRATADO Y ASEGURADO!
                        </div>
                      )}
                    </div>

                    {step3ClientChat === 'idle' && (
                      <button 
                        onClick={() => {
                          setStep3ClientChat('typing');
                          setTimeout(() => {
                            setStep3ClientChat('replied');
                          }, 1200);
                        }}
                        className="w-full py-1 bg-[#00355f] hover:bg-[#0f4c81] text-white font-bold rounded transition-all"
                      >
                        Responder y coordinar visita
                      </button>
                    )}

                    {step3ClientChat === 'typing' && (
                      <div className="text-center text-slate-400 font-semibold italic text-[10px] flex items-center justify-center gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    )}

                    {step3ClientChat === 'replied' && (
                      <button 
                        onClick={() => {
                          triggerConfetti();
                          setStep3ClientChat('hired');
                        }}
                        className="w-full py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-all text-[10px]"
                      >
                        Confirmar Contratación 📌
                      </button>
                    )}

                    {step3ClientChat === 'hired' && (
                      <button 
                        onClick={() => setStep3ClientChat('idle')}
                        className="w-full py-0.5 text-slate-400 hover:text-slate-600 font-bold transition-all text-[9px]"
                      >
                        Reiniciar simulación
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Paso 4 */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-orange-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-orange-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-orange-500/10 transition-colors">04</span>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#fc8127] border border-orange-100 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 shadow-inner transition-all duration-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">4. Calificá el servicio</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Tu opinión mantiene seguro el ecosistema. Valorá la calidad de atención, puntualidad y prolijidad del profesional para ayudar a otros.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 4 Clientes */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Sistema de Calificaciones
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-3 text-xs">
                    <div className="font-extrabold text-slate-700">¿Cómo calificarías a Carlos G.?</div>
                    
                    {/* Estrellas Interactivas */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => {
                            setStep4ClientRating(star);
                            if (star === 5) triggerConfetti();
                          }}
                          className="transform hover:scale-125 active:scale-95 transition-all text-slate-300 hover:text-yellow-300"
                        >
                          <Star 
                            className={`w-7 h-7 transition-colors duration-150 ${
                              star <= step4ClientRating 
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                                : 'text-slate-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>

                    {step4ClientRating > 0 && (
                      <div className="w-full text-center animate-in zoom-in duration-200">
                        {step4ClientRating === 5 ? (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg text-[#fc8127] font-bold text-[10px]">
                            🏆 ¡Calificado con 5 estrellas! Excelente servicio.
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-slate-600 font-bold text-[10px]">
                            Gracias por tu valoración de {step4ClientRating} estrellas.
                          </div>
                        )}
                        <button 
                          onClick={() => setStep4ClientRating(0)}
                          className="mt-1.5 text-[9px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Cambiar puntuación
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CONTENIDO PARA PROFESIONALES */}
        {activeTab === 'pro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Paso 1 Pro */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-blue-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">01</span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00355f] border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 shadow-inner transition-all duration-300">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">1. Registrate y mostrá tu oficio</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Cargá tus datos, tus rubros principales, fotos de trabajos anteriores y subí tu matrícula o comprobantes para ganar credibilidad.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 1 Profesional */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-[#00355f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#fc8127]" /> Perfil Profesional
                  </div>
                  
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00355f] to-[#0f4c81] text-white font-bold flex items-center justify-center text-sm shadow-md">
                        GS
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-800 flex items-center gap-1">
                          Gabriel Soto
                          {step1ProVerified && (
                            <span className="inline-flex" title="Profesional Verificado">
                              <ShieldCheck className="w-4 h-4 fill-green-150 text-green-700" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">Plomería y Gas - CABA</div>
                      </div>
                    </div>

                    {!step1ProVerified ? (
                      <button 
                        onClick={() => {
                          setStep1ProVerified(true);
                          triggerConfetti();
                        }}
                        className="w-full py-2 bg-gradient-to-r from-blue-900 to-[#00355f] hover:from-blue-850 hover:to-[#0f4c81] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm text-[11px]"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Subir Credencial / Matrícula</span>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 animate-in zoom-in duration-200">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 text-green-800 font-bold text-[10px]">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <span>¡Perfil Validado e Insignia Activada! 🏆</span>
                        </div>
                        <button 
                          onClick={() => setStep1ProVerified(false)}
                          className="text-center text-[9px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Reiniciar validación
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Paso 2 Pro */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-blue-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">02</span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00355f] border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 shadow-inner transition-all duration-300">
                    <Search className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">2. Postulate a solicitudes</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Navegá por el Muro de Trabajos, buscá las solicitudes que estén cerca de tu zona y enviá tus presupuestos a clientes interesados.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 2 Profesional */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-[#00355f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#fc8127]" /> Muro de Trabajos Activos
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">Reparar calefón ORBIS</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">📍 Palermo</span>
                    </div>
                    <p className="text-[10px] text-slate-500">"No enciende el piloto al abrir el agua caliente, tiene buena presión..."</p>
                    
                    {step2ProJobState === 'idle' && (
                      <button 
                        onClick={() => {
                          setStep2ProJobState('sending');
                          setTimeout(() => setStep2ProJobState('applied'), 1200);
                        }}
                        className="mt-1.5 py-1.5 bg-[#fc8127] hover:bg-[#e67320] text-white font-bold rounded-lg text-[10px] transition-all text-center animate-in duration-200"
                      >
                        Presupuestar Servicio por $19.000 🚀
                      </button>
                    )}

                    {step2ProJobState === 'sending' && (
                      <div className="mt-1.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 font-semibold rounded-lg text-[10px] text-center animate-pulse">
                        Enviando presupuesto...
                      </div>
                    )}

                    {step2ProJobState === 'applied' && (
                      <div className="mt-1.5 flex flex-col gap-1.5 animate-in zoom-in duration-205">
                        <div className="bg-green-50 border border-green-200 rounded-lg py-1.5 text-center text-green-700 font-bold text-[10px] flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Propuesta enviada al cliente!</span>
                        </div>
                        <button 
                          onClick={() => setStep2ProJobState('idle')}
                          className="text-center text-[9px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Ver otros trabajos del muro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Paso 3 Pro */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-blue-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">03</span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00355f] border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 shadow-inner transition-all duration-300">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">3. Brindá el servicio</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Acudí a la cita puntualmente, realizá un trabajo de calidad y mantené el orden para ganar valoraciones positivas en tu perfil.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 3 Profesional */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-[#00355f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#fc8127]" /> Gestión del Servicio
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5 text-xs">
                    <div className="font-extrabold text-slate-700">Progreso del Trabajo Activo:</div>
                    
                    <div className="flex flex-col gap-1.5">
                      {[
                        "Verificar funcionamiento e inspección inicial",
                        "Efectuar recambio de diafragma y limpieza",
                        "Confirmar que encienda correctamente y limpiar bacha"
                      ].map((task, idx) => (
                        <label 
                          key={idx}
                          className="flex items-start gap-2 text-[10px] font-medium text-slate-650 cursor-pointer select-none"
                        >
                          <input 
                            type="checkbox"
                            checked={step3ProTasks[idx]}
                            onChange={() => handleToggleProTask(idx)}
                            className="mt-0.5 rounded border-slate-300 text-[#00355f] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={step3ProTasks[idx] ? 'line-through text-slate-400 font-semibold transition-all' : 'transition-all'}>
                            {task}
                          </span>
                        </label>
                      ))}
                    </div>

                    {step3ProTasks.every(t => t) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center text-[#00355f] font-bold text-[10px] animate-in zoom-in duration-200">
                        🛠️ ¡Trabajo completado con excelencia! Notificando cliente...
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Paso 4 Pro */}
            <div className="group relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl hover:border-blue-500/25 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-50/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-tighter group-hover:text-blue-500/10 transition-colors">04</span>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00355f] border border-blue-100 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 shadow-inner transition-all duration-300">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#00355f] transition-colors">4. Cobrá y acumulá reputación</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Registrá el cobro del trabajo. Las opiniones excelentes de tus clientes aumentarán tu posición en el listado para recibir más ofertas.
                </p>
              </div>

              {/* Sandbox Interactivo: Paso 4 Profesional */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-2.5">
                  <div className="text-[11px] font-extrabold text-[#00355f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#fc8127]" /> Cobros y Reputación
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-extrabold text-slate-700">Trabajo: Calefón ORBIS</div>
                        <div className="text-slate-500 font-semibold">Cliente: Laura M.</div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-[#00355f] text-sm">$19.000</span>
                      </div>
                    </div>
                    
                    {!step4ProPaid ? (
                      <button 
                        onClick={() => {
                          setStep4ProPaid(true);
                          triggerConfetti();
                        }}
                        className="py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Confirmar Recepción de Pago</span>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 animate-in zoom-in duration-200">
                        <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded-lg text-center font-bold text-[10px]">
                          💸 ¡Cobro de $19.000 Confirmado con éxito!
                        </div>
                        <div className="bg-yellow-50 border border-yellow-150 p-2 rounded-lg text-slate-700 font-semibold text-[10px]">
                          <span className="font-bold text-yellow-700 block mb-0.5">Reseña de Laura M.: ⭐⭐⭐⭐⭐</span>
                          "Muy prolijo y puntual. Resolvió el problema rápidamente. ¡Muy recomendable!"
                        </div>
                        <button 
                          onClick={() => setStep4ProPaid(false)}
                          className="text-center text-[9px] text-slate-400 hover:text-slate-600 font-semibold"
                        >
                          Reiniciar cobro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Call to Action Final Section */}
        <section className="mt-16 w-full max-w-3xl">
          <div className="bg-gradient-to-r from-[#00355f] to-[#0f4c81] text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
            
            {/* Elemento de brillo decorativo */}
            <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-[#fc8127] opacity-10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10 text-center flex flex-col items-center gap-5">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                ¿Listo para simplificar tus tareas en el hogar?
              </h3>
              
              <p className="text-sm md:text-base text-blue-100 max-w-lg leading-relaxed font-semibold">
                Registrate ahora gratis en OficiosYa. Si necesitás solucionar algo o querés ofrecer tu trabajo, tenemos un lugar para vos.
              </p>
              
              <button 
                onClick={handleBottomCTA}
                className="mt-2 px-8 py-4 bg-[#fc8127] hover:bg-[#e67320] text-white font-extrabold text-base rounded-xl shadow-lg hover:shadow-orange-500/25 active:scale-95 hover:scale-[1.03] transition-all flex items-center justify-center gap-2 group-button cursor-pointer"
              >
                <span>Comenzar ahora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-slate-100 py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-400 font-semibold">
          <p>© {new Date().getFullYear()} OficiosYa. Todos los derechos reservados. Conectando talento local.</p>
        </div>
      </footer>

    </div>
  );
}