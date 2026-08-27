-- ============================================================
-- POSTULACIONES — columnas faltantes
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- La tabla `postulaciones` (bolsa de empleo) no tiene estas
-- columnas, pero el código de bolsa-empleo/page.tsx y
-- candidatos-empleo/page.tsx ya las lee y escribe. El helper
-- `insertarTolerante` en supabase.ts hace que la postulación se
-- guarde igual descartando estos campos, pero se pierde esa
-- información hasta correr esta migración.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- No borra datos.
-- ============================================================

ALTER TABLE public.postulaciones
  ADD COLUMN IF NOT EXISTS oficio TEXT,
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS provincia TEXT,
  ADD COLUMN IF NOT EXISTS candidatoverificado BOOLEAN DEFAULT false;


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'postulaciones'
--   AND column_name IN ('oficio', 'tipo', 'provincia', 'candidatoverificado')
-- ORDER BY column_name;
-- ============================================================
