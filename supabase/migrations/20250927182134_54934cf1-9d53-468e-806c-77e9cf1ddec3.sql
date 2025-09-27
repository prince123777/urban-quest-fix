-- Fix security definer views by recreating them without SECURITY DEFINER
-- First drop and recreate leaderboard view without SECURITY DEFINER
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