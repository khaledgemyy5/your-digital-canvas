-- Create table to store allowed admin emails (single admin)
CREATE TABLE public.admin_allowed_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_allowed_emails ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view (to check if their email is allowed)
CREATE POLICY "Authenticated users can check admin status"
  ON public.admin_allowed_emails
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Create a function to check if email is an admin (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin_email(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_allowed_emails WHERE email = check_email
  )
$$;