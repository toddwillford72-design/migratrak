-- ─────────────────────────────────────────────────────────────────────────────
-- MigraTrak — Attorney profile columns + status workflow
-- Run in Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- Status column drives the attorney approval workflow:
--   'active'         — all clients; attorneys who were manually approved before this migration
--   'pending_review' — newly self-registered attorneys awaiting manual approval
--   'approved'       — attorney approved to appear in the public directory (future)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status              text    NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS office_address      text,
  ADD COLUMN IF NOT EXISTS office_city         text,
  ADD COLUMN IF NOT EXISTS office_state        text,
  ADD COLUMN IF NOT EXISTS visa_types_handled  text[],
  ADD COLUMN IF NOT EXISTS bar_number          text,
  ADD COLUMN IF NOT EXISTS bar_state           text,
  ADD COLUMN IF NOT EXISTS phone               text,
  ADD COLUMN IF NOT EXISTS languages_spoken    text;
