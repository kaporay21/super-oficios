-- URGENTE: estas tablas quedaron de una versión anterior/abandonada de este
-- mismo proyecto de Supabase (nombres en inglés -- la app actual usa
-- "perfiles", "clientes", "trabajos", etc. en español) con RLS deshabilitado.
-- Cualquiera con la clave pública (anon key, la misma que usa la web) podía
-- leer TODAS las filas sin loguearse: confirmado en vivo que "users" y
-- "clients" exponían email, teléfono y dirección real de personas.
--
-- Confirmado por grep en src/ y en el historial de migraciones: el código
-- actual de la app NO usa ninguna de estas tablas. Activar RLS sin
-- políticas las deja inaccesibles vía API (para anon Y para authenticated)
-- sin romper nada. Es reversible: si en algún momento hace falta usar
-- alguna, se le agregan políticas puntuales después.
alter table if exists public.users enable row level security;
alter table if exists public.clients enable row level security;
alter table if exists public.contact_events enable row level security;
alter table if exists public.portfolio_photos enable row level security;
alter table if exists public.quotes enable row level security;
alter table if exists public.jobs enable row level security;
alter table if exists public.quote_items enable row level security;
alter table if exists public.profiles enable row level security;
