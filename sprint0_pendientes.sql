-- ============================================================
-- SPRINT 0 — PENDIENTES
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- Complemento de sprint0_desbloqueo.sql. Cubre los datos del
-- registro de profesional que hoy se piden en el formulario y
-- se descartan silenciosamente.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- No borra datos.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. perfiles: datos del registro que hoy se pierden
--    registro-profesional/page.tsx pide apellido, fecha de
--    nacimiento, país y experiencia, y los manda en `extraData`.
--    registerProfesional() nunca los escribía: el único uso del
--    apellido era concatenarlo dentro de `nombre`.
--
--    `experiencia` ya existía en la tabla; las otras tres no.
--
--    Todas nullable: los perfiles ya registrados quedan en NULL
--    y la UI debe tratarlos como "sin cargar", no inventar valores.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS apellido TEXT,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
  ADD COLUMN IF NOT EXISTS pais TEXT,
  ADD COLUMN IF NOT EXISTS experiencia TEXT;


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'perfiles'
--   AND column_name IN ('apellido', 'fecha_nacimiento', 'pais', 'experiencia')
-- ORDER BY column_name;
-- ============================================================
