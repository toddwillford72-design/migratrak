-- ─────────────────────────────────────────────────────────────────────────────
-- MigraTrak — Prospects table (intake + scoring pipeline)
-- Run in Supabase Dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.prospects (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text          NOT NULL,
  email                 text          NOT NULL,
  visa_type             text,
  budget_range          text,
  destination_state     text,
  family_size           integer,
  dependent_ages        text,
  score                 integer,
  fit_rating            text,
  complexity            text,
  ai_consultation_note  text,
  assessment_answers    jsonb,
  attorney_id           uuid          REFERENCES public.users(id) ON DELETE SET NULL,
  status                text          NOT NULL DEFAULT 'pending',
  age_out_risk          boolean       NOT NULL DEFAULT false,
  score_breakdown       jsonb,
  -- Attorney introduction workflow columns
  contact_method        text,
  intro_status          text          NOT NULL DEFAULT 'pending',
  intro_sent_at         timestamptz,
  followup_count        integer       NOT NULL DEFAULT 0,
  created_at            timestamptz   NOT NULL DEFAULT now()
);

-- If table already exists, ensure all columns are present
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS dependent_ages        text,
  ADD COLUMN IF NOT EXISTS age_out_risk          boolean       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_breakdown       jsonb,
  ADD COLUMN IF NOT EXISTS ai_consultation_note  text,
  ADD COLUMN IF NOT EXISTS assessment_answers    jsonb,
  ADD COLUMN IF NOT EXISTS contact_method        text,
  ADD COLUMN IF NOT EXISTS intro_status          text          NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS intro_sent_at         timestamptz,
  ADD COLUMN IF NOT EXISTS followup_count        integer       NOT NULL DEFAULT 0;

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; anon/client access is intentionally blocked
-- (prospects are written by the serverless function using the service role key)
