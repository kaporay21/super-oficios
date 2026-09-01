import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

/**
 * Igual que tarjetaImagen.tsx (mismos datos reales: foto, oficio, rating,
 * QR), pero en formato vertical 1080x1920 pensado para compartir como
 * historia de Instagram/WhatsApp/Facebook.
 */
export async function buildTarjetaHistoriaImageResponse({
  pro,
  host,
  perfilUrl,
}: {
  pro: any;
  host: string;
  perfilUrl: string;
}) {
  const mascotPath = path.join(process.cwd(), 'public', 'mascot.png');
  const mascotUri = `data:image/png;base64,${fs.readFileSync(mascotPath).toString('base64')}`;

  let qrSize = 0;
  let qrData: Uint8Array | null = null;
  try {
    const qr = QRCode.create(perfilUrl, { errorCorrectionLevel: 'M' });
    qrSize = qr.modules.size;
    qrData = qr.modules.data;
  } catch {
    // sin QR, sigue con el resto de la tarjeta
  }
  const cellPx = 5;
  const qrPixelSize = qrSize * cellPx;

  const nombre = pro?.name || 'Profesional en OficiosYa';
  const oficio = pro?.oficios?.[0] || pro?.trade || '';
  const zona = [pro?.ciudad, pro?.provincia].filter(Boolean).join(', ');
  const tieneResenas = (pro?.totalResenas || 0) > 0;
  const foto: string | undefined = pro?.avatar && !String(pro.avatar).startsWith('data:')
    ? pro.avatar
    : undefined;
  const bio = pro?.biografia || 'Trabajo con seriedad, puntualidad y garantía en cada tarea.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #00355f 0%, #001f38 55%, #001527 100%)',
          padding: '72px 64px',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}
      >
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={mascotUri} width={52} height={52} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
            <span>Oficios</span>
            <span style={{ color: '#fc8127' }}>Ya</span>
          </div>
        </div>

        {/* Foto */}
        {foto && (
          <img
            src={foto}
            width={340}
            height={340}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '8px solid rgba(255,255,255,0.25)', marginTop: 64 }}
          />
        )}

        {/* Nombre y oficio */}
        <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginTop: 48 }}>{nombre}</div>
        {oficio && (
          <div style={{ display: 'flex', marginTop: 20 }}>
            <span
              style={{
                background: '#fc8127',
                color: '#001527',
                fontSize: 28,
                fontWeight: 700,
                padding: '12px 32px',
                borderRadius: 999,
              }}
            >
              {oficio}
            </span>
          </div>
        )}

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, color: '#ffd9a8', marginTop: 28 }}>
          {tieneResenas ? (
            <>
              <svg width={30} height={30} viewBox="0 0 24 24" fill="#fc8127">
                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7-5.4-4.7 7.1-.6z" />
              </svg>
              <span>{Number(pro.rating).toFixed(1)} ({pro.totalResenas} reseñas)</span>
            </>
          ) : (
            <span>Nuevo en la plataforma</span>
          )}
        </div>
        {zona && <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.65)', marginTop: 12 }}>{zona}</div>}

        {/* Frase */}
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            padding: '28px 36px',
            background: 'rgba(255,255,255,0.06)',
            borderLeft: '5px solid #fc8127',
            borderRadius: 14,
            fontSize: 28,
            color: 'rgba(255,255,255,0.88)',
            fontStyle: 'italic',
            textAlign: 'left',
          }}
        >
          &ldquo;{bio}&rdquo;
        </div>

        {/* Espaciador flexible para empujar el QR al pie */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* QR + link */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {qrData && (
            <div style={{ display: 'flex', background: '#fff', padding: 12, borderRadius: 12 }}>
              <svg width={qrPixelSize} height={qrPixelSize} viewBox={`0 0 ${qrPixelSize} ${qrPixelSize}`}>
                {Array.from({ length: qrSize }).flatMap((_, row) =>
                  Array.from({ length: qrSize }).map((_, col) => {
                    if (!qrData![row * qrSize + col]) return null;
                    return (
                      <rect
                        key={`${row}-${col}`}
                        x={col * cellPx}
                        y={row * cellPx}
                        width={cellPx}
                        height={cellPx}
                        fill="#001527"
                      />
                    );
                  })
                )}
              </svg>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 20, color: 'rgba(255,255,255,0.85)' }}>
            <span>Escaneá el código o entrá a</span>
            <span style={{ display: 'flex', fontWeight: 700, color: '#fff', fontSize: 22 }}>{host}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
