
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get user data from signup page
  const userData = location.state?.userData || {};
  const userType = location.state?.userType || 'user';

  useEffect(() => {
    // Focus on first input when component mounts
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when last digit is entered
    if (index === 5 && value) {
      const completeOtp = [...newOtp.slice(0, 5), value].join('');
      handleVerifyOtp(completeOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Handle paste
    else if (e.key === 'Enter') {
      handleVerifyOtp(otp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-verify if 6 digits pasted
      if (pastedData.length === 6) {
        handleVerifyOtp(pastedData);
      }
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any 6-digit OTP
      console.log('Verifying OTP:', otpValue, 'for user:', userData);
      
      toast({
        title: "Verification Successful!",
        description: "Your account has been verified successfully."
      });
      
      // Navigate based on user type
      if (userType === 'lawyer') {
        navigate('/lawyer-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = () => {
    // Clear current OTP
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
    toast({
      title: "OTP Sent",
      description: "A new OTP has been sent to your email."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-teal p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-navy">Verify Your Account</h2>
          <p className="mt-2 text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-navy">{userData.email || 'your email'}</p>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-navy">Enter Verification Code</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 focus:border-teal focus:ring-teal rounded-lg"
                  disabled={isVerifying}
                />
              ))}
            </div>

            <Button
              onClick={() => handleVerifyOtp(otp.join(''))}
              disabled={otp.join('').length !== 6 || isVerifying}
              className="w-full bg-teal hover:bg-teal-light text-white"
            >
              {isVerifying ? 'Verifying...' : 'Verify Account'}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isVerifying}
                className="text-teal hover:text-teal-light hover:bg-teal/10"
              >
                Resend OTP
              </Button>
            </div>

            <div className="flex items-center justify-center pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/signup')}
                className="text-gray-600 hover:text-navy"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Signup
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Enter the 6-digit code sent to your email. The code will expire in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
