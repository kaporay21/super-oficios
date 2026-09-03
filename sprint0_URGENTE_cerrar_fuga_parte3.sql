-- Verifiqué en vivo después de correr las dos migraciones anteriores: 10 de
-- las 11 tablas ya quedaron bloqueadas (RLS activo, sin políticas = sin
-- acceso), pero "users" TODAVÍA devolvía el email y teléfono reales.
--
-- Motivo: activar RLS no borra políticas que ya existieran de antes -- las
-- "despierta". "users" tenía una política vieja tipo "permitir todo" que
-- estaba dormida mientras RLS estaba apagado, y se activó apenas prendimos
-- RLS en la migración anterior. Es el mismo problema que ya habíamos visto
-- con "perfiles" hace unas rondas.
--
-- Esto borra CUALQUIER política que haya quedado en las 11 tablas
-- huérfanas (sea cual sea su nombre) y no crea ninguna nueva: con RLS
-- activo y cero políticas, quedan completamente inaccesibles vía API.
DO $$
DECLARE
  tabla text;
  pol RECORD;
BEGIN
  FOREACH tabla IN ARRAY ARRAY[
    'users', 'clients', 'contact_events', 'portfolio_photos', 'quotes',
    'jobs', 'quote_items', 'profiles', 'conversations', 'messages', 'agreements'
  ]
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tabla
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tabla);
    END LOOP;
  END LOOP;
END $$;

-- Verificación: esto debería devolver 0 filas para las 11 tablas.
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'clients', 'contact_events', 'portfolio_photos', 'quotes',
    'jobs', 'quote_items', 'profiles', 'conversations', 'messages', 'agreements'
  );
