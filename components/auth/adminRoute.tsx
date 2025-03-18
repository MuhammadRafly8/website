"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './authContext';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin()) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Only render children if user is authenticated and is an admin
  return isAuthenticated && isAdmin() ? <>{children}</> : null;
};

export default AdminRoute;