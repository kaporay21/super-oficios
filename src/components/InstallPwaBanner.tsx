"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, Check } from 'lucide-react';
import Logo from '@/components/Logo';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Si ya está ejecutándose como PWA standalone, no mostrar banner
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Verificar si el usuario descartó el aviso en esta sesión
    if (typeof window !== 'undefined' && sessionStorage.getItem('pwa_banner_dismissed') === 'true') {
      return;
    }

    // Listener para Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para app instalada
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowAndroidBanner(false);
      setShowIosBanner(false);
    });

    // Detectar iOS / Safari (iPhone, iPad)
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

    if (isIos && isSafari && !installed) {
      // Mostrar banner de iOS después de 4 segundos
      const timer = setTimeout(() => {
        setShowIosBanner(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowAndroidBanner(false);
  };

  const handleDismiss = () => {
    setShowAndroidBanner(false);
    setShowIosBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (installed) return null;
  if (!showAndroidBanner && !showIosBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9995] w-[94%] max-w-md animate-in slide-in-from-bottom-6 duration-400">
      
      {/* Banner para Android / Chrome / Edge */}
      {showAndroidBanner && (
        <div className="bg-[#00355f] text-white p-4 rounded-3xl shadow-2xl border border-white/20 flex flex-col gap-3 relative overflow-hidden">
          
          {/* Fondo sutil decorativo */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#fc8127]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/20">
                <img src="/mascot.png" alt="Mascota OficiosYa" className="w-full h-full object-contain" />
              </div>

              <div>
                <h4 className="font-extrabold text-[#fc8127] text-sm flex items-center gap-1">
                  <span className="text-white">Instalá</span> Oficios<span className="text-[#fc8127]">Ya</span>
                </h4>
                <p className="text-xs text-blue-100 font-medium leading-tight mt-0.5">
                  Acceso directo y notificaciones al instante en tu celular.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-[#fc8127] hover:bg-[#e67320] text-white py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Instalar App
            </button>
          </div>
        </div>
      )}


      {/* Banner explicativo para iPhone / Safari (iOS) */}
      {showIosBanner && !showAndroidBanner && (
        <div className="bg-[#00355f] text-white p-4 rounded-3xl shadow-2xl border border-white/20 flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fc8127] text-white flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  Instalá Oficios<span className="text-[#fc8127]">Ya</span> en tu iPhone
                </h4>
                <p className="text-[11px] text-blue-100">Seguí estos 2 pasos sencillos:</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 space-y-2 text-xs text-blue-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white font-bold">1</div>
              <p>Tocá el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#fc8127] ml-1" /> abajo en Safari.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white font-bold">2</div>
              <p>Seleccioná <strong>"Agregar a inicio"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#fc8127] ml-1" />.</p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-[#fc8127] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#e67320] transition-colors"
          >
            Entendido
          </button>
        </div>
      )}

    </div>
  );
}
