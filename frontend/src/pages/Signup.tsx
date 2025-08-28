import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';
import { useEffect } from 'react';

const Signup = () => {
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('user');
  
  // Common fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Lawyer specific fields
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const { toast } = useToast();
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [signupEmail, setSignupEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const otpInputs = Array.from({ length: 6 }, (_, i) => useRef<HTMLInputElement>(null));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    // Prepare data
    let endpoint = 'http://localhost:5000/api/auth/signup/user';
    let payload: any = {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      agree: agree ? 'true' : 'false',
    };
    if (userType === 'lawyer') {
      endpoint = 'http://localhost:5000/api/auth/signup/lawyer';
      payload = {
        ...payload,
        specialization,
        experience,
        location,
        barNumber,
        bio,
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || ['Unknown error']);
        toast({
          title: 'Signup Failed',
          description: (data.errors || ['Unknown error']).join('\n'),
          variant: 'destructive',
        });
      } else {
        setSuccess(data.message || 'Signup successful!');
        toast({
          title: 'Signup Successful',
          description: data.message || 'Signup successful! OTP sent to your email.',
        });
        setShowOtp(true);
        setSignupEmail(email);
      }
    } catch (err) {
      setErrors(['Network error']);
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server.',
        variant: 'destructive',
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit numbers
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    if (value && index < 5) {
      otpInputs[index + 1].current?.focus();
    }
    if (newOtp.every(d => d.length === 1)) {
      handleVerifyOtpAuto(newOtp.join(''));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtpDigits(paste.split(''));
      handleVerifyOtpAuto(paste);
    }
  };

  const handleVerifyOtpAuto = async (otpValue: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'OTP Verification Failed',
          description: (data.errors || ['Unknown error']).join('\n'),
          variant: 'destructive',
        });
        setOtpDigits(['', '', '', '', '', '']);
        otpInputs[0].current?.focus();
      } else {
        toast({
          title: 'Email Verified',
          description: data.message,
        });
        setVerified(true);
        setShowOtp(false);
        setRedirecting(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-navy">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join LawMate and get started today</p>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <Tabs value={userType} onValueChange={setUserType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User Account</TabsTrigger>
                <TabsTrigger value="lawyer">Lawyer Account</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {/* Show OTP form if needed */}
            {showOtp && !verified ? (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-navy">Verify Your Email</h3>
                  <p className="text-gray-600">Enter the 6-digit code sent to <span className="font-bold">{signupEmail}</span></p>
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpInputs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-12 text-2xl text-center border-2 border-teal rounded focus:outline-none focus:border-navy transition"
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-center">Didn't receive the code? Check your spam folder.</p>
              </div>
            ) : !verified ? (
              <form onSubmit={handleSignup} className="space-y-6">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      placeholder="Enter first name"
                      required
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10"
                      placeholder="Enter last name"
                      required
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

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
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your phone number"
                    required
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Enter password"
                      required
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Confirm password"
                      required
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lawyer Specific Fields */}
              {userType === 'lawyer' && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-navy mb-4">Professional Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                          Specialization
                        </Label>
                        <Select value={specialization} onValueChange={setSpecialization}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                            <SelectItem value="Family Law">Family Law</SelectItem>
                            <SelectItem value="Criminal Defense">Criminal Defense</SelectItem>
                            <SelectItem value="Immigration Law">Immigration Law</SelectItem>
                            <SelectItem value="Personal Injury">Personal Injury</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Tax Law">Tax Law</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                          Years of Experience
                        </Label>
                        <Input
                          id="experience"
                          type="number"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="mt-1"
                          placeholder="Enter years of experience"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                          Location
                        </Label>
                        <div className="mt-1 relative">
                          <Input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-10"
                            placeholder="City, State"
                            required
                          />
                          <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="barNumber" className="text-sm font-medium text-gray-700">
                          Bar Number
                        </Label>
                        <Input
                          id="barNumber"
                          type="text"
                          value={barNumber}
                          onChange={(e) => setBarNumber(e.target.value)}
                          className="mt-1"
                          placeholder="Enter bar number"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1"
                        placeholder="Tell us about your legal experience and expertise..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-teal hover:text-teal-light">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-teal hover:text-teal-light">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal hover:bg-teal-light text-white"
              >
                Create {userType === 'user' ? 'User' : 'Lawyer'} Account
              </Button>
            </form>
            ) : (
              <div className="text-green-600 text-center font-semibold">
                Your email has been verified! Redirecting to login page...
                {redirecting && <div className="text-gray-500 text-sm mt-2">Please wait...</div>}
              </div>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-teal text-teal hover:bg-teal hover:text-white"
                >
                  <Link to="/login">
                    Sign In
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

export default Signup;
