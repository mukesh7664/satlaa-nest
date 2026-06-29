'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Box, CircularProgress } from '@mui/material';
import { isTokenExpired } from '@/utils/auth';
import { logout } from '@/store/slices/authSlice';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, admin, token, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    // 1. Immediate expiration check to prevent dashboard flash
    if (token && isTokenExpired(token)) {
      if (isAuthenticated) {
        dispatch(logout());
      }
      if (!isPublicRoute) {
        router.push('/login');
        return;
      }
    }

    // 2. Not authenticated check
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // 3. Authenticated user protection
    if (isAuthenticated && !isTokenExpired(token)) {
      if (isPublicRoute) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, router, loading, admin?.role, token, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isExpired = token && isTokenExpired(token);

  if ((!isAuthenticated || isExpired) && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
