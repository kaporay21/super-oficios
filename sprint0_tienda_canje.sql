-- Fase 1 (ronda de crecimiento): infraestructura genérica de tienda de canje
-- de puntos. Sin catálogo fijo -- el admin carga los premios reales desde
-- el panel. El saldo disponible del profesional se calcula como
-- puntos_totales - puntos_canjeados (columna que ya existía en
-- puntos_profesional pero nadie usaba).
CREATE TABLE IF NOT EXISTS public.premios_canje (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  costo_puntos INTEGER NOT NULL,
  imagen_url TEXT,
  stock INTEGER,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.premios_canje ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PremiosCanje_select" ON public.premios_canje FOR SELECT USING (activo = true OR auth.role() = 'authenticated');
CREATE POLICY "PremiosCanje_write" ON public.premios_canje FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.canjes_profesional (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profesional_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  premio_id UUID NOT NULL REFERENCES public.premios_canje(id) ON DELETE CASCADE,
  puntos_gastados INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.canjes_profesional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CanjesProfesional_select" ON public.canjes_profesional FOR SELECT USING (auth.uid() = profesional_id OR auth.role() = 'authenticated');
CREATE POLICY "CanjesProfesional_insert" ON public.canjes_profesional FOR INSERT WITH CHECK (auth.uid() = profesional_id);
CREATE POLICY "CanjesProfesional_update" ON public.canjes_profesional FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
