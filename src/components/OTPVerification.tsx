import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Smartphone,
  Shield,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationComplete: (verified: boolean) => void;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  className?: string;
}

const OTPVerification = ({
  phoneNumber: initialPhoneNumber,
  onVerificationComplete,
  onPhoneNumberChange,
  className = ''
}: OTPVerificationProps) => {
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (otpSent) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, otpSent]);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const sendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      // Store OTP in database
      const { error: dbError } = await supabase
        .from('otp_verifications')
        .upsert({
          phone_number: formattedPhone,
          otp_code: otp,
          expires_at: expiresAt.toISOString(),
          is_verified: false
        }, {
          onConflict: 'phone_number'
        });

      if (dbError) throw dbError;

      // In a real app, you would send SMS via Twilio/AWS SNS/etc.
      // For demo purposes, we'll show the OTP in console and toast
      console.log(`OTP for ${formattedPhone}: ${otp}`);
      
      toast({
        title: 'OTP Sent',
        description: `Verification code sent to ${formattedPhone}. Check console for demo OTP: ${otp}`,
      });

      setOtpSent(true);
      setTimeLeft(60); // 1 minute cooldown
      setCanResend(false);
      
      if (onPhoneNumberChange) {
        onPhoneNumberChange(formattedPhone);
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Check OTP in database
      const { data, error } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('otp_code', otpCode)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired verification code');
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', data.id);

      if (updateError) throw updateError;

      toast({
        title: 'Phone Verified',
        description: 'Your phone number has been successfully verified',
      });

      onVerificationComplete(true);
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
      onVerificationComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;
    
    setOtpCode('');
    await sendOTP();
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (onPhoneNumberChange) {
      onPhoneNumberChange(value);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Phone Verification</CardTitle>
        <CardDescription>
          {otpSent 
            ? 'Enter the verification code sent to your phone'
            : 'Enter your phone number to receive a verification code'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!otpSent ? (
          // Phone Number Input
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <Button 
              onClick={sendOTP} 
              disabled={isLoading || !phoneNumber}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Send Verification Code
            </Button>
          </div>
        ) : (
          // OTP Input
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isVerifying}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                Code sent to {phoneNumber}
              </p>
            </div>

            <Button 
              onClick={verifyOTP}
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full"
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Verify Code
            </Button>

            {/* Resend Option */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Resend in {timeLeft}s
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resendOTP}
                  disabled={!canResend || isLoading}
                  className="text-primary hover:text-primary/80"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </Button>
              )}
            </div>

            {/* Change Phone Number */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode('');
                  setTimeLeft(0);
                  setCanResend(true);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Change Phone Number
              </Button>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Security Notice</p>
              <p>We use phone verification to ensure account security and prevent spam. Your phone number will not be shared with third parties.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;