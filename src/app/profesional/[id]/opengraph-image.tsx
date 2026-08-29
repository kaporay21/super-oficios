import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import { dbHelper } from '@/lib/supabase';

export const runtime = 'nodejs';
export const alt = 'Perfil profesional en OficiosYa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Params = { id: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pro = await dbHelper.getUserProfile(id).catch(() => null);

  const mascotPath = path.join(process.cwd(), 'public', 'mascot.png');
  const mascotUri = `data:image/png;base64,${fs.readFileSync(mascotPath).toString('base64')}`;

  const nombre = pro?.name || 'Profesional en OficiosYa';
  const oficio = pro?.oficios?.[0] || pro?.trade || '';
  const zona = [pro?.ciudad, pro?.provincia].filter(Boolean).join(', ');
  const tieneResenas = (pro?.totalResenas || 0) > 0;
  const foto: string | undefined = pro?.avatar && !String(pro.avatar).startsWith('data:')
    ? pro.avatar
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #00355f 0%, #001f38 65%, #001527 100%)',
          padding: '56px 64px',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={mascotUri} width={56} height={56} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
            <span>Oficios</span>
            <span style={{ color: '#fc8127' }}>Ya</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginTop: 'auto', marginBottom: 'auto' }}>
          {foto && (
            <img
              src={foto}
              width={220}
              height={220}
              style={{ borderRadius: '50%', objectFit: 'cover', border: '6px solid rgba(255,255,255,0.2)' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>{nombre}</div>
            {oficio && (
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    background: '#fc8127',
                    color: '#001527',
                    fontSize: 22,
                    fontWeight: 700,
                    padding: '8px 22px',
                    borderRadius: 999,
                  }}
                >
                  {oficio}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: 'rgba(255,255,255,0.85)' }}>
              {tieneResenas ? (
                <>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="#fc8127">
                    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7-5.4-4.7 7.1-.6z" />
                  </svg>
                  <span>{Number(pro.rating).toFixed(1)} ({pro.totalResenas} reseñas)</span>
                </>
              ) : (
                <span>Nuevo en la plataforma</span>
              )}
              {zona && <span style={{ display: 'flex' }}>· {zona}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
          Pedí tu presupuesto gratis en OficiosYa
        </div>
      </div>
    ),
    size
  );
}
