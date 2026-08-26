/**
 * useGeolocalizacion
 *
 * Hook que detecta la ciudad y provincia del usuario de dos formas:
 * 1. `navigator.geolocation` (GPS del navegador) → reverse geocoding via Nominatim (OpenStreetMap)
 * 2. Fallback silencioso por IP via ip-api.com (sin clave, gratis)
 *
 * Retorna:
 * - ciudad, provincia: strings o null mientras carga
 * - loading: true mientras detecta
 * - error: mensaje si no se pudo detectar
 * - detectar(): re-intenta la detección manualmente
 * - rechazado: true si el usuario negó el permiso
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

export interface GeoData {
  ciudad: string | null;
  provincia: string | null;
  lat: number | null;
  lon: number | null;
  loading: boolean;
  error: string | null;
  rechazado: boolean;
  detectar: () => void;
}

// Normaliza nombres de provincia argentina para que coincidan con los de Supabase
const normalizarProvincia = (raw: string): string => {
  const mapa: Record<string, string> = {
    'ciudad autónoma de buenos aires': 'CABA (Ciudad Autónoma de Buenos Aires)',
    'autonomous city of buenos aires': 'CABA (Ciudad Autónoma de Buenos Aires)',
    'caba': 'CABA (Ciudad Autónoma de Buenos Aires)',
    'buenos aires': 'Buenos Aires',
    'córdoba': 'Córdoba',
    'cordoba': 'Córdoba',
    'santa fe': 'Santa Fe',
    'mendoza': 'Mendoza',
    'tucumán': 'Tucumán',
    'tucuman': 'Tucumán',
    'entre ríos': 'Entre Ríos',
    'entre rios': 'Entre Ríos',
    'salta': 'Salta',
    'chaco': 'Chaco',
    'misiones': 'Misiones',
    'corrientes': 'Corrientes',
    'santiago del estero': 'Santiago del Estero',
    'san juan': 'San Juan',
    'jujuy': 'Jujuy',
    'río negro': 'Río Negro',
    'rio negro': 'Río Negro',
    'neuquén': 'Neuquén',
    'neuquen': 'Neuquén',
    'formosa': 'Formosa',
    'chubut': 'Chubut',
    'san luis': 'San Luis',
    'catamarca': 'Catamarca',
    'la rioja': 'La Rioja',
    'la pampa': 'La Pampa',
    'santa cruz': 'Santa Cruz',
    'tierra del fuego': 'Tierra del Fuego',
  };
  return mapa[raw.toLowerCase().trim()] ?? raw;
};

// Reverse geocoding via Nominatim (OpenStreetMap) — gratuito, sin key
async function reverseGeocode(lat: number, lon: number): Promise<{ ciudad: string; provincia: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`,
      { headers: { 'User-Agent': 'SuperOficios/1.0 (contact@superoficios.com)' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const ciudad = addr.city || addr.town || addr.village || addr.county || '';
    const rawProvincia = addr.state || '';
    return { ciudad, provincia: normalizarProvincia(rawProvincia) };
  } catch {
    return null;
  }
}

// Detección por IP como fallback (ip-api.com, gratis hasta 1000 req/min)
async function detectarPorIP(): Promise<{ ciudad: string; provincia: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=city,regionName,lat,lon,status&lang=es');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'success') return null;
    return {
      ciudad: data.city || '',
      provincia: normalizarProvincia(data.regionName || ''),
      lat: data.lat,
      lon: data.lon,
    };
  } catch {
    return null;
  }
}

export function useGeolocalizacion(): GeoData {
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [provincia, setProvincia] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rechazado, setRechazado] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const detectar = useCallback(() => {
    setTrigger(t => t + 1);
    setRechazado(false);
    setError(null);
    setLoading(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      // ── Intentar geolocalización del navegador ──────────────────────
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 6000,
              maximumAge: 5 * 60 * 1000, // Cache de 5 minutos
            });
          });

          if (cancelled) return;

          const { latitude, longitude } = pos.coords;
          setLat(latitude);
          setLon(longitude);

          const resultado = await reverseGeocode(latitude, longitude);
          if (cancelled) return;

          if (resultado) {
            setCiudad(resultado.ciudad);
            setProvincia(resultado.provincia);
            setLoading(false);
            return;
          }
        } catch (geoErr: any) {
          if (cancelled) return;

          if (geoErr?.code === 1) {
            // PERMISSION_DENIED — el usuario rechazó
            setRechazado(true);
            // Continúa con fallback por IP
          }
          // Timeout / unavailable → también fallback
        }
      }

      // ── Fallback por IP ─────────────────────────────────────────────
      if (cancelled) return;
      const ipResult = await detectarPorIP();
      if (cancelled) return;

      if (ipResult) {
        setCiudad(ipResult.ciudad);
        setProvincia(ipResult.provincia);
        setLat(ipResult.lat);
        setLon(ipResult.lon);
      } else {
        setError('No pudimos detectar tu ubicación automáticamente.');
      }

      setLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [trigger]);

  return { ciudad, provincia, lat, lon, loading, error, rechazado, detectar };
}
