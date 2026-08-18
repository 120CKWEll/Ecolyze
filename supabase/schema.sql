-- Run this file once in Supabase Dashboard > SQL Editor before starting the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  score integer not null default 0 check (score >= 0),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 🔧 ปรับตาราง profiles ที่สร้างจาก schema รุ่นเก่าให้ตรงกับเวอร์ชันปัจจุบันของแอป
-- 1) schema เก่าอาจมีคอลัมน์ email NOT NULL (แอปอ่านอีเมลจาก auth.users ไม่ใช้คอลัมน์นี้แล้ว)
--    ทำให้เป็น NULL ได้ ไม่เช่นนั้น trigger สร้างโปรไฟล์ / record_scan จะแทรกข้อมูลล้มเหลว
-- 2) schema เก่าอาจขาดคอลัมน์ score, role, created_at, updated_at -> เพิ่มให้อัตโนมัติ
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles alter column email drop not null;
  end if;

  alter table public.profiles add column if not exists display_name text not null default 'ผู้ใช้งาน';
  alter table public.profiles add column if not exists score integer not null default 0 check (score >= 0);
  alter table public.profiles add column if not exists role text not null default 'user' check (role in ('user', 'admin'));
  alter table public.profiles add column if not exists created_at timestamptz not null default now();
  alter table public.profiles add column if not exists updated_at timestamptz not null default now();
end $$;

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_name text not null,
  waste_type text not null check (waste_type in ('ทั่วไป', 'รีไซเคิล', 'เปียก', 'อันตราย')),
  confidence numeric(5,2) not null check (confidence >= 0 and confidence <= 100),
  points_earned integer not null default 0 check (points_earned >= 0),
  created_at timestamptz not null default now()
);

create index if not exists scan_history_user_created_at_idx
  on public.scan_history (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ไม่ใช้ service role key: record_scan หา user_id จาก auth.uid() (JWT ของผู้ใช้ที่เรียก)
-- และคำนวณคะแนนจาก waste_type เอง เพื่อกันผู้ใช้ส่งคะแนนเองตามอำเภอใจ
drop function if exists public.record_scan(uuid, text, text, numeric, integer);
create or replace function public.record_scan(
  p_object_name text,
  p_waste_type text,
  p_confidence numeric
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  new_history_id uuid;
  v_points integer;
begin
  -- ถ้าบัญชีถูกสร้างก่อนมี trigger สร้างโปรไฟล์ (หรือ profile ถูกลบ) ให้สร้างให้อัตโนมัติ
  -- เพื่อป้องกัน error "Profile not found" เมื่อบัญชีเก่ามาสแกนครั้งแรก
  insert into public.profiles (id, display_name)
  select u.id, coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do nothing;

  v_points := case p_waste_type
    when 'ทั่วไป' then 2
    when 'เปียก' then 2
    when 'รีไซเคิล' then 5
    when 'อันตราย' then 10
    else 0
  end;

  insert into public.scan_history (user_id, object_name, waste_type, confidence, points_earned)
  values (auth.uid(), p_object_name, p_waste_type, p_confidence, v_points)
  returning id into new_history_id;

  update public.profiles
  set score = score + v_points, updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Profile not found for user %', auth.uid();
  end if;

  return new_history_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.scan_history enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users can read their own scans" on public.scan_history;
create policy "Users can read their own scans"
  on public.scan_history for select to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select on public.profiles, public.scan_history to authenticated;
revoke all on function public.record_scan(text, text, numeric) from public, anon;
grant execute on function public.record_scan(text, text, numeric) to authenticated, service_role;
