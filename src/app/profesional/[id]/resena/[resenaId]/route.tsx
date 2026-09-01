import { dbHelper } from '@/lib/supabase';
import { buildResenaImageResponse } from '../../resenaImagen';

export const runtime = 'nodejs';

type Params = { id: string; resenaId: string };

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { resenaId } = await params;
  const resena = await dbHelper.getResenaParaTarjeta(resenaId).catch(() => null);
  const url = new URL(request.url);

  return buildResenaImageResponse({ resena, host: url.host });
}
