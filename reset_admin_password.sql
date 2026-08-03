-- Ejecuta esto en tu SQL Editor de Supabase
-- Esto forzará el cambio de contraseña para el correo administrador

UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf')) 
WHERE email = 'gonzalohumacata1992@gmail.com';
