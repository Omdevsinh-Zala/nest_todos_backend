-- Enable extension if not already (optional, for UUID generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the users table
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  avatar_url TEXT,
  password VARCHAR(255) NOT NULL,
  providers TEXT[] DEFAULT '{}',
  login_provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE VIEW public.users_view AS
  SELECT *, first_name || ' ' || last_name AS full_name
  FROM public.users;

-- Indexes for performance
CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_created_at ON public.users (created_at);

-- Trigger function to auto-update 'updated_at' on row modifications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the users table (fires before UPDATE)
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Turn on Row Level Security (Recommended)
alter table public.users enable row level security;

-- Create a generic policy so anyone can read the table (update this based on your security needs!)
create policy "Allow public read access" on public.users for select using (true);
