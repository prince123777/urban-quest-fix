-- Create storage buckets for file uploads (skipping if exists)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('issue-photos', 'issue-photos', true),
  ('issue-videos', 'issue-videos', false),
  ('issue-documents', 'issue-documents', false),
  ('government-ids', 'government-ids', false),
  ('proof-of-fix', 'proof-of-fix', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for issue photos (public)
CREATE POLICY "Anyone can view issue photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-photos' AND auth.uid() IS NOT NULL);

-- Create storage policies for issue videos (private)
CREATE POLICY "Users can view issue videos for their reports" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload issue videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for issue documents (private)
CREATE POLICY "Users can view issue documents for their reports" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload issue documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for government IDs (highly restricted)
CREATE POLICY "Users can view their own government ID" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'government-ids' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Government users can upload their ID" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'government-ids' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for proof of fix (public)
CREATE POLICY "Anyone can view proof of fix photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'proof-of-fix');

CREATE POLICY "Government users can upload proof of fix" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'proof-of-fix' AND 
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'government'));

-- Add trigger to update user rank when civic coins change
DROP TRIGGER IF EXISTS update_user_rank_trigger ON public.profiles;
CREATE TRIGGER update_user_rank_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.civic_coins IS DISTINCT FROM NEW.civic_coins)
  EXECUTE FUNCTION public.update_user_rank();