
-- Enums
create type public.app_role as enum ('receptionist', 'physician');

create type public.preferred_language as enum ('ar', 'en');
create type public.contact_method as enum ('whatsapp', 'phone', 'sms', 'email');
create type public.cohort_code as enum ('A','B','C','D','E','F','G','H');
create type public.readiness_code as enum (
  'quit_now','quit_prepare','reduce_first','not_ready_score','discuss_alternatives','score_only','helping_someone'
);

-- Participants (core identifiable record)
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  participant_code text not null unique default ('LT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  full_name text not null,
  mobile text not null,
  email text,
  age int,
  date_of_birth date,
  gender text,
  city text,
  affiliation text, -- school/university/workplace
  preferred_language public.preferred_language not null default 'ar',
  preferred_contact public.contact_method not null default 'whatsapp',
  self_completing boolean not null default true,
  previously_tried_quit boolean,
  previous_quit_attempts text, -- '0','1','2-3','>3'
  main_reason text,
  is_minor boolean generated always as (age is not null and age < 18) stored,
  guardian_consent_flag boolean not null default false,
  cohort public.cohort_code,
  cohort_reason text,
  doctor_review_needed boolean not null default false,
  urgent_symptom boolean not null default false,
  contacted boolean not null default false,
  contact_date timestamptz,
  follow_up_status text,
  appointment_requested boolean not null default false,
  receptionist_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  consent_assessment boolean not null,
  consent_contact boolean not null,
  consent_educational boolean not null,
  consent_service_eval boolean not null,
  consent_research boolean not null default false,
  guardian_notice_shown boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.product_use (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  products text[] not null,
  created_at timestamptz not null default now()
);

create table public.cigarette_dependence_scores (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  q1_time_to_first int not null,
  q2_difficulty_refrain int not null,
  q3_hardest_to_give_up int not null,
  q4_cigs_per_day int not null,
  q5_more_in_morning int not null,
  q6_smoking_when_ill int not null,
  total_score int not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table public.nicotine_control_scores (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  answers jsonb not null, -- {q1:bool,...q10:bool}
  yes_count int not null,
  category text not null,
  youth_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.readiness_stage (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  stage public.readiness_code not null,
  created_at timestamptz not null default now()
);

create table public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  flags text[] not null,
  urgent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.cohort_assignment (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  cohort public.cohort_code not null,
  reason text,
  doctor_review_needed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.follow_up_preferences (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  preference text not null, -- whatsapp_messages|phone_call|physician_review|email_only|no_contact
  created_at timestamptz not null default now()
);

create table public.follow_up_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  channel text,
  outcome text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  note text not null,
  risk_review text,
  follow_up_level text,
  outcome_status text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.outcome_tracking (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade unique,
  baseline_date date not null default current_date,
  quit_date date,
  status_1w text,
  status_4w text,
  status_12w text,
  status_6m text,
  status_12m text,
  current_product_use text,
  abstinent boolean,
  reduced_use boolean,
  relapsed boolean,
  lost_to_follow_up boolean,
  co_reading numeric,
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  export_type text not null,
  row_count int,
  filters jsonb,
  created_at timestamptz not null default now()
);

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_admin_user(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id);
$$;

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger participants_updated_at before update on public.participants
for each row execute function public.tg_set_updated_at();
create trigger outcome_tracking_updated_at before update on public.outcome_tracking
for each row execute function public.tg_set_updated_at();

-- Enable RLS on every table
alter table public.participants enable row level security;
alter table public.consent_records enable row level security;
alter table public.product_use enable row level security;
alter table public.cigarette_dependence_scores enable row level security;
alter table public.nicotine_control_scores enable row level security;
alter table public.readiness_stage enable row level security;
alter table public.risk_flags enable row level security;
alter table public.cohort_assignment enable row level security;
alter table public.follow_up_preferences enable row level security;
alter table public.follow_up_records enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.outcome_tracking enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;
alter table public.export_logs enable row level security;

-- Public anonymous INSERT for triage submission tables
create policy "public can submit participant" on public.participants for insert to anon, authenticated with check (true);
create policy "public can submit consent" on public.consent_records for insert to anon, authenticated with check (true);
create policy "public can submit product_use" on public.product_use for insert to anon, authenticated with check (true);
create policy "public can submit cig_score" on public.cigarette_dependence_scores for insert to anon, authenticated with check (true);
create policy "public can submit nic_score" on public.nicotine_control_scores for insert to anon, authenticated with check (true);
create policy "public can submit readiness" on public.readiness_stage for insert to anon, authenticated with check (true);
create policy "public can submit risk" on public.risk_flags for insert to anon, authenticated with check (true);
create policy "public can submit cohort" on public.cohort_assignment for insert to anon, authenticated with check (true);
create policy "public can submit follow_pref" on public.follow_up_preferences for insert to anon, authenticated with check (true);

-- Admin (receptionist + physician) can SELECT all relevant rows
create policy "admins read participants" on public.participants for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read consent" on public.consent_records for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read product_use" on public.product_use for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read cig_score" on public.cigarette_dependence_scores for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read nic_score" on public.nicotine_control_scores for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read readiness" on public.readiness_stage for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read risk" on public.risk_flags for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read cohort" on public.cohort_assignment for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read follow_pref" on public.follow_up_preferences for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read follow_records" on public.follow_up_records for select to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins read outcomes" on public.outcome_tracking for select to authenticated using (public.is_admin_user(auth.uid()));

-- Clinical notes: physician only
create policy "physicians read notes" on public.clinical_notes for select to authenticated using (public.has_role(auth.uid(),'physician'));
create policy "physicians write notes" on public.clinical_notes for insert to authenticated with check (public.has_role(auth.uid(),'physician'));
create policy "physicians update notes" on public.clinical_notes for update to authenticated using (public.has_role(auth.uid(),'physician'));

-- Participants update: receptionist allowed (limited fields enforced in app); physician full
create policy "admins update participants" on public.participants for update to authenticated using (public.is_admin_user(auth.uid()));
create policy "admins update outcomes" on public.outcome_tracking for update to authenticated using (public.has_role(auth.uid(),'physician'));
create policy "physicians insert outcomes" on public.outcome_tracking for insert to authenticated with check (public.has_role(auth.uid(),'physician'));
create policy "admins insert follow_records" on public.follow_up_records for insert to authenticated with check (public.is_admin_user(auth.uid()));

-- user_roles: only physicians can manage; users can read their own roles
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "physicians read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'physician'));
create policy "physicians manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'physician')) with check (public.has_role(auth.uid(),'physician'));

-- audit + export logs: physicians read; admins insert
create policy "physicians read audit" on public.audit_log for select to authenticated using (public.has_role(auth.uid(),'physician'));
create policy "admins insert audit" on public.audit_log for insert to authenticated with check (public.is_admin_user(auth.uid()));
create policy "physicians read exports" on public.export_logs for select to authenticated using (public.has_role(auth.uid(),'physician'));
create policy "admins insert exports" on public.export_logs for insert to authenticated with check (public.is_admin_user(auth.uid()));

-- Helpful indexes
create index on public.participants (created_at desc);
create index on public.participants (cohort);
create index on public.participants (doctor_review_needed);
create index on public.product_use using gin (products);
