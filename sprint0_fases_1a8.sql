-- Fase 2: Presupuestador de Obras -- scoping de presupuestos + calculadoras
ALTER TABLE public.presupuestos ADD COLUMN IF NOT EXISTS profesional_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Presupuestos_select" ON public.presupuestos;
CREATE POLICY "Presupuestos_select" ON public.presupuestos FOR SELECT USING (auth.uid() = profesional_id);
DROP POLICY IF EXISTS "Presupuestos_write" ON public.presupuestos;
CREATE POLICY "Presupuestos_write" ON public.presupuestos FOR ALL USING (auth.uid() = profesional_id) WITH CHECK (auth.uid() = profesional_id);

CREATE TABLE IF NOT EXISTS public.calculadoras_profesional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL UNIQUE REFERENCES public.perfiles(id) ON DELETE CASCADE,
  datos JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.calculadoras_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Calculadoras_all" ON public.calculadoras_profesional FOR ALL USING (auth.uid() = profesional_id) WITH CHECK (auth.uid() = profesional_id);

-- Fase 5: prioridad real de plan en el buscador (ordenar por texto no da
-- Master primero -- alfabético sería Gratis, Master, Pro).
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS plan_prioridad SMALLINT NOT NULL DEFAULT 0;
UPDATE public.perfiles SET plan_prioridad = CASE plan WHEN 'Master' THEN 2 WHEN 'Pro' THEN 1 ELSE 0 END;

-- Fase 7: tiempo de respuesta real para la misión "Respuesta rápida" del
-- Índice de Confianza (antes se leía con select('*') y caía siempre al
-- fallback de 999 porque la columna no existía).
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS tiempo_respuesta_minutos INTEGER;

-- Fase 8: Campañas y Banners del admin -- hoy viven solo en estado local
-- del componente y se pierden al refrescar.
CREATE TABLE IF NOT EXISTS public.campanas_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Campaña',
  categoria TEXT NOT NULL DEFAULT 'Todos',
  beneficio TEXT,
  banner_url TEXT,
  boton_texto TEXT,
  boton_url TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.campanas_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CampanasAdmin_select" ON public.campanas_admin FOR SELECT USING (true);
CREATE POLICY "CampanasAdmin_write" ON public.campanas_admin FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
