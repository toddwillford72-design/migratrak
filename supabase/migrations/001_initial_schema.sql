-- ─────────────────────────────────────────────────────────────────────────────
-- MigraTrak — Initial Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. USERS ─────────────────────────────────────────────────────────────────

create table if not exists public.users (
  id                uuid        primary key default gen_random_uuid(),
  email             text        not null unique,
  name              text,
  role              text        not null default 'client',   -- 'client' | 'attorney'
  visa_type         text,
  origin_country    text        default 'Canada',
  destination_state text,
  family_size       integer,
  dependent_ages    integer[],
  case_start_date   date,
  firm_name         text,
  created_at        timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read and update their own row
create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id);

-- New authenticated users can insert their own row
create policy "users: insert own row"
  on public.users for insert
  with check (auth.uid() = id);


-- ── 2. MILESTONES ────────────────────────────────────────────────────────────

create table if not exists public.milestones (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.users(id) on delete cascade,
  title          text        not null,
  phase          integer,
  status         text        not null default 'upcoming',  -- 'upcoming' | 'in_progress' | 'complete'
  completed_date date,
  due_date       date,
  alert_message  text,
  created_at     timestamptz not null default now()
);

alter table public.milestones enable row level security;

-- Clients read/write their own milestones
create policy "milestones: client read own"
  on public.milestones for select
  using (auth.uid() = user_id);

create policy "milestones: client write own"
  on public.milestones for all
  using (auth.uid() = user_id);

-- Attorneys read milestones for linked clients
create policy "milestones: attorney read linked clients"
  on public.milestones for select
  using (
    exists (
      select 1 from public.attorney_clients ac
      join public.users u on u.id = auth.uid()
      where ac.attorney_id = auth.uid()
        and ac.client_id   = milestones.user_id
        and ac.status      = 'active'
        and u.role         = 'attorney'
    )
  );


-- ── 3. EXPENSES ──────────────────────────────────────────────────────────────

create table if not exists public.expenses (
  id                      uuid        primary key default gen_random_uuid(),
  user_id                 uuid        not null references public.users(id) on delete cascade,
  amount                  numeric(12,2) not null,
  currency                text        not null default 'USD',
  category                text,
  vendor                  text,
  description             text,
  expense_date            date,
  is_qualifying_investment boolean     not null default false,
  receipt_url             text,
  created_at              timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "expenses: client read own"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "expenses: client write own"
  on public.expenses for all
  using (auth.uid() = user_id);

create policy "expenses: attorney read linked clients"
  on public.expenses for select
  using (
    exists (
      select 1 from public.attorney_clients ac
      join public.users u on u.id = auth.uid()
      where ac.attorney_id = auth.uid()
        and ac.client_id   = expenses.user_id
        and ac.status      = 'active'
        and u.role         = 'attorney'
    )
  );


-- ── 4. DOCUMENTS ─────────────────────────────────────────────────────────────

create table if not exists public.documents (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  name        text        not null,
  phase       integer,
  status      text        not null default 'required',  -- 'required' | 'uploaded' | 'approved' | 'flagged'
  file_url    text,
  expiry_date date,
  flagged     boolean     not null default false,
  flag_note   text,
  created_at  timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents: client read own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents: client write own"
  on public.documents for all
  using (auth.uid() = user_id);

create policy "documents: attorney read linked clients"
  on public.documents for select
  using (
    exists (
      select 1 from public.attorney_clients ac
      join public.users u on u.id = auth.uid()
      where ac.attorney_id = auth.uid()
        and ac.client_id   = documents.user_id
        and ac.status      = 'active'
        and u.role         = 'attorney'
    )
  );


-- ── 5. ATTORNEY_CLIENTS ───────────────────────────────────────────────────────
-- Must be created after milestones/expenses/documents policies reference it,
-- but the table itself is referenced in those policies — so create it first
-- and rely on Postgres deferring the policy checks to runtime.

create table if not exists public.attorney_clients (
  id           uuid        primary key default gen_random_uuid(),
  attorney_id  uuid        not null references public.users(id) on delete cascade,
  client_id    uuid        not null references public.users(id) on delete cascade,
  activated_at timestamptz not null default now(),
  status       text        not null default 'active',
  unique (attorney_id, client_id)
);

alter table public.attorney_clients enable row level security;

-- Attorneys manage their own client roster
create policy "attorney_clients: attorney read own"
  on public.attorney_clients for select
  using (auth.uid() = attorney_id);

create policy "attorney_clients: attorney write own"
  on public.attorney_clients for all
  using (auth.uid() = attorney_id);

-- Clients can see which attorney is linked to them
create policy "attorney_clients: client read own link"
  on public.attorney_clients for select
  using (auth.uid() = client_id);
