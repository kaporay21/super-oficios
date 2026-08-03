-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase para crear el bucket "comprobantes" y sus políticas

-- 1. Insertar el nuevo bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir a cualquier usuario ver los archivos (porque el bucket es público)
CREATE POLICY "Comprobantes Storage Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'comprobantes' );

-- 3. Política para permitir a usuarios autenticados subir archivos
CREATE POLICY "Comprobantes Storage Authenticated Insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'comprobantes' AND auth.role() = 'authenticated' );

-- 4. Política para permitir a usuarios autenticados borrar sus propios archivos
CREATE POLICY "Comprobantes Storage Authenticated Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'comprobantes' AND auth.role() = 'authenticated' );
