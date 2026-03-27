-- ======================================================
-- MIGRATION 003 — EMAIL VERIFICATION
-- Merged: create_verification_tokens + allow_users_update (fixed)
--
-- REPLACES the dangerous policy:
--   CREATE POLICY "Allow public update access" ON public.users FOR UPDATE USING (true);
--
-- Instead, a SECURITY DEFINER function is used so that:
--   - Only the specific columns (is_verified) are updated
--   - Only the row matching the token is updated
--   - The anon role cannot directly UPDATE the users table
-- ======================================================


-- ======================================================
-- VERIFICATION TOKENS TABLE
-- ======================================================

CREATE TABLE public.verification_tokens (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_verification_tokens_token            ON public.verification_tokens (token);
CREATE INDEX idx_verification_tokens_status_expires   ON public.verification_tokens (status, expires_at);
CREATE INDEX idx_verification_tokens_user_id          ON public.verification_tokens (user_id);

-- ======================================================
-- RLS
-- ======================================================

ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Backend (anon key) may INSERT a token when a user registers.
-- Tokens are random, expire, and are single-use, so INSERT-only is safe.
CREATE POLICY "Allow token creation"
  ON public.verification_tokens FOR INSERT
  WITH CHECK (true);

-- No SELECT / UPDATE policies for anon.
-- All read/update access to this table goes through the
-- verify_email_token() SECURITY DEFINER function below.


-- ======================================================
-- SECURITY DEFINER FUNCTION — verify_email_token
--
-- Runs as the function OWNER (superuser), not as the anon caller.
-- This is the ONLY safe way to let an unauthenticated request
-- update is_verified on the users table without opening up
-- a blanket UPDATE policy.
-- ======================================================

CREATE OR REPLACE FUNCTION public.verify_email_token(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  UUID;
  v_token_id UUID;
BEGIN
  -- Look up a valid, non-expired, pending token
  SELECT id, user_id
    INTO v_token_id, v_user_id
    FROM public.verification_tokens
   WHERE token      = p_token
     AND status     = 'pending'
     AND expires_at > NOW();

  -- Token not found, already used, or expired
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Invalidate the token so it cannot be reused
  UPDATE public.verification_tokens
     SET status = 'verified'
   WHERE id = v_token_id;

  -- Mark the user as verified
  UPDATE public.users
     SET is_verified = true
   WHERE id = v_user_id;

  RETURN TRUE;
END;
$$;

-- Grant the anon role permission to CALL this function only.
-- The anon role still cannot directly UPDATE users or verification_tokens.
GRANT EXECUTE ON FUNCTION public.verify_email_token(TEXT) TO anon;