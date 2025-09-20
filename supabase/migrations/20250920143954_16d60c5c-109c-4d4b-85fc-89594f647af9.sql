-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('citizen', 'government')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  civic_coins INTEGER NOT NULL DEFAULT 0,
  total_reports INTEGER NOT NULL DEFAULT 0,
  resolved_reports INTEGER NOT NULL DEFAULT 0,
  rank TEXT DEFAULT 'bronze',
  government_id TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  photo_urls TEXT[],
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_department TEXT,
  civic_coins_awarded INTEGER DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create issue categories table
CREATE TABLE public.issue_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  civic_coins_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.issue_categories (name, description, icon, color, civic_coins_reward) VALUES
('Roads & Infrastructure', 'Potholes, road damage, traffic lights', 'construction', '#e74c3c', 15),
('Waste Management', 'Garbage collection, illegal dumping', 'trash-2', '#f39c12', 10),
('Water & Sewage', 'Water leaks, drainage issues', 'droplets', '#3498db', 20),
('Street Lighting', 'Broken or dim street lights', 'lightbulb', '#f1c40f', 8),
('Parks & Recreation', 'Park maintenance, playground issues', 'trees', '#27ae60', 12),
('Public Safety', 'Safety hazards, vandalism', 'shield-alert', '#e67e22', 25),
('Noise Pollution', 'Excessive noise complaints', 'volume-2', '#9b59b6', 5),
('Other', 'Miscellaneous civic issues', 'more-horizontal', '#95a5a6', 10);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('issue_update', 'coin_earned', 'achievement', 'general')),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create civic coin transactions table
CREATE TABLE public.civic_coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus')),
  description TEXT NOT NULL,
  issue_id UUID REFERENCES public.issues(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Government users can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.user_type = 'government'
    )
  );

-- Create RLS policies for issues
CREATE POLICY "Anyone can view issues" ON public.issues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON public.issues
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = reporter_id)
  );

CREATE POLICY "Users can update their own issues" ON public.issues
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = reporter_id)
  );

CREATE POLICY "Government users can update all issues" ON public.issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.user_type = 'government'
    )
  );

-- Create RLS policies for issue categories
CREATE POLICY "Anyone can view categories" ON public.issue_categories
  FOR SELECT USING (true);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = notifications.user_id)
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = notifications.user_id)
  );

-- Create RLS policies for civic coin transactions
CREATE POLICY "Users can view their own transactions" ON public.civic_coin_transactions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = civic_coin_transactions.user_id)
  );

CREATE POLICY "Government users can view all transactions" ON public.civic_coin_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.user_type = 'government'
    )
  );

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'citizen'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to award civic coins
CREATE OR REPLACE FUNCTION public.award_civic_coins(
  user_profile_id UUID,
  coin_amount INTEGER,
  description_text TEXT,
  related_issue_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update user's civic coins
  UPDATE public.profiles 
  SET civic_coins = civic_coins + coin_amount
  WHERE id = user_profile_id;
  
  -- Record the transaction
  INSERT INTO public.civic_coin_transactions (user_id, amount, transaction_type, description, issue_id)
  VALUES (user_profile_id, coin_amount, 'earned', description_text, related_issue_id);
  
  -- Create notification
  INSERT INTO public.notifications (user_id, title, message, type, issue_id)
  VALUES (
    user_profile_id,
    'Civic Coins Earned!',
    'You earned ' || coin_amount || ' civic coins: ' || description_text,
    'coin_earned',
    related_issue_id
  );
END;
$$;