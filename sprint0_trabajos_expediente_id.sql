-- Bugs 1 y 2 (panel cliente): al adjudicar un trabajo del Muro, el cliente
-- terminaba expulsado de /orden-trabajo (pantalla exclusiva de profesionales)
-- y el trabajo nunca generaba Expediente Digital -- adjudicarTrabajo() solo
-- creaba la Orden de Trabajo, no el expediente (a diferencia del otro camino
-- de aceptar presupuesto, el del chat, que sí lo hacía).
--
-- Esta columna permite, dado un trabajo del Muro, encontrar directamente su
-- expediente para mandar al cliente al lugar correcto (incluso si vuelve a
-- entrar a comparar-presupuestos después de haber adjudicado).
ALTER TABLE public.trabajos ADD COLUMN IF NOT EXISTS expediente_id UUID REFERENCES public.expedientes_trabajo(id);
