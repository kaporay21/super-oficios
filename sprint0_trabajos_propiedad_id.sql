-- Historial de Mi Hogar: permite vincular un trabajo publicado a una
-- propiedad concreta, para que "Historial" en la ficha de la propiedad
-- deje de estar siempre vacío (antes consultaba una columna que ninguna
-- pantalla llenaba).
ALTER TABLE public.trabajos
  ADD COLUMN IF NOT EXISTS propiedad_id UUID REFERENCES public.mi_hogar_propiedades(id) ON DELETE SET NULL;
