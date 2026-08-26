-- =====================================================================
-- ♻️ ECOLYZE (RECYCLESMART) - FULL DATABASE SCHEMA & MIGRATION SCRIPT
-- รองรับโครงสร้างตารางของ Supabase (profiles, rewards, trash_bins, issue_reports, scan_history)
-- =====================================================================

-- 1. ตาราง Profiles (ผู้ใช้งาน)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'ผู้ใช้งาน',
  score integer not null default 0 check (score >= 0),
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ปรับคอลัมน์ profiles ให้เข้ากันได้
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles alter column email drop not null;
  end if;

  alter table public.profiles add column if not exists display_name text not null default 'ผู้ใช้งาน';
  alter table public.profiles add column if not exists score integer not null default 0;
  alter table public.profiles add column if not exists role text not null default 'user';
  alter table public.profiles add column if not exists created_at timestamptz not null default now();
  alter table public.profiles add column if not exists updated_at timestamptz not null default now();
end $$;

-- 2. ตาราง Scan History (ประวัติการสแกน)
create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_name text not null,
  waste_type text not null,
  confidence numeric(5,2) not null default 85 check (confidence >= 0 and confidence <= 100),
  points_earned integer not null default 0 check (points_earned >= 0),
  created_at timestamptz not null default now()
);

create index if not exists scan_history_user_created_at_idx
  on public.scan_history (user_id, created_at desc);

-- 3. ตาราง Rewards (ของรางวัล) - ปรับคอลัมน์ให้ตรงกับ schema เดิม
do $$
begin
  -- ถ้ายังไม่มีตาราง rewards ให้สร้าง
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'rewards') then
    create table public.rewards (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      image_url text default '',
      points_required integer not null default 200,
      stock_quantity integer default 100,
      is_active boolean not null default true,
      created_at timestamptz not null default now()
    );
  end if;

  -- เพิ่มคอลัมน์เสริม (ถ้ายังไม่มี) เพื่อให้ Frontend แสดงไอคอน/สีได้ยืดหยุ่น
  alter table public.rewards add column if not exists points_required integer not null default 200;
  alter table public.rewards add column if not exists icon text default '🎁';
  alter table public.rewards add column if not exists bg_color text default 'bg-emerald-50';
  alter table public.rewards add column if not exists text_color text default 'text-emerald-700';
  alter table public.rewards add column if not exists is_active boolean default true;
end $$;

-- เพิ่มข้อมูลของรางวัลตัวอย่าง
insert into public.rewards (name, points_required, icon, bg_color, text_color, is_active)
values
  ('คูปองส่วนลดศูนย์อาหาร Complex 20 บาท', 200, '🍜', 'bg-orange-50', 'text-orange-600', true),
  ('ส่วนลดร้านกาแฟสมุด 10 บาท', 150, '☕', 'bg-amber-50', 'text-amber-700', true),
  ('กระเป๋าผ้ารักษ์โลก RecycleSmart', 500, '🛍️', 'bg-emerald-50', 'text-emerald-700', true),
  ('กระติกน้ำสแตนเลส (KKU Zero Waste)', 1000, '💧', 'bg-blue-50', 'text-blue-700', true)
on conflict do nothing;

-- 4. ตารางจุดทิ้งขยะ (รองรับทั้ง trash_bins และ waste_locations)
create table if not exists public.waste_locations (
  id bigint primary key generated always as identity,
  name text not null,
  lat numeric(9,6) not null,
  lng numeric(9,6) not null,
  types text[] not null default '{}',
  description text default '',
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

insert into public.waste_locations (name, lat, lng, types, description, status)
values
  ('ศูนย์อาหารคอมเพล็กซ์', 16.4744, 102.8231, array['รีไซเคิล', 'ขยะเปียก', 'ทั่วไป'], 'จุดคัดแยกขยะหลัก บริเวณทางเข้าและในโรงอาหาร', 'Active'),
  ('คณะวิศวกรรมศาสตร์', 16.4755, 102.8195, array['รีไซเคิล', 'E-Waste'], 'จุดรับขยะอิเล็กทรอนิกส์และรีไซเคิล ใกล้ตึก EN', 'Active'),
  ('หอสมุดกลาง (ศูนย์สื่อการเรียนรู้)', 16.4715, 102.8235, array['รีไซเคิล', 'อันตราย'], 'จุดรับถ่านไฟฉาย ขยะอิเล็กทรอนิกส์ และกระดาษ', 'Maintenance'),
  ('คณะวิทยาศาสตร์ (SC06)', 16.4735, 102.8205, array['รีไซเคิล', 'ทั่วไป'], 'ถังขยะแยกประเภทบริเวณใต้อาคาร', 'Active'),
  ('กองจัดการสาธารณูปโภคพลังงานและสิ่งแวดล้อม', 16.4862, 102.8276, array['รีไซเคิล', 'อันตราย', 'ทั่วไป'], 'หน่วยงานหลักดูแลการจัดการขยะของ มข.', 'Active')
on conflict do nothing;

-- 5. ตารางรายงานปัญหา (รองรับ waste_reports และ issue_reports)
create table if not exists public.waste_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  location_name text not null default 'มหาวิทยาลัยขอนแก่น',
  report_type text not null default 'ถังขยะเต็ม',
  description text default '',
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- ⚙️ FUNCTIONS & TRIGGERS
-- =====================================================================

-- Trigger เมื่อมีผู้ใช้สมัครใหม่
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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ฟังก์ชันบันทึกการสแกนและเพิ่มแต้มอัตโนมัติ
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
    else 2
  end;

  insert into public.scan_history (user_id, object_name, waste_type, confidence, points_earned)
  values (auth.uid(), p_object_name, p_waste_type, p_confidence, v_points)
  returning id into new_history_id;

  update public.profiles
  set score = coalesce(score, 0) + v_points, updated_at = now()
  where id = auth.uid();

  return new_history_id;
end;
$$;

-- ฟังก์ชันตรวจสอบสิทธิ์ Admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role::text = 'admin'
  );
$$;

-- =====================================================================
-- 🔐 RLS POLICIES
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.scan_history enable row level security;
alter table public.waste_locations enable row level security;
alter table public.waste_reports enable row level security;
alter table public.rewards enable row level security;

-- Profiles Policies
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update to authenticated using (public.is_admin());

-- Scan History Policies
drop policy if exists "Users can read their own scans" on public.scan_history;
create policy "Users can read their own scans"
  on public.scan_history for select to authenticated using ((select auth.uid()) = user_id or public.is_admin());

-- Waste Locations Policies
drop policy if exists "Anyone can read locations" on public.waste_locations;
create policy "Anyone can read locations"
  on public.waste_locations for select to authenticated, anon using (true);

drop policy if exists "Admins can modify locations" on public.waste_locations;
create policy "Admins can modify locations"
  on public.waste_locations for all to authenticated using (public.is_admin());

-- Reports Policies
drop policy if exists "Authenticated users can create reports" on public.waste_reports;
create policy "Authenticated users can create reports"
  on public.waste_reports for insert to authenticated with check (true);

drop policy if exists "Users can view reports" on public.waste_reports;
create policy "Users can view reports"
  on public.waste_reports for select to authenticated using (true);

drop policy if exists "Admins can update reports" on public.waste_reports;
create policy "Admins can update reports"
  on public.waste_reports for update to authenticated using (public.is_admin());

-- Rewards Policies
drop policy if exists "Anyone can view rewards" on public.rewards;
create policy "Anyone can view rewards"
  on public.rewards for select to authenticated, anon using (true);

-- Permissions
grant usage on schema public to authenticated, anon;
grant select, insert, update on public.profiles, public.scan_history, public.waste_locations, public.waste_reports, public.rewards to authenticated;
grant select on public.waste_locations, public.rewards to anon;
grant execute on function public.record_scan(text, text, numeric) to authenticated, service_role;
