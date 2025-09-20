import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'citizen' | 'government'>('citizen');
  const [governmentId, setGovernmentId] = useState('');
  const [department, setDepartment] = useState('');

  // Set initial tab based on URL params or default to register
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'citizen' || type === 'government') {
      setUserType(type);
      setActiveTab('register');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await signIn(loginEmail, loginPassword);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (userType === 'government' && !governmentId) {
      toast({
        title: "Missing Government ID",
        description: "Government ID is required for government accounts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await signUp(registerEmail, registerPassword, fullName, userType, governmentId, department);
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-civic flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-civic flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-strong">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-primary w-12 h-12 rounded-lg flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-foreground">Civic Coin</h1>
              <p className="text-xs text-muted-foreground">Building Better Cities</p>
            </div>
          </Link>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to your Civic Coin account</CardDescription>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              <div className="text-center">
                <CardTitle className="text-2xl">Join Civic Coin</CardTitle>
                <CardDescription>Create your account to start reporting issues</CardDescription>
              </div>

              {/* User Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'citizen' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setUserType('citizen')}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Citizen</p>
                      <p className="text-xs text-muted-foreground">Report issues</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    userType === 'government' 
                      ? 'border-success bg-success/5' 
                      : 'border-border hover:border-success/50'
                  }`}
                  onClick={() => setUserType('government')}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-sm">Government</p>
                      <p className="text-xs text-muted-foreground">Manage issues</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                {userType === 'government' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="government-id">Government ID *</Label>
                      <Input
                        id="government-id"
                        type="text"
                        placeholder="Enter your government employee ID"
                        value={governmentId}
                        onChange={(e) => setGovernmentId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public-works">Public Works</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="parks-recreation">Parks & Recreation</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="environmental">Environmental Services</SelectItem>
                          <SelectItem value="public-safety">Public Safety</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password (min. 6 characters)"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              By signing up, you agree to our{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;