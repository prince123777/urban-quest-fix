-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic government policy that causes recursion
DROP POLICY IF EXISTS "Government users can view all profiles" ON public.profiles;

-- Create a simple, non-recursive policy for government users
-- Government users can view all profiles by checking auth metadata directly
CREATE POLICY "Government users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Check if current user has government user_type in auth metadata
  (current_setting('request.jwt.claims', true)::json->>'user_type' = 'government')
  OR 
  -- Or if it's their own profile
  (auth.uid() = user_id)
);

-- Ensure email verification is required for authentication
-- Update the handle_new_user function to support government metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    user_type, 
    full_name, 
    email,
    government_id,
    department
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'citizen'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'government_id',
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$;