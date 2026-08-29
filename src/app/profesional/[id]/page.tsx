import type { Metadata } from 'next';
import { dbHelper } from '@/lib/supabase';
import ProfesionalCliente from './ProfesionalCliente';

type Params = { id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id } = await params;
  const pro = await dbHelper.getUserProfile(id).catch(() => null);

  if (!pro) {
    return { title: 'Profesional no encontrado | OficiosYa' };
  }

  const oficio = pro.oficios?.[0] || pro.trade || 'Profesional';
  const zona = [pro.ciudad, pro.provincia].filter(Boolean).join(', ');
  const titulo = `${pro.name} — ${oficio}${zona ? ` en ${zona}` : ''} | OficiosYa`;
  const descripcion = pro.totalResenas > 0
    ? `⭐ ${Number(pro.rating).toFixed(1)} (${pro.totalResenas} reseñas) · Contactalo por OficiosYa y pedí tu presupuesto sin cargo.`
    : `Profesional verificado en OficiosYa. Contactalo y pedí tu presupuesto sin cargo.`;

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
    },
  };
}

export default function ProfesionalPage() {
  return <ProfesionalCliente />;
}
