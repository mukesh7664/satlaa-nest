'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { 
  ArrowRight, 
  ShieldCheck, 
  RefreshCcw, 
  Key, 
  Lock 
} from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.resetPassword({ token, password });
      setSuccess(response.message + ' Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
            EPXWEB
          </span>
        </Link>
      </div>

      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
          <RefreshCcw className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-500">Please enter your new secure password.</p>
      </div>

      {error && (
        <Alert severity="error" className="mb-6 rounded-xl border border-red-100 shadow-sm">
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" className="mb-6 rounded-xl border border-green-100 shadow-sm">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={!token || loading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f9fafb'
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="Minimum 6 characters"
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={!token || loading}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f9fafb'
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading || !token}
          className="bg-orange-600 hover:bg-orange-700 py-4 rounded-xl text-lg font-bold normal-case shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
          sx={{
            boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2)',
            background: 'linear-gradient(to right, #f97316, #ea580c)',
            '&:hover': {
              background: 'linear-gradient(to right, #ea580c, #c2410c)',
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Update Password'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center pt-8 border-t border-gray-100">
        <p className="text-gray-600">
          Remembered it?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Content (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-orange-600 p-12 text-white relative overflow-hidden">
        {/* Abstract Background Ornaments */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <Link href="/" className="flex items-center space-x-2 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-orange-600 font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">EPXWEB</span>
        </Link>

        <div className="z-10 max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold mb-6 leading-tight"
          >
            Finalize your <br />
            <span className="text-orange-200">New Security.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-orange-100 mb-12"
          >
            Almost there! Set a new strong password to regain full access to your business tools and stores.
          </motion.p>

          <div className="space-y-6">
            {[
              { icon: Lock, title: "Enhanced Encryption", desc: "Your passwords are never stored in plain text" },
              { icon: ShieldCheck, title: "Session Security", desc: "Automatic login after successful reset" },
              { icon: Key, title: "Stronger Defense", desc: "Recommended minimum 8-12 characters" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start space-x-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-orange-200" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-orange-100/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="z-10 flex items-center space-x-4 text-orange-200 text-sm">
          <span>© 2026 EPXWEB Inc.</span>
          <span className="w-1 h-1 bg-orange-200/50 rounded-full"></span>
          <span>Terms & Privacy</span>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <Suspense fallback={<CircularProgress />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
