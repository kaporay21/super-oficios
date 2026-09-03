-- Notificaciones push reales (Web Push): guarda la suscripción que el
-- navegador genera con pushManager.subscribe() para poder mandarle un
-- push al usuario desde el servidor aunque tenga la app cerrada.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.perfiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Push Subscriptions Select Propia" on public.push_subscriptions;
drop policy if exists "Push Subscriptions Insert Propia" on public.push_subscriptions;
drop policy if exists "Push Subscriptions Update Propia" on public.push_subscriptions;
drop policy if exists "Push Subscriptions Delete Propia" on public.push_subscriptions;

-- El cliente solo puede ver, crear, actualizar (upsert por endpoint) o
-- borrar sus PROPIAS suscripciones. El envío real del push lo hace la
-- ruta /api/push/send con la Service Role Key desde el servidor, que
-- no pasa por estas políticas.
create policy "Push Subscriptions Select Propia" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "Push Subscriptions Insert Propia" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Push Subscriptions Update Propia" on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Push Subscriptions Delete Propia" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
