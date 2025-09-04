import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { apiClient } from '@/lib/api';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.union([z.boolean(), z.string()]).optional().transform(val => {
    if (typeof val === 'string') {
      return val === 'on' || val === 'true';
    }
    return val;
  })
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits')
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Flow control states
  const [currentStep, setCurrentStep] = useState<'login' | 'forgot-password' | 'otp-verification' | 'reset-password'>('login');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  
  // Resend OTP cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Form hooks for different steps
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema)
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  // Cooldown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handler functions for different steps
  const onLoginSubmit = async (data: LoginFormData) => {
    setError(null);
    
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(null);
    setIsLoadingOtp(true);
    
    try {
      await apiClient.forgotPassword(data.email);
      
      setForgotPasswordEmail(data.email);
      setOtpSent(true);
      setCurrentStep('otp-verification');
      setSuccess('OTP sent to your email address. Please check your inbox.');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const onOtpSubmit = async (data: OTPFormData) => {
    setError(null);
    setSuccess(null);
    // No separate verify step in backend; proceed to reset form where we will confirm
    setCurrentStep('reset-password');
    setSuccess('OTP entered. Please set your new password.');
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setSuccess(null);
    setIsLoadingReset(true);
    
    try {
      // Read latest OTP value from otpForm
      const otpValue = otpForm.getValues('otp');
      await apiClient.confirmForgotPassword({ email: forgotPasswordEmail, code: otpValue, newPassword: data.newPassword });
      
      setSuccess('Password reset successfully! Redirecting to login...');
      
      // Reset all states and go back to login after 2 seconds
      setTimeout(() => {
        setCurrentStep('login');
        setForgotPasswordEmail('');
        setOtpSent(false);
        setSuccess(null);
        setError(null);
        // Reset all forms
        loginForm.reset();
        forgotPasswordForm.reset();
        otpForm.reset();
        resetPasswordForm.reset();
      }, 2000);
      
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setError(null);
    setSuccess(null);
    setIsLoadingOtp(true);
    setCanResend(false);
    setResendCooldown(10);
    
    try {
      await apiClient.forgotPassword(forgotPasswordEmail);
      setSuccess('OTP resent to your email address.');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
      setCanResend(true);
      setResendCooldown(0);
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const resetToLogin = () => {
    setCurrentStep('login');
    setForgotPasswordEmail('');
    setOtpSent(false);
    setError(null);
    setSuccess(null);
    setResendCooldown(0);
    setCanResend(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Pulse Board
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">Your productivity pulse</p>
            </div>
          </div>
          
          {/* Dynamic header based on current step */}
          {currentStep === 'login' && (
            <>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
            </>
          )}
          {currentStep === 'forgot-password' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-gray-600">Enter your email to receive an OTP</p>
            </>
          )}
          {currentStep === 'otp-verification' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-600">Enter the 6-digit code sent to {forgotPasswordEmail}</p>
            </>
          )}
          {currentStep === 'reset-password' && (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">Create a new password for your account</p>
            </>
          )}
        </div>

        {/* Multi-Step Form */}
        <Card className="p-8 bg-white shadow-2xl rounded-3xl border border-gray-200/50">
          {/* Back button for non-login steps */}
          {currentStep !== 'login' && (
            <Button
              type="button"
              variant="ghost"
              onClick={resetToLogin}
              className="mb-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          )}

          {/* Error/Success Alerts */}
            {error && (
            <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

          {/* LOGIN STEP */}
          {currentStep === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...loginForm.register('email')}
                />
              </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                    {...loginForm.register('rememberMe', { 
                    setValueAs: (value) => value === 'on' || value === true 
                  })} 
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
                </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            {/* Test Credentials */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">Test Credentials:</p>
              <p className="text-xs text-blue-700">Email: luckybeel101@gmail.com</p>
              <p className="text-xs text-blue-700">Password: LuckyPass123!</p>
              <p className="text-xs text-blue-600 mt-1">(Your test account)</p>
            </div>
          </form>
          )}

          {/* FORGOT PASSWORD STEP */}
          {currentStep === 'forgot-password' && (
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...forgotPasswordForm.register('email')}
                  />
                </div>
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoadingOtp}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoadingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP VERIFICATION STEP */}
          {currentStep === 'otp-verification' && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              {/* OTP Field */}
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Enter 6-digit OTP
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
                    {...otpForm.register('otp')}
                  />
                </div>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoadingOtp}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoadingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoadingOtp}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {!canResend ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend OTP in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend OTP
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD STEP */}
          {currentStep === 'reset-password' && (
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...resetPasswordForm.register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...resetPasswordForm.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {resetPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{resetPasswordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoadingReset}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoadingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Sign Up Link - Only show on login step */}
          {currentStep === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 