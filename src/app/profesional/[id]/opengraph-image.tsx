import { headers } from 'next/headers';
import { dbHelper } from '@/lib/supabase';
import { buildTarjetaImageResponse } from './tarjetaImagen';

export const runtime = 'nodejs';
export const alt = 'Perfil profesional en OficiosYa';
// Misma tarjeta (foto, oficio, rating, trabajos y QR reales) que se usa en
// /tarjeta: WhatsApp, Facebook, Twitter y LinkedIn leen la misma etiqueta
// og:image, así que conviene que todos muestren la versión completa en vez
// de una landscape recortada aparte.
export const size = { width: 1080, height: 1350 };
export const contentType = 'image/png';

type Params = { id: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pro = await dbHelper.getUserProfile(id).catch(() => null);

  const headersList = await headers();
  const host = headersList.get('host') || 'oficiosya.com';
  const proto = headersList.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');

  return buildTarjetaImageResponse({
    pro,
    host,
    perfilUrl: `${proto}://${host}/profesional/${id}`,
  });
}
