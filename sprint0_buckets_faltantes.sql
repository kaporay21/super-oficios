-- ============================================================
-- BUCKETS DE STORAGE FALTANTES
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--
-- El código llama a uploadImageToSupabase() con los buckets
-- 'banners' (foto de portada en editar-perfil-publico) y
-- 'certificates' (certificados en configuracion-profesional),
-- pero esos buckets nunca se crearon en Supabase Storage.
--
-- Confirmado con una subida de prueba real: 'avatars', 'trabajos'
-- y 'portfolio' existen y funcionan; 'banners' y 'certificates'
-- devuelven "Bucket not found". Mientras tanto la app usa un
-- fallback silencioso a base64 (uploadImageToSupabase lo hace
-- automáticamente), así que no rompe nada, pero pesa mucho más
-- cada fila y nunca queda un archivo real en Storage.
--
-- Mismo patrón que supabase_bucket_setup.sql (bucket "comprobantes").
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

-- 1. Bucket "banners"
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Banners Storage Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

CREATE POLICY "Banners Storage Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'banners' AND auth.role() = 'authenticated' );

CREATE POLICY "Banners Storage Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'banners' AND auth.role() = 'authenticated' );


-- 2. Bucket "certificates"
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Certificates Storage Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'certificates' );

CREATE POLICY "Certificates Storage Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'certificates' AND auth.role() = 'authenticated' );

CREATE POLICY "Certificates Storage Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'certificates' AND auth.role() = 'authenticated' );


-- ============================================================
-- VERIFICACIÓN — correr esto después para confirmar
-- ============================================================
-- SELECT id, name, public FROM storage.buckets
-- WHERE id IN ('banners', 'certificates');
-- ============================================================
