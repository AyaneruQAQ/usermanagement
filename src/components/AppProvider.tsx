'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { UserProvider } from '@/lib/UserContext';
import AuthGuard from './AuthGuard';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={zhCN}>
      <UserProvider>
        <AuthGuard>{children}</AuthGuard>
      </UserProvider>
    </ConfigProvider>
  );
}

export default AppProvider;
