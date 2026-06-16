'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AuthGuard from './AuthGuard';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthGuard>{children}</AuthGuard>
    </ConfigProvider>
  );
}

export default AppProvider;
