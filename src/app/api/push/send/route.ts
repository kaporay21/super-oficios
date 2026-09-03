import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Cliente con Service Role: corre solo en el servidor y necesita saltarse
// el RLS de push_subscriptions (auth.uid() = user_id) para poder leer las
// suscripciones de CUALQUIER usuario al que haya que avisarle.
// Se crea recién adentro del handler (no acá arriba): createClient() explota
// si la key todavía no está configurada, y eso pasaba ANTES de llegar al
// chequeo de "push no configurado" de más abajo -- rompía la ruta entera
// con 500 en vez de degradar de forma prolija.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

let vapidConfigurado = false;
function asegurarVapid() {
  if (vapidConfigurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contacto@oficiosya.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidConfigurado = true;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.VAPID_PRIVATE_KEY) {
      // Faltan las claves de servidor -- no rompemos al que llama (la
      // notificación in-app ya se creó igual), solo no hay push real.
      return NextResponse.json({ enviados: 0, motivo: 'push no configurado' });
    }
    asegurarVapid();
    const supabaseAdmin = getSupabaseAdmin();

    const { usuario_id, titulo, descripcion, url } = await req.json();
    if (!usuario_id || !titulo) {
      return NextResponse.json({ error: 'Faltan usuario_id o titulo' }, { status: 400 });
    }

    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', usuario_id);

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ enviados: 0 });
    }

    const payload = JSON.stringify({
      title: titulo,
      body: descripcion || '',
      url: url || '/',
    });

    const resultados = await Promise.allSettled(
      subs.map((sub) =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          .catch(async (err) => {
            // 404/410 = la suscripción venció o el usuario desinstaló/revocó
            // el permiso: la borramos para no seguir intentando en vano.
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
            }
            throw err;
          })
      )
    );

    const enviados = resultados.filter((r) => r.status === 'fulfilled').length;
    return NextResponse.json({ enviados, total: subs.length });
  } catch (e: any) {
    console.error('Error en /api/push/send:', e?.message || e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
