import { dbHelper } from '@/lib/supabase';
import { buildTarjetaImageResponse } from '../tarjetaImagen';

export const runtime = 'nodejs';

type Params = { id: string };

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pro = await dbHelper.getUserProfile(id).catch(() => null);
  const url = new URL(request.url);

  return buildTarjetaImageResponse({
    pro,
    host: url.host,
    perfilUrl: `${url.origin}/profesional/${id}`,
  });
}
