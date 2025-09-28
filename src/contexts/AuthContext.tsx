import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  user_type: 'citizen' | 'government';
  full_name: string;
  email: string;
  civic_coins: number;
  total_reports: number;
  resolved_reports: number;
  rank: string;
  government_id?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType: 'citizen' | 'government', governmentId?: string, department?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      // Type assertion to ensure proper types
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Handle different auth events
          if (event === 'SIGNED_IN') {
            toast({
              title: "Signed In",
              description: "Welcome back!",
            });
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
          
          // Defer profile fetching to avoid potential RLS issues
          setTimeout(async () => {
            try {
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            } catch (error) {
              console.error('Error fetching profile after auth change:', error);
            }
            setLoading(false);
          }, 100);
        } else {
          setProfile(null);
          setLoading(false);
          
          if (event === 'SIGNED_OUT') {
            // Clear any cached data
            console.log('User signed out, clearing data');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          } catch (error) {
            console.error('Error fetching profile on init:', error);
          }
          setLoading(false);
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    userType: 'citizen' | 'government',
    governmentId?: string,
    department?: string
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?verified=true`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: userType,
            government_id: governmentId,
            department: department
          }
        }
      });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check Your Email",
          description: "We sent you a verification link. Please check your email and click the link to activate your account.",
        });
      } else if (data.session) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!",
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link before signing in.';
        } else if (error.message.includes('not authorized')) {
          errorMessage = 'Your account is not authorized. Please contact support.';
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in.",
        });
        
        // Redirect will be handled by the useEffect in App component based on user profile
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};