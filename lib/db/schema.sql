create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pink_coin_balance integer not null default 0 check (pink_coin_balance >= 0),
  selected_character_id text,
  created_at timestamptz not null default now()
);
create table if not exists public.characters (
  id text primary key, name text not null, description text, cost integer not null default 0 check (cost >= 0),
  thumbnail_url text, model_url text, is_default boolean not null default false
);
create table if not exists public.user_characters (
  user_id uuid not null references public.profiles(id) on delete cascade,
  character_id text not null references public.characters(id) on delete cascade,
  unlocked_at timestamptz not null default now(), primary key (user_id, character_id)
);
create table if not exists public.pink_coin_packages (
  id text primary key, name text not null, pink_coins integer not null check (pink_coins > 0),
  price_minor integer not null check (price_minor > 0), currency text not null default 'USD',
  dodo_product_id text not null unique, active boolean not null default true
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  package_id text not null references public.pink_coin_packages(id), dodo_payment_id text unique,
  pink_coins integer not null check (pink_coins > 0), status text not null default 'pending', created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.user_characters enable row level security;
alter table public.pink_coin_packages enable row level security;
alter table public.orders enable row level security;
create policy "profiles are readable by owner" on public.profiles for select using (auth.uid() = id);
create policy "characters are public" on public.characters for select using (true);
create policy "packages are public" on public.pink_coin_packages for select using (active = true);
create policy "owned characters are readable" on public.user_characters for select using (auth.uid() = user_id);

create or replace function public.increment_pink_coins(p_user_id uuid, p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
begin update profiles set pink_coin_balance = pink_coin_balance + p_amount where id = p_user_id; end; $$;
create or replace function public.spend_pink_coins(p_user_id uuid, p_amount integer)
returns boolean language plpgsql security definer set search_path = public as $$
begin update profiles set pink_coin_balance = pink_coin_balance - p_amount where id = p_user_id and pink_coin_balance >= p_amount; return found; end; $$;
create or replace function public.unlock_character(p_user_id uuid, p_character_id text)
returns text language plpgsql security definer set search_path = public as $$
declare
  character_cost integer;
begin
  select cost into character_cost from characters where id = p_character_id;
  if not found then return 'unavailable'; end if;
  if exists (select 1 from user_characters where user_id = p_user_id and character_id = p_character_id) then
    return 'owned';
  end if;
  update profiles
    set pink_coin_balance = pink_coin_balance - character_cost
    where id = p_user_id and pink_coin_balance >= character_cost;
  if not found then return 'insufficient'; end if;
  insert into user_characters (user_id, character_id) values (p_user_id, p_character_id);
  return 'unlocked';
end; $$;
create or replace function public.complete_coin_order(
  p_user_id uuid,
  p_package_id text,
  p_payment_id text
)
returns text language plpgsql security definer set search_path = public as $$
declare
  package_coins integer;
begin
  select pink_coins into package_coins
  from pink_coin_packages
  where id = p_package_id and active = true;
  if not found then return 'unavailable'; end if;
  if exists (select 1 from orders where dodo_payment_id = p_payment_id) then
    return 'duplicate';
  end if;
  insert into orders (user_id, package_id, dodo_payment_id, pink_coins, status)
  values (p_user_id, p_package_id, p_payment_id, package_coins, 'completed');
  update profiles
    set pink_coin_balance = pink_coin_balance + package_coins
    where id = p_user_id;
  if not found then raise exception 'Profile unavailable'; end if;
  return 'credited';
end; $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.characters (id, name, description, cost, model_url, is_default)
values
  ('agent', 'THE AGENT', 'The original escape specialist.', 0, null, true),
  ('girl', 'THE RUNNER', 'A new recruit with a fearless stride and a clean getaway record.', 50, '/models/girl.glb', false),
  ('modi', 'MODI', 'A determined operative with one more mission to outrun.', 100, '/models/modi.glb', false)
on conflict (id) do update set name = excluded.name, description = excluded.description, cost = excluded.cost, model_url = excluded.model_url, is_default = excluded.is_default;