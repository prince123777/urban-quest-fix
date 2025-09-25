-- Update database schema for Civic Connect requirements

-- Update profiles table for new requirements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS government_id_url TEXT,
ADD COLUMN IF NOT EXISTS is_government_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL,
ADD COLUMN IF NOT EXISTS location_lng DECIMAL,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on OTP table
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for OTP verifications
CREATE POLICY "Users can manage their own OTP verifications" 
ON public.otp_verifications 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update issues table for enhanced features
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS voice_description_url TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proof_of_fix_urls TEXT[],
ADD COLUMN IF NOT EXISTS government_notes TEXT;

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.profile_photo_url,
  p.civic_coins,
  p.total_reports,
  p.resolved_reports,
  p.rank,
  p.user_type,
  ROW_NUMBER() OVER (ORDER BY p.civic_coins DESC, p.total_reports DESC) as position
FROM public.profiles p
WHERE p.civic_coins > 0 OR p.total_reports > 0
ORDER BY p.civic_coins DESC, p.total_reports DESC;

-- Create real-time stats view
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT 
  COUNT(*) as total_issues,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_issues,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_issues,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_issues,
  COUNT(DISTINCT reporter_id) as active_citizens,
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 1) as avg_resolution_hours
FROM public.issues;

-- Create media uploads table for file management
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'video', 'audio', 'document'
  file_size INTEGER,
  upload_type TEXT NOT NULL, -- 'issue_media', 'government_id', 'proof_of_fix', 'profile_photo'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on media uploads
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for media uploads
CREATE POLICY "Users can view media for their issues" 
ON public.media_uploads 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  issue_id IN (SELECT id FROM public.issues WHERE reporter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Users can upload media for their issues" 
ON public.media_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Government users can view all media
CREATE POLICY "Government users can view all media" 
ON public.media_uploads 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.user_type = 'government'
));

-- Create function to update user rank based on civic coins
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rank based on civic coins
  IF NEW.civic_coins >= 5000 THEN
    NEW.rank = 'diamond';
  ELSIF NEW.civic_coins >= 2500 THEN
    NEW.rank = 'platinum';
  ELSIF NEW.civic_coins >= 1000 THEN
    NEW.rank = 'gold';
  ELSIF NEW.civic_coins >= 500 THEN
    NEW.rank = 'silver';
  ELSE
    NEW.rank = 'bronze';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rank updates
DROP TRIGGER IF EXISTS update_rank_trigger ON public.profiles;
CREATE TRIGGER update_rank_trigger
  BEFORE UPDATE OF civic_coins ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_rank();

-- Create function to send real-time notifications
CREATE OR REPLACE FUNCTION public.send_notification(
  user_profile_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  related_issue_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, issue_id)
  VALUES (user_profile_id, notification_title, notification_message, notification_type, related_issue_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for key tables
ALTER TABLE public.issues REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.civic_coin_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
  -- Add issues to realtime
  PERFORM pg_catalog.pg_advisory_lock(123456);
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_coin_transactions;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  PERFORM pg_catalog.pg_advisory_unlock(123456);
END
$$;