'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import styles from './AuthGuard.module.css';
import { useUser } from '@/lib/UserContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
