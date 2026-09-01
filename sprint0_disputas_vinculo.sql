-- Vincula un ticket de Soporte a un profesional concreto cuando la queja
-- es sobre alguien (antes era texto libre, el admin no podía saber a quién
-- se refería el reclamo sin preguntar).
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS profesional_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL;

-- La versión del profesional en una disputa (hoy solo se guardaba la del cliente).
ALTER TABLE public.disputas_resolucion ADD COLUMN IF NOT EXISTS descripcion_profesional TEXT;
