-- Fix security issues by recreating views without SECURITY DEFINER

-- Drop and recreate leaderboard view without SECURITY DEFINER
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard AS
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

-- Drop and recreate platform stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.platform_stats;
CREATE VIEW public.platform_stats AS
SELECT 
  COUNT(*) as total_issues,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_issues,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_issues,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_issues,
  COUNT(DISTINCT reporter_id) as active_citizens,
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600), 1) as avg_resolution_hours
FROM public.issues;

-- Fix functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_user_rank()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(
  user_profile_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  related_issue_id UUID DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, type, issue_id)
  VALUES (user_profile_id, notification_title, notification_message, notification_type, related_issue_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;