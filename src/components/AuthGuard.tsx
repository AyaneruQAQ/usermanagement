'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import { getCurrentUser } from '@/services/authService';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 登录页不需要鉴权
    if (pathname === '/login') {
      setChecking(false);
      return;
    }

    getCurrentUser()
      .then(() => {
        setChecking(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
