-- ============================================================
-- SPRINT 0 — DESBLOQUEO DEL MURO DE SERVICIOS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- Corrige los 4 desajustes entre el código y el esquema que hoy
-- impiden que el flujo publicar → ofertar → comparar → adjudicar
-- funcione de punta a punta.
--
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- No borra datos.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. presupuestos_muro.conversacion_id
--    dbHelper.enviarOfertaMuro() inserta esta columna y hoy no
--    existe → el insert falla y NINGÚN profesional puede ofertar.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.presupuestos_muro
  ADD COLUMN IF NOT EXISTS conversacion_id UUID
  REFERENCES public.conversaciones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_presupuestos_muro_conversacion
  ON public.presupuestos_muro(conversacion_id);


-- ────────────────────────────────────────────────────────────
-- 2. perfiles.rating
--    getPresupuestosMuroByTrabajo() lo pide en el select anidado.
--    Si falta, la query entera falla y el cliente no ve NINGÚN
--    presupuesto en /comparar-presupuestos.
--
--    Arranca en 0 = "sin calificaciones aún". No se inventa un 5.0:
--    lo va a llenar el trigger del punto 7 con reseñas reales.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_resenas INTEGER DEFAULT 0;


-- ────────────────────────────────────────────────────────────
-- 3. notificaciones.referencia_id  UUID → TEXT
--    trabajos.id es BIGINT, así que String(trabajo_id) = "42"
--    revienta contra una columna uuid:
--      "invalid input syntax for type uuid: 42"
--    Afecta a enviarOfertaMuro, editarOfertaMuro, adjudicarTrabajo,
--    descartarOfertaMuro y notifyProfessionalsForJob.
--
--    TEXT porque la columna referencia indistintamente a trabajos
--    (bigint) y a conversaciones (uuid).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.notificaciones
  ALTER COLUMN referencia_id TYPE TEXT USING referencia_id::TEXT;


-- ────────────────────────────────────────────────────────────
-- 4. notificaciones.tipo — agregar 'presupuesto'
--    El código ya emite tipo='presupuesto' en 2 lugares, pero el
--    CHECK original solo admite 4 valores → viola la constraint,
--    la oferta se crea pero el profesional ve "hubo un error"
--    y reintenta.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.notificaciones
  DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;

ALTER TABLE public.notificaciones
  ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('trabajo', 'mensaje', 'sistema', 'alerta', 'presupuesto'));


-- ────────────────────────────────────────────────────────────
-- 5. trabajos.imagenes — fotos de la solicitud
--    El cliente sube hasta 3 fotos en /publicar-trabajo y hoy se
--    descartan (createJob hace `delete dbJob.imagen` porque la
--    columna nunca existió). Para un profesional, ver la foto de
--    la filtración es la diferencia entre presupuestar bien o a ciegas.
--
--    Array de URLs de Supabase Storage (no base64).
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.trabajos
  ADD COLUMN IF NOT EXISTS imagenes TEXT[] DEFAULT '{}';


-- ────────────────────────────────────────────────────────────
-- 5b. Bucket de Storage para las fotos de las solicitudes
--     Sin esto, uploadImageToSupabase() cae a su fallback base64 y
--     terminaríamos guardando imágenes enteras dentro de la fila.
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('trabajos', 'trabajos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Trabajos storage lectura publica" ON storage.objects;
CREATE POLICY "Trabajos storage lectura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trabajos');

DROP POLICY IF EXISTS "Trabajos storage insert autenticado" ON storage.objects;
CREATE POLICY "Trabajos storage insert autenticado"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trabajos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Trabajos storage delete propio" ON storage.objects;
CREATE POLICY "Trabajos storage delete propio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trabajos' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ────────────────────────────────────────────────────────────
-- 6. perfiles.foto_verificada_en — sello "Rostro Verificado" real
--    Hoy el badge se muestra con `pro.fotoPerfil || pro.avatar`,
--    y `avatar` SIEMPRE tiene un fallback a pravatar.cc → todos
--    los profesionales lucen el sello aunque nunca abrieron la
--    cámara. Un sello de confianza falso es peor que ninguno.
--
--    Se setea solo cuando la foto viene de CameraCaptureModal.
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS foto_verificada_en TIMESTAMPTZ;


-- ────────────────────────────────────────────────────────────
-- 7. Rating real desde reseñas — reemplaza el 5.0 hardcodeado
--    Recalcula perfiles.rating y total_resenas cada vez que se
--    inserta, edita o borra una reseña.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalcular_rating_profesional()
RETURNS TRIGGER AS $$
DECLARE
  pro_id UUID;
BEGIN
  pro_id := COALESCE(NEW.professional_id, OLD.professional_id);

  UPDATE public.perfiles p
  SET rating = COALESCE((
        SELECT ROUND(AVG(r.rating)::numeric, 2)
        FROM public.reviews r WHERE r.professional_id = pro_id
      ), 0),
      total_resenas = (
        SELECT COUNT(*) FROM public.reviews r WHERE r.professional_id = pro_id
      )
  WHERE p.id = pro_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalcular_rating ON public.reviews;
CREATE TRIGGER trg_recalcular_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalcular_rating_profesional();

-- Backfill inicial para las reseñas que ya existan
UPDATE public.perfiles p
SET rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r WHERE r.professional_id = p.id
    ), 0),
    total_resenas = (
      SELECT COUNT(*) FROM public.reviews r WHERE r.professional_id = p.id
    );


-- ────────────────────────────────────────────────────────────
-- 8. Índice para el Muro filtrado por zona
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trabajos_zona
  ON public.trabajos(provincia, ciudad);


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT 'presupuestos_muro.conversacion_id' AS col,
--        EXISTS(SELECT 1 FROM information_schema.columns
--               WHERE table_name='presupuestos_muro' AND column_name='conversacion_id') AS ok
-- UNION ALL SELECT 'perfiles.rating',
--        EXISTS(SELECT 1 FROM information_schema.columns
--               WHERE table_name='perfiles' AND column_name='rating')
-- UNION ALL SELECT 'trabajos.imagenes',
--        EXISTS(SELECT 1 FROM information_schema.columns
--               WHERE table_name='trabajos' AND column_name='imagenes')
-- UNION ALL SELECT 'perfiles.foto_verificada_en',
--        EXISTS(SELECT 1 FROM information_schema.columns
--               WHERE table_name='perfiles' AND column_name='foto_verificada_en')
-- UNION ALL SELECT 'referencia_id es TEXT',
--        EXISTS(SELECT 1 FROM information_schema.columns
--               WHERE table_name='notificaciones' AND column_name='referencia_id'
--                 AND data_type='text');
-- ============================================================
