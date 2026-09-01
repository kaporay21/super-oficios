-- tickets_soporte se creó originalmente para el formulario viejo de /soporte
-- (nombre, email, tipo, mensaje, archivobase64, estado, fecha). El código
-- más nuevo (formulario "Nueva Consulta" en perfil-cliente, y el propio
-- Buzón de Soporte / Centro de Feedback / Denuncias del admin) usa un
-- esquema distinto que nunca se migró: usuario_id, categoria, asunto,
-- codigo_ticket, respuesta_admin, fecha_respuesta.
--
-- Resultado: todo insert nuevo desde perfil-cliente fallaba (columna
-- inexistente) y el admin nunca podía leer NINGÚN ticket -- ni siquiera
-- los viejos -- porque getTodosLosTicketsAdmin() pide relacionar por
-- usuario_id, que no existía, así que la consulta entera fallaba siempre.

ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL;
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS categoria TEXT;
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS asunto TEXT;
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS codigo_ticket TEXT;
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS respuesta_admin TEXT;
ALTER TABLE public.tickets_soporte ADD COLUMN IF NOT EXISTS fecha_respuesta TIMESTAMP WITH TIME ZONE;
