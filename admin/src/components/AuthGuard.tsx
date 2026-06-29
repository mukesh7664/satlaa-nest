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
        if (admin?.role === 'super_admin') {
          router.push('/sa-dashboard');
        } else {
          const allowedPages = admin?.allowedPages || [];
          if (allowedPages.includes('dashboard') || allowedPages.length === 0) {
            router.push('/dashboard');
          } else if (allowedPages.includes('pages')) {
            router.push('/pages');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        const superAdminPaths = ['/sa-dashboard', '/admins', '/plans', '/stores', '/product-categories', '/system-payment-config', '/sa-media', '/sa-payments', '/sa-sections'];
        const isSuperAdminRoute = superAdminPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

        if (admin?.role === 'super_admin' && !isSuperAdminRoute) {
          router.push('/sa-dashboard');
        } else if (admin?.role !== 'super_admin' && isSuperAdminRoute) {
          const allowedPages = admin?.allowedPages || [];
          if (allowedPages.includes('dashboard') || allowedPages.length === 0) {
            router.push('/dashboard');
          } else if (allowedPages.includes('pages')) {
            router.push('/pages');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [isAuthenticated, pathname, router, loading, admin?.role, admin?.planCategory, token, dispatch]);

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
