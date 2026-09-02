-- Limpieza: reseña de prueba ("TEST vecino") que quedó de una ronda de
-- verificación anterior en este sprint, visible en el perfil público real
-- del profesional de prueba. La API normal no puede borrarla (resenas_inteligentes
-- no tiene política de DELETE, probablemente a propósito para que las
-- reseñas sean permanentes), así que hace falta correr esto directo.
DELETE FROM public.resenas_inteligentes WHERE id = '2c5537ec-9ed0-41a5-8c0c-7b87d15342d5';
