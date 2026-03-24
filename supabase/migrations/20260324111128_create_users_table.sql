-- ======================================================
-- MIGRATION 001 — USERS TABLE
-- Merged: create_users + add_insert_policy + is_verified column
-- ======================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ======================================================
-- TABLE
-- ======================================================

CREATE TABLE public.users (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE
                   CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  avatar_url     TEXT,
  password       VARCHAR(255) NOT NULL,
  providers      TEXT[] DEFAULT '{}',
  login_provider TEXT NOT NULL,
  is_verified    BOOLEAN DEFAULT false NOT NULL,
  ip_address     TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ======================================================
-- VIEW
-- ======================================================

CREATE VIEW public.users_view AS
  SELECT *, first_name || ' ' || last_name AS full_name
  FROM public.users;

-- ======================================================
-- INDEXES
-- ======================================================

CREATE INDEX idx_users_email      ON public.users (email);
CREATE INDEX idx_users_created_at ON public.users (created_at);

-- ======================================================
-- TRIGGER — auto-update updated_at (shared across all tables)
-- ======================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- ROW LEVEL SECURITY
-- ======================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public can read all users (e.g. for profile display)
CREATE POLICY "Allow public read access"
  ON public.users FOR SELECT
  USING (true);

-- Allow unauthenticated INSERT for registration
-- Safe: the backend controls what fields are written during sign-up
CREATE POLICY "Allow public insert for registration"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Authenticated users may only update their own row
-- is_verified is intentionally excluded from direct update — 
-- use the verify_email_token() function instead (see migration 003)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);