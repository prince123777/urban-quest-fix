-- Fix Security Definer View issue by creating views with SECURITY INVOKER
-- This ensures views respect RLS policies of the querying user instead of view creator

-- Drop existing security definer views
DROP VIEW IF EXISTS public.leaderboard;
DROP VIEW IF EXISTS public.platform_stats;

-- Recreate leaderboard view with SECURITY INVOKER
-- This view will now respect RLS policies on the underlying profiles table
CREATE VIEW public.leaderboard 
WITH (security_invoker = true) AS 
SELECT 
    id,
    full_name,
    profile_photo_url,
    civic_coins,
    total_reports,
    resolved_reports,
    rank,
    user_type,
    row_number() OVER (ORDER BY civic_coins DESC, total_reports DESC) AS position
FROM public.profiles p
WHERE (civic_coins > 0 OR total_reports > 0)
ORDER BY civic_coins DESC, total_reports DESC;

-- Recreate platform_stats view with SECURITY INVOKER
-- This view will now respect RLS policies on the underlying issues table  
CREATE VIEW public.platform_stats 
WITH (security_invoker = true) AS
SELECT 
    count(*) AS total_issues,
    count(*) FILTER (WHERE status = 'resolved') AS resolved_issues,
    count(*) FILTER (WHERE status = 'pending') AS pending_issues,
    count(*) FILTER (WHERE status = 'in_progress') AS in_progress_issues,
    count(DISTINCT reporter_id) AS active_citizens,
    round(avg(EXTRACT(epoch FROM (resolved_at - created_at)) / 3600), 1) AS avg_resolution_hours
FROM public.issues;