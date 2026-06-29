'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  LockKeyhole,
  Mail,
  ShieldQuestion,
  Key,
  ShieldCheck,
  Timer,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  // Step: 1 = email, 2 = OTP, 3 = new password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Timers
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  // OTP expiry countdown
  useEffect(() => {
    if (step !== 2 || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await apiService.forgotPassword({ email });
      setStep(2);
      setOtpTimer(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(new Array(OTP_LENGTH).fill(''));
      setSuccess('OTP sent to your email address');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = useCallback(async (otpValue: string) => {
    setError('');
    setSuccess('');

    if (otpValue.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.verifyOtp({ email, otp: otpValue });
      setResetToken(response.resetToken);
      setStep(3);
      setSuccess('OTP verified! Set your new password.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      // Clear OTP on error
      setOtp(new Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await apiService.resetPassword({ token: resetToken, password });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await apiService.forgotPassword({ email });
      setOtpTimer(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(new Array(OTP_LENGTH).fill(''));
      setSuccess('New OTP sent to your email');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last digit only
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    const fullOtp = newOtp.join('');
    if (fullOtp.length === OTP_LENGTH) {
      handleVerifyOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === OTP_LENGTH) {
        handleVerifyOtp(pastedData);
      } else {
        otpInputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  // Left side content per step
  const getLeftContent = () => {
    if (step === 1) {
      return {
        title: <>Recover your <br /><span className="text-emerald-200">Account Access.</span></>,
        subtitle: "Don't worry, it happens to the best of us. We'll help you get back into your dashboard in no time.",
        features: [
          { icon: ShieldQuestion, title: "Secure Recovery", desc: "Identity verification via OTP" },
          { icon: Mail, title: "Instant OTP", desc: "6-digit code sent to your email" },
          { icon: Key, title: "New Password", desc: "Set a strong new password" }
        ]
      };
    }
    if (step === 2) {
      return {
        title: <>Verify your <br /><span className="text-emerald-200">Identity.</span></>,
        subtitle: "We've sent a 6-digit OTP to your email. Enter it below to verify your identity.",
        features: [
          { icon: Timer, title: "Time Limited", desc: "OTP valid for 5 minutes" },
          { icon: ShieldCheck, title: "Secure Code", desc: "One-time use verification" },
          { icon: Mail, title: "Check Inbox", desc: "Also check spam folder" }
        ]
      };
    }
    return {
      title: <>Set your <br /><span className="text-emerald-200">New Password.</span></>,
      subtitle: "Almost there! Create a strong password to secure your account.",
      features: [
        { icon: LockKeyhole, title: "Strong Security", desc: "Minimum 6 characters required" },
        { icon: ShieldCheck, title: "Encrypted Storage", desc: "Passwords are never stored in plain text" },
        { icon: CheckCircle2, title: "Auto Redirect", desc: "Login automatically after reset" }
      ]
    };
  };

  const leftContent = getLeftContent();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Content (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-emerald-600 p-12 text-white relative overflow-hidden">
        {/* Abstract Background Ornaments */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <Link href="/" className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-emerald-600 font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">EPXWEB</span>
        </Link>

        <div className="z-10 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div key={step}>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-5xl font-extrabold mb-6 leading-tight"
              >
                {leftContent.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-emerald-100 mb-12"
              >
                {leftContent.subtitle}
              </motion.p>

              <div className="space-y-6">
                {leftContent.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start space-x-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                      <p className="text-emerald-100/70">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="z-10 flex items-center space-x-4 text-emerald-200 text-sm">
          <span>© 2026 EPXWEB Inc.</span>
          <span className="w-1 h-1 bg-emerald-200/50 rounded-full"></span>
          <span>Terms & Privacy</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                EPXWEB
              </span>
            </Link>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ─── STEP 1: Email ─── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <LockKeyhole className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                  <p className="text-gray-500">Enter your email to receive a verification OTP.</p>
                </div>

                {error && <Alert severity="error" className="mb-6 rounded-xl border border-red-100 shadow-sm">{error}</Alert>}

                <form onSubmit={handleSendOtp} className="flex flex-col">
                  <div className="space-y-2 mb-8">
                    <p className="text-sm font-bold text-gray-700 ml-1">Email address</p>
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '14px',
                          transition: 'all 0.2s',
                          backgroundColor: 'transparent',
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: '#e5e7eb' },
                          '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
                        },
                      }}
                    />
                  </div>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    className="py-4 rounded-2xl text-lg font-bold normal-case shadow-lg transition-all active:scale-[0.98]"
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                      background: 'linear-gradient(to right, #10b981, #0d9488)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #059669, #0f766e)',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 2: OTP Verification ─── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
                  <p className="text-gray-500">
                    We sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>

                {error && <Alert severity="error" className="mb-4 rounded-xl border border-red-100 shadow-sm">{error}</Alert>}
                {success && <Alert severity="success" className="mb-4 rounded-xl border border-green-100 shadow-sm">{success}</Alert>}

                {/* OTP Timer */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    otpTimer > 60 ? 'bg-emerald-50 text-emerald-700' :
                    otpTimer > 0 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    <Timer className="w-4 h-4" />
                    {otpTimer > 0 ? `Expires in ${formatTime(otpTimer)}` : 'OTP Expired'}
                  </div>
                </div>

                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={loading || otpTimer <= 0}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                        ${digit ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:bg-white
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      style={{ caretColor: '#10b981' }}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading || otp.join('').length !== OTP_LENGTH || otpTimer <= 0}
                  onClick={() => handleVerifyOtp(otp.join(''))}
                  className="py-4 rounded-xl text-lg font-bold normal-case transition-all active:scale-[0.98]"
                  sx={{
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                    background: 'linear-gradient(to right, #10b981, #0d9488)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #059669, #0f766e)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
                </Button>

                {/* Resend / Change Email */}
                <div className="mt-6 text-center space-y-3">
                  <div>
                    {resendCooldown > 0 ? (
                      <p className="text-gray-400 text-sm">Resend OTP in <span className="font-semibold">{resendCooldown}s</span></p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm underline underline-offset-2 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Change email address
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: New Password ─── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Key className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">New Password</h2>
                  <p className="text-gray-500">Set a strong password for your account.</p>
                </div>

                {error && <Alert severity="error" className="mb-6 rounded-xl border border-red-100 shadow-sm">{error}</Alert>}
                {success && <Alert severity="success" className="mb-6 rounded-xl border border-green-100 shadow-sm">{success}</Alert>}

                <form onSubmit={handleResetPassword} className="flex flex-col">
                  <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700 ml-1">New Password</p>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        autoFocus
                        disabled={loading}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            transition: 'all 0.2s',
                            backgroundColor: 'transparent',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#e5e7eb' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#d1d5db' }}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText="Minimum 6 characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700 ml-1">Confirm Password</p>
                      <TextField
                        fullWidth
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        disabled={loading}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            transition: 'all 0.2s',
                            backgroundColor: 'transparent',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#e5e7eb' },
                            '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" sx={{ color: '#d1d5db' }}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    className="py-4 rounded-2xl text-lg font-bold normal-case transition-all active:scale-[0.98]"
                    sx={{
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                      background: 'linear-gradient(to right, #10b981, #0d9488)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #059669, #0f766e)',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center pt-8 border-t border-gray-100">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
