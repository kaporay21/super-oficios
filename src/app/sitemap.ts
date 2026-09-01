import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://oficiosya.com';

const RUTAS_ESTATICAS = [
  '', '/buscar-profesionales', '/planes', '/como-funciona',
  '/registro-profesional', '/registro-cliente', '/login',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = RUTAS_ESTATICAS.map((ruta) => ({
    url: `${BASE_URL}${ruta}`,
    lastModified: new Date(),
  }));

  const { data: profesionales } = await supabase
    .from('perfiles')
    .select('id, created_at')
    .eq('rol', 'profesional')
    .eq('estado_cuenta', 'Activo');

  const dinamicas: MetadataRoute.Sitemap = (profesionales || []).map((p) => ({
    url: `${BASE_URL}/profesional/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
  }));

  return [...estaticas, ...dinamicas];
}
