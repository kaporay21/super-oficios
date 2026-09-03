-- Continuación de sprint0_URGENTE_cerrar_fuga_tablas_huerfanas.sql: en las
-- capturas del Security Advisor aparecieron 3 tablas CRITICAL más que no
-- había visto la primera vez. Mismo caso: esquema viejo en inglés,
-- "conversations" ya confirmado exponiendo email y teléfono reales sin
-- login, "messages" y "agreements" vacías pero igual de desprotegidas.
-- Confirmado por grep: el código actual no usa ninguna de las tres
-- (la app real usa "conversaciones" y "mensajes", en español).
alter table if exists public.conversations enable row level security;
alter table if exists public.messages enable row level security;
alter table if exists public.agreements enable row level security;
