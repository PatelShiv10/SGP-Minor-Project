
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make API call to backend for authentication
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Create user data object
        const userData = {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          userType: data.user.role as 'user' | 'lawyer' | 'admin',
          id: data.user.id
        };
        
        login(userData);
        
        toast({
          title: "Login successful!",
          description: `Welcome back, ${userData.firstName}!`,
        });
        
        // Redirect based on user type
        if (userType === 'lawyer') {
          navigate('/lawyer-dashboard');
        } else if (userType === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <Tabs value={userType} onValueChange={setUserType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="lawyer">Lawyer</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-teal hover:text-teal-light">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal hover:bg-teal-light text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : `Sign In as ${userType === 'user' ? 'User' : userType === 'lawyer' ? 'Lawyer' : 'Admin'}`}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to LawMate?</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-teal text-teal hover:bg-teal hover:text-white"
                  disabled={isLoading}
                >
                  <Link to="/signup">
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
