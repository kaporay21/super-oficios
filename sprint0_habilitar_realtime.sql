-- Hallazgo: ninguna notificación en vivo (toast in-app, punto rojo de la
-- campana en tiempo real) estaba funcionando de punta a punta -- confirmado
-- insertando notificaciones de prueba en vivo contra la app corriendo: ni
-- el toast ni el contador reaccionaban sin recargar la página. El código de
-- NotificationProvider.tsx está bien (se suscribe a postgres_changes sobre
-- `notificaciones` y `mensajes`), pero para que Supabase Realtime emita esos
-- eventos, la tabla tiene que estar agregada a la publicación
-- `supabase_realtime` -- y ninguna migración de todo el repo lo hizo nunca
-- (ni siquiera con el toggle del dashboard, aparentemente).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notificaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mensajes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
  END IF;
END $$;
