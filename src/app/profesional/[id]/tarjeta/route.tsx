import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { dbHelper } from '@/lib/supabase';

export const runtime = 'nodejs';

type Params = { id: string };

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pro = await dbHelper.getUserProfile(id).catch(() => null);

  const mascotPath = path.join(process.cwd(), 'public', 'mascot.png');
  const mascotUri = `data:image/png;base64,${fs.readFileSync(mascotPath).toString('base64')}`;

  const url = new URL(request.url);
  const perfilUrl = `${url.origin}/profesional/${id}`;

  // Tolerante: si algo del QR falla, la tarjeta se genera igual sin el código.
  let qrSize = 0;
  let qrData: Uint8Array | null = null;
  try {
    const qr = QRCode.create(perfilUrl, { errorCorrectionLevel: 'M' });
    qrSize = qr.modules.size;
    qrData = qr.modules.data;
  } catch {
    // sin QR, sigue con el resto de la tarjeta
  }
  const cellPx = 4;
  const qrPixelSize = qrSize * cellPx;

  const nombre = pro?.name || 'Profesional en OficiosYa';
  const oficio = pro?.oficios?.[0] || pro?.trade || '';
  const zona = [pro?.ciudad, pro?.provincia].filter(Boolean).join(', ');
  const tieneResenas = (pro?.totalResenas || 0) > 0;
  const foto: string | undefined = pro?.avatar && !String(pro.avatar).startsWith('data:')
    ? pro.avatar
    : undefined;
  const bio = pro?.biografia || 'Trabajo con seriedad, puntualidad y garantía en cada tarea.';

  // Hasta 3 fotos reales de trabajos, si el profesional cargó portafolio.
  const fotosTrabajos: string[] = Array.isArray(pro?.portafolio)
    ? pro.portafolio.slice(0, 3).map((f: any) => (typeof f === 'string' ? f : f?.url)).filter(Boolean)
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #00355f 0%, #001f38 62%, #001527 100%)',
          padding: '52px 56px',
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

        {/* Encabezado: foto + datos, uno al lado del otro para aprovechar el ancho */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 40 }}>
          {foto && (
            <img
              src={foto}
              width={210}
              height={210}
              style={{ borderRadius: '50%', objectFit: 'cover', border: '6px solid rgba(255,255,255,0.25)', flexShrink: 0 }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, lineHeight: 1.08 }}>{nombre}</div>
            {oficio && (
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    background: '#fc8127',
                    color: '#001527',
                    fontSize: 21,
                    fontWeight: 700,
                    padding: '8px 22px',
                    borderRadius: 999,
                  }}
                >
                  {oficio}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, color: '#ffd9a8' }}>
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
            </div>
            {zona && <div style={{ display: 'flex', fontSize: 19, color: 'rgba(255,255,255,0.65)' }}>{zona}</div>}
          </div>
        </div>

        {/* Frase, en un panel propio para no flotar en el vacío */}
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            padding: '22px 28px',
            background: 'rgba(255,255,255,0.06)',
            borderLeft: '4px solid #fc8127',
            borderRadius: 10,
            fontSize: 21,
            color: 'rgba(255,255,255,0.88)',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{bio}&rdquo;
        </div>

        {/* Trabajos realizados: ocupa el espacio central con fotos reales */}
        {fotosTrabajos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 36, gap: 14 }}>
            <div style={{ display: 'flex', fontSize: 16, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              Trabajos realizados
            </div>
            <div style={{ display: 'flex', height: 560, gap: 14 }}>
              {fotosTrabajos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  style={{
                    display: 'flex',
                    flex: 1,
                    height: 560,
                    objectFit: 'cover',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Sin fotos de portafolio: llenamos el espacio con los sellos
          // reales que sí tenga (nunca datos inventados).
          (() => {
            const sellos = [
              pro?.fotoVerificada && { label: 'Rostro verificado', desc: 'Foto tomada con cámara en vivo' },
              pro?.verificacion === 'Verificado' && { label: 'DNI verificado', desc: 'Identidad validada por OficiosYa' },
              pro?.matriculadoVerificado && { label: 'Matriculado', desc: 'Certificación validada' },
            ].filter(Boolean) as { label: string; desc: string }[];

            if (sellos.length === 0) return <div style={{ display: 'flex', flex: 1 }} />;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: 36, gap: 18 }}>
                {sellos.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(16,185,129,0.18)',
                        border: '1px solid rgba(16,185,129,0.4)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <path d="M4 12.5L9.5 18L20 6" stroke="#34d399" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{s.label}</span>
                      <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}

        {/* QR + link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            paddingTop: 24,
            marginTop: 24,
          }}
        >
          {qrData && (
            <div style={{ display: 'flex', background: '#fff', padding: 8, borderRadius: 8 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
            <span>Escaneá el código o entrá a</span>
            <span style={{ display: 'flex', fontWeight: 700, color: '#fff', fontSize: 18 }}>{url.host}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
