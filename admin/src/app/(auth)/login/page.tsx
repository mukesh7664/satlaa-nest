'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Mail, Lock } from '@mui/icons-material';
import {
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { apiService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    title: "Designed for Multi-Store Growth",
    description: "View all your analytics and grow your business from a single dashboard.",
    image: "/images/auth/analytics.png"
  },
  {
    id: 2,
    title: "Powerful Inventory Control",
    description: "Manage stock levels across multiple locations with ease.",
    image: "/images/auth/inventory.png"
  },
  {
    id: 3,
    title: "Deep Customer Insights",
    description: "Understand your users and build lasting relationships with built-in CRM.",
    image: "/images/auth/customers.png"
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, admin } = useAppSelector((state) => state.auth);

  const handleRedirect = (adminData: any) => {
    router.push('/dashboard');
  };

  useEffect(() => {
    if (isAuthenticated && admin) {
      handleRedirect(admin);
    }
  }, [isAuthenticated, admin, router]);

  // Auto-playing slider logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      dispatch(loginStart());
      const response = await apiService.login({ email, password });

      dispatch(loginSuccess({
        admin: response.admin,
        token: response.token,
      }));

      handleRedirect(response.admin);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      dispatch(loginFailure());
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Column: Slideshow */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at top, #6c3aed 0%, #8b5cf6 50%, #a78bfa 100%)' }}
      >
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

        {/* EPXWEB Small Branding at top */}
        <div className="absolute top-10 left-12 z-20 flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#6c3aed] font-black text-lg">E</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">EPXWEB</span>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col h-full pt-32 text-white">
          <div className="px-12 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="space-y-4"
              >
                <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg xl:text-xl text-blue-50 font-medium opacity-80 leading-relaxed max-w-lg">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots - Static but animated indicator */}
            <div className="flex space-x-2 pt-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/30'}`}
                />
              ))}
            </div>
          </div>

          {/* Dashboard Mockup in Browser Frame - STATIC FRAME */}
          <div className="mt-auto pt-12 pl-12 flex-grow flex flex-col justify-end">
            <div className="w-full bg-white rounded-tl-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden border-t border-l border-white/20 backdrop-blur-md">
              {/* Browser Header Bar - STATIC */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex space-x-1.5 font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-gray-400 font-bold bg-gray-200/50 px-6 py-1 rounded-full uppercase tracking-widest">
                  app.epxweb.co
                </div>
                <div className="w-8 h-1 bg-transparent" />
              </div>

              {/* Image with scaling effect - ANIMATED CONTENT */}
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={slides[currentSlide].image}
                      fill
                      alt={slides[currentSlide].title}
                      className="object-cover object-top"
                      priority
                    />
                    <div className="absolute inset-0 bg-violet-600/5 mix-blend-multiply" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo / Header for Mobile */}
          <div className="lg:hidden mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#6c3aed] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">E</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">EPXWEB</span>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Log in</h2>
            <p className="text-gray-500 font-medium">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 ml-1">Email address</p>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="test@saberali.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="text-gray-400 w-5 h-5" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      transition: 'all 0.2s',
                      backgroundColor: 'transparent',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#e5e7eb' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
                    },
                    '& .MuiOutlinedInput-input': {
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    },
                  }}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 ml-1">Password</p>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="text-gray-400 w-5 h-5" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#d1d5db' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      transition: 'all 0.2s',
                      backgroundColor: 'transparent',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#e5e7eb' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
                    },
                    '& .MuiOutlinedInput-input': {
                      '&:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" px-0 className="text-sm font-bold text-blue-600 hover:text-blue-700">
                Sign in with OTP?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                className="py-4 rounded-2xl text-lg font-black normal-case shadow-lg active:scale-[0.98] transition-all bg-[#6c3aed] hover:bg-[#5b21b6]"
                sx={{
                  borderRadius: '16px',
                  backgroundColor: '#6c3aed',

                }}
              >
                {loading ? <CircularProgress size={28} color="inherit" /> : 'Sign In'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-gray-500">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700">
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Alert severity="error" className="rounded-xl font-medium">{error}</Alert>
            </motion.div>
          )}

          <div className="mt-12 text-center text-xs text-gray-500 font-bold opacity-80 uppercase tracking-widest">
            © 2026 EPXWEB TECHNOLOGIES INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
}
