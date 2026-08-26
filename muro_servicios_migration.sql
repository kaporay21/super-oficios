-- ============================================================
-- MIGRACIÓN: Muro de Servicios + Presupuestos del Muro
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Agregar columnas de estado a la tabla 'trabajos' existente
--    (usa bigint porque 'trabajos' tiene id serial/bigint)
ALTER TABLE public.trabajos
  ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'abierto',
  ADD COLUMN IF NOT EXISTS profesional_adjudicado_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL;

-- 2. Crear tabla de presupuestos del Muro de Servicios
--    trabajo_id es BIGINT porque la tabla 'trabajos' tiene id bigint/serial
CREATE TABLE IF NOT EXISTS public.presupuestos_muro (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajo_id      BIGINT NOT NULL REFERENCES public.trabajos(id) ON DELETE CASCADE,
  profesional_id  UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  monto           NUMERIC NOT NULL,
  descripcion     TEXT NOT NULL,
  tiempo_estimado TEXT,
  materiales_incluidos BOOLEAN DEFAULT FALSE,
  garantia        TEXT DEFAULT 'sin_garantia',
  estado          TEXT DEFAULT 'pendiente',  -- pendiente | aceptado | rechazado
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Un profesional solo puede tener 1 oferta por trabajo (editable)
  UNIQUE(trabajo_id, profesional_id)
);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para updated_at en presupuestos_muro
DROP TRIGGER IF EXISTS set_presupuestos_muro_updated_at ON public.presupuestos_muro;
CREATE TRIGGER set_presupuestos_muro_updated_at
  BEFORE UPDATE ON public.presupuestos_muro
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Habilitar Row Level Security
ALTER TABLE public.presupuestos_muro ENABLE ROW LEVEL SECURITY;

-- 6. RLS: El cliente dueño del trabajo puede ver TODOS los presupuestos de ese trabajo
DROP POLICY IF EXISTS "cliente_ve_sus_presupuestos" ON public.presupuestos_muro;
CREATE POLICY "cliente_ve_sus_presupuestos"
  ON public.presupuestos_muro FOR SELECT
  USING (auth.uid() = cliente_id);

-- 7. RLS: El profesional solo puede ver y gestionar SU propia oferta
DROP POLICY IF EXISTS "profesional_ve_su_oferta" ON public.presupuestos_muro;
CREATE POLICY "profesional_ve_su_oferta"
  ON public.presupuestos_muro FOR SELECT
  USING (auth.uid() = profesional_id);

-- 8. RLS: El profesional puede insertar su propia oferta
DROP POLICY IF EXISTS "profesional_inserta_oferta" ON public.presupuestos_muro;
CREATE POLICY "profesional_inserta_oferta"
  ON public.presupuestos_muro FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- 9. RLS: El profesional puede editar su propia oferta (solo si estado = 'pendiente')
DROP POLICY IF EXISTS "profesional_edita_oferta_pendiente" ON public.presupuestos_muro;
CREATE POLICY "profesional_edita_oferta_pendiente"
  ON public.presupuestos_muro FOR UPDATE
  USING (auth.uid() = profesional_id AND estado = 'pendiente')
  WITH CHECK (auth.uid() = profesional_id);

-- 10. RLS: El cliente puede actualizar estado (para aceptar/rechazar)
DROP POLICY IF EXISTS "cliente_actualiza_estado" ON public.presupuestos_muro;
CREATE POLICY "cliente_actualiza_estado"
  ON public.presupuestos_muro FOR UPDATE
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

-- 11. Índices para performance
CREATE INDEX IF NOT EXISTS idx_presupuestos_muro_trabajo ON public.presupuestos_muro(trabajo_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_muro_profesional ON public.presupuestos_muro(profesional_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_muro_cliente ON public.presupuestos_muro(cliente_id);
CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON public.trabajos(estado);

-- ============================================================
-- FIN DE MIGRACIÓN
-- Verificación: correr esto para confirmar que todo está bien:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'presupuestos_muro';
-- ============================================================
