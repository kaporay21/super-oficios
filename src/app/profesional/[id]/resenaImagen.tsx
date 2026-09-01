import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

/**
 * Genera la tarjeta de una reseña puntual (cliente real, estrellas y
 * comentario reales) para compartir. Mismo patrón que tarjetaImagen.tsx
 * (ImageResponse, misma paleta de marca), pero centrada en una sola
 * reseña en vez del perfil completo.
 */
export async function buildResenaImageResponse({ resena, host }: { resena: any; host: string }) {
  const mascotPath = path.join(process.cwd(), 'public', 'mascot.png');
  const mascotUri = `data:image/png;base64,${fs.readFileSync(mascotPath).toString('base64')}`;

  const nombreProfesional = resena?.profesional?.nombre || 'Profesional en OficiosYa';
  const oficio = resena?.profesional?.oficios?.[0] || '';
  const fotoProfesional: string | undefined = resena?.profesional?.foto_perfil && !String(resena.profesional.foto_perfil).startsWith('data:')
    ? resena.profesional.foto_perfil
    : undefined;
  const nombreCliente = resena?.cliente?.nombre || 'Cliente de OficiosYa';
  const rating = Math.round(Number(resena?.rating_promedio || 0));
  const comentario = resena?.comentario || '¡Excelente trabajo, muy recomendable!';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #00355f 0%, #001f38 62%, #001527 100%)',
          padding: '56px 60px',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={mascotUri} width={40} height={40} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', fontSize: 22, fontWeight: 800 }}>
            <span>Oficios</span>
            <span style={{ color: '#fc8127' }}>Ya</span>
          </div>
        </div>

        {/* Estrellas */}
        <div style={{ display: 'flex', gap: 8, marginTop: 56 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} width={44} height={44} viewBox="0 0 24 24" fill={i <= rating ? '#fc8127' : 'rgba(255,255,255,0.15)'}>
              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7-5.4-4.7 7.1-.6z" />
            </svg>
          ))}
        </div>

        {/* Comentario */}
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            padding: '32px 36px',
            background: 'rgba(255,255,255,0.06)',
            borderLeft: '5px solid #fc8127',
            borderRadius: 14,
            fontSize: 32,
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.92)',
            fontStyle: 'italic',
            flex: 1,
          }}
        >
          &ldquo;{comentario}&rdquo;
        </div>

        {/* Cliente que dejó la reseña */}
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.65)', marginTop: 28 }}>
          — {nombreCliente}
        </div>

        {/* Profesional reseñado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 28,
            marginTop: 28,
          }}
        >
          {fotoProfesional && (
            <img
              src={fotoProfesional}
              width={72}
              height={72}
              style={{ borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.25)', flexShrink: 0 }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{nombreProfesional}</span>
            {oficio && <span style={{ fontSize: 18, color: '#ffd9a8' }}>{oficio}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto', textAlign: 'right' }}>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Contratalo en</span>
            <span style={{ display: 'flex', fontWeight: 700, fontSize: 18 }}>{host}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
