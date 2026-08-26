"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = "Tomar Foto de Perfil en Vivo"
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Iniciar la cámara cuando el modal se abre
  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta el acceso a la cámara.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: 'user', // cámara frontal en celulares
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Error al iniciar cámara:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Permiso de cámara denegado. Por favor, permití el acceso a la cámara en tu navegador para continuar.");
      } else {
        setError("No se pudo acceder a la cámara. Asegurate de tener una webcam o cámara conectada.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Detener la cámara al cerrar
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Disparo con cuenta regresiva
  const handleTakeSnapshotWithCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      takeSnapshot();
      setCountdown(null);
    }
  }, [countdown]);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcular recorte centrado para que sea perfectamente cuadrado
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    // Espejar la imagen para que se sienta natural como un espejo
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
      video,
      startX, startY, size, size, // Origen en video
      0, 0, 400, 400            // Destino en canvas
    );

    // Convertir a JPEG comprimido (calidad 0.85 para ser liviana y nítida)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Cabecera */}
        <div className="bg-[#00355f] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#fc8127]" />
            <h3 className="font-extrabold text-base leading-tight">{title}</h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-gray-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Visor */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          
          <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#00355f] shadow-inner bg-gray-900 flex items-center justify-center">
            
            {/* Si ya capturó foto */}
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="w-full h-full object-cover"
              />
            ) : error ? (
              <div className="p-6 text-red-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <p>{error}</p>
                <button
                  onClick={startCamera}
                  className="mt-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* Stream de Video */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Guía visual de rostro */}
                <div className="absolute inset-0 border-[3px] border-dashed border-[#fc8127]/60 rounded-full pointer-events-none animate-pulse" />

                {/* Cuenta regresiva superpuesta */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-7xl font-black animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white text-xs font-bold gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#fc8127]" />
                    Iniciando cámara...
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 max-w-xs font-medium">
            {capturedImage
              ? "¿Te gusta esta foto o querés intentar de nuevo?"
              : "Alineá tu rostro dentro del círculo y presioná el botón para tomar la foto."}
          </p>

          <canvas ref={canvasRef} className="hidden" />

          {/* Acciones de botones */}
          <div className="w-full pt-2 flex flex-col gap-2">
            {!capturedImage ? (
              <button
                onClick={handleTakeSnapshotWithCountdown}
                disabled={loading || !!error || countdown !== null}
                className="w-full bg-[#fc8127] text-white py-3.5 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-lg hover:bg-[#e67320] active:scale-95 disabled:opacity-50 transition-all text-sm"
              >
                <Camera className="w-5 h-5" />
                {countdown !== null ? `Tomando en ${countdown}...` : "Sacar Foto Ahora"}
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleRetake}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tomar otra foto
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-[#00355f] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0f4c81] shadow-md transition-colors text-xs"
                >
                  <Check className="w-4 h-4 text-green-400" />
                  Usar esta foto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer informativo */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            🔒 Tu foto se verifica para garantizar la identidad pública
          </span>
        </div>

      </div>
    </div>
  );
}
