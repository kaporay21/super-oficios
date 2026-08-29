-- ============================================================
-- COLUMNA "portafolio" EN perfiles
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- editar-perfil-publico/page.tsx ya permite subir hasta N fotos
-- de trabajos realizados (bucket "portfolio") y dbHelper.getUserProfile
-- ya las lee (`data.portafolio || []`), pero la columna nunca se
-- creó — por eso ningún profesional pudo guardar su portafolio
-- hasta ahora, aunque la pantalla de edición mostraba las fotos
-- recién subidas (solo en memoria, se perdían al recargar).
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- No borra datos.
-- ============================================================

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS portafolio JSONB DEFAULT '[]'::jsonb;


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'perfiles'
--   AND column_name = 'portafolio';
-- ============================================================
