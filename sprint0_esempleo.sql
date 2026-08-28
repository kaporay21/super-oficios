-- ============================================================
-- COLUMNA "esempleo" EN trabajos — discriminador real
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- El código de muro-trabajos/page.tsx, comparar-presupuestos/page.tsx
-- y publicar-trabajo/page.tsx ya asumen que existe una columna
-- booleana `esempleo` en `trabajos` para distinguir pedidos de
-- servicio de clientes (esempleo = false) de ofertas de empleo de
-- profesionales (esempleo = true), pero la columna nunca se creó.
--
-- Por eso bolsa-empleo/page.tsx terminó usando una heurística con
-- `tipo`/`salario` que no distingue nada (ambos flujos setean
-- `tipo`), y createJob() borraba el flag `esEmpleo` antes de
-- insertar porque la columna no existía.
--
-- Todos los trabajos existentes quedan con esempleo = false
-- (pedidos de servicio), que es lo correcto: todo lo publicado
-- hasta ahora fue vía publicar-trabajo, no publicar-empleo.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- No borra datos.
-- ============================================================

ALTER TABLE public.trabajos
  ADD COLUMN IF NOT EXISTS esempleo BOOLEAN DEFAULT false;

UPDATE public.trabajos SET esempleo = false WHERE esempleo IS NULL;


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'trabajos'
--   AND column_name = 'esempleo';
-- ============================================================
