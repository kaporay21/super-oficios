-- Corrección del hallazgo anterior: las constraints
-- expedientes_trabajo_profesional_id_fkey / _cliente_id_fkey YA EXISTÍAN
-- desde el esquema original, pero apuntaban directo a auth.users(id) en vez
-- de public.perfiles(id) -- por eso el intento anterior (con IF NOT EXISTS
-- por nombre) no hizo nada: el nombre ya estaba tomado. PostgREST no puede
-- resolver el embed `perfiles!profesional_id` sin una FK que apunte
-- directamente a public.perfiles. Confirmado sin filas huérfanas contra
-- perfiles, así que re-apuntar es seguro.
ALTER TABLE public.expedientes_trabajo
  DROP CONSTRAINT IF EXISTS expedientes_trabajo_profesional_id_fkey;
ALTER TABLE public.expedientes_trabajo
  ADD CONSTRAINT expedientes_trabajo_profesional_id_fkey
  FOREIGN KEY (profesional_id) REFERENCES public.perfiles(id);

ALTER TABLE public.expedientes_trabajo
  DROP CONSTRAINT IF EXISTS expedientes_trabajo_cliente_id_fkey;
ALTER TABLE public.expedientes_trabajo
  ADD CONSTRAINT expedientes_trabajo_cliente_id_fkey
  FOREIGN KEY (cliente_id) REFERENCES public.perfiles(id);
