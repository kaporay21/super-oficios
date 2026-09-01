-- Feature nueva: recordatorio de mensaje sin responder. Dos avisos por
-- conversación estancada -- a las 24hs y a las 72hs -- y no más, sin
-- importar cuánto siga sin responder después. Va al que NO respondió (nudge
-- para que conteste), no al que espera.
ALTER TABLE public.conversaciones ADD COLUMN IF NOT EXISTS recordatorio_1_enviado TIMESTAMPTZ;
ALTER TABLE public.conversaciones ADD COLUMN IF NOT EXISTS recordatorio_2_enviado TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.enviar_recordatorios_mensajes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv RECORD;
  ultimo RECORD;
BEGIN
  -- Primer recordatorio: 24hs sin respuesta
  FOR conv IN
    SELECT * FROM conversaciones
    WHERE ultimo_mensaje_fecha <= now() - interval '24 hours'
      AND recordatorio_1_enviado IS NULL
  LOOP
    SELECT receptor_id INTO ultimo FROM mensajes
    WHERE conversacion_id = conv.id ORDER BY fecha DESC LIMIT 1;

    IF FOUND THEN
      INSERT INTO notificaciones (usuario_id, tipo, titulo, descripcion, referencia_id, leida)
      VALUES (
        ultimo.receptor_id, 'mensaje', '💬 Tenés un mensaje sin responder',
        'Alguien te escribió hace más de 24hs y todavía no le respondiste.',
        conv.id::text, false
      );
    END IF;
    UPDATE conversaciones SET recordatorio_1_enviado = now() WHERE id = conv.id;
  END LOOP;

  -- Segundo y último recordatorio: 72hs sin respuesta
  FOR conv IN
    SELECT * FROM conversaciones
    WHERE ultimo_mensaje_fecha <= now() - interval '72 hours'
      AND recordatorio_1_enviado IS NOT NULL
      AND recordatorio_2_enviado IS NULL
  LOOP
    SELECT receptor_id INTO ultimo FROM mensajes
    WHERE conversacion_id = conv.id ORDER BY fecha DESC LIMIT 1;

    IF FOUND THEN
      INSERT INTO notificaciones (usuario_id, tipo, titulo, descripcion, referencia_id, leida)
      VALUES (
        ultimo.receptor_id, 'mensaje', '💬 Todavía tenés un mensaje sin responder',
        'Van más de 3 días sin que respondas este mensaje.',
        conv.id::text, false
      );
    END IF;
    UPDATE conversaciones SET recordatorio_2_enviado = now() WHERE id = conv.id;
  END LOOP;
END;
$$;

-- pg_cron viene disponible en Supabase; si este CREATE EXTENSION falla por
-- permisos, activalo desde el dashboard: Database > Extensions > pg_cron.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Corre cada hora; el filtro por fecha ">= X horas" hace que sea inofensivo
-- si el cron se atrasa o se cae una corrida -- lo agarra en la siguiente.
SELECT cron.schedule('recordatorios-mensajes', '0 * * * *', 'SELECT public.enviar_recordatorios_mensajes();');
