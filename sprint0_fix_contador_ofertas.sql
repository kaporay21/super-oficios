-- Bug: el contador "N ofertas" que ve un profesional en cada tarjeta del Muro
-- siempre daba 0 o 1 -- las políticas RLS de presupuestos_muro solo dejan ver
-- SELECT filas propias (auth.uid() = cliente_id OR auth.uid() = profesional_id),
-- así que un profesional nunca podía contar las ofertas de sus competidores.
-- Esta función cuenta sin exponer ninguna columna de la oferta ajena (precio,
-- mensaje, etc.) -- solo un número -- así no hace falta abrir el RLS de la
-- tabla entera y exponer el precio de la competencia.
CREATE OR REPLACE FUNCTION public.contar_ofertas_pendientes_trabajo(p_trabajo_id BIGINT)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.presupuestos_muro
  WHERE trabajo_id = p_trabajo_id AND estado = 'pendiente';
$$;

GRANT EXECUTE ON FUNCTION public.contar_ofertas_pendientes_trabajo(BIGINT) TO authenticated;
