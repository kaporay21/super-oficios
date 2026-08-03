-- Script para crear el bucket "avatars" y sus políticas de seguridad en Supabase Storage

-- 1. Crear el bucket "avatars" (público)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Permitir acceso de lectura a cualquier usuario (incluso anónimos)
create policy "Cualquiera puede ver los avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. Permitir a los usuarios autenticados subir archivos al bucket "avatars"
create policy "Usuarios autenticados pueden subir avatars"
on storage.objects for insert
with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
);

-- 4. Permitir a los usuarios actualizar solo sus propios archivos
create policy "Usuarios pueden actualizar sus propios avatars"
on storage.objects for update
using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
);

-- 5. Permitir a los usuarios borrar solo sus propios archivos
create policy "Usuarios pueden borrar sus propios avatars"
on storage.objects for delete
using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
);
