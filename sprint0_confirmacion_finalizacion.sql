-- Hoy el profesional marca un trabajo como "Finalizado"/"Con garantía" y
-- eso queda así de una, sin que el cliente confirme nada -- el cliente solo
-- recibe un aviso avisándole que ya está cerrado. Se pidió agregar un paso
-- intermedio: el profesional PIDE el cierre, el cliente lo CONFIRMA (o dice
-- que todavía no está listo), y recién ahí queda finalizado de verdad.
--
-- `estado_solicitado` guarda qué estado pidió el profesional
-- ('finalizado' o 'con_garantia') mientras la orden está en el estado
-- transitorio 'esperando_confirmacion', para poder aplicarlo cuando el
-- cliente confirme.
ALTER TABLE public.ordenes_trabajo
  ADD COLUMN IF NOT EXISTS estado_solicitado TEXT;
