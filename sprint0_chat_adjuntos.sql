-- El cliente pide poder mandar por el chat, además de texto: su ubicación
-- (como un pin de Google Maps) y fotos o un PDF (para mostrar cómo quiere
-- el trabajo, o fotos del problema). La ubicación no necesita storage (es
-- solo lat/lng en el propio mensaje), pero las fotos/PDF sí necesitan un
-- bucket -- lo hacemos PRIVADO y scopeado a los dos participantes de la
-- conversación (ni público, ni por carpeta de usuario como "dni": acá la
-- carpeta natural es la conversación, no la persona).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-adjuntos', 'chat-adjuntos', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- El path se guarda como "{conversacion_id}/{archivo}". Solo puede
-- subir/leer quien sea usuario1 o usuario2 de ESA conversación.
DROP POLICY IF EXISTS "Chat Adjuntos Insert Participante" ON storage.objects;
CREATE POLICY "Chat Adjuntos Insert Participante"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-adjuntos'
  AND EXISTS (
    SELECT 1 FROM public.conversaciones c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.usuario1_id = auth.uid() OR c.usuario2_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Chat Adjuntos Select Participante" ON storage.objects;
CREATE POLICY "Chat Adjuntos Select Participante"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-adjuntos'
  AND EXISTS (
    SELECT 1 FROM public.conversaciones c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.usuario1_id = auth.uid() OR c.usuario2_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Chat Adjuntos Delete Participante" ON storage.objects;
CREATE POLICY "Chat Adjuntos Delete Participante"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-adjuntos'
  AND EXISTS (
    SELECT 1 FROM public.conversaciones c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.usuario1_id = auth.uid() OR c.usuario2_id = auth.uid())
  )
);
