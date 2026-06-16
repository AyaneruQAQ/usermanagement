import type { Metadata } from 'next';
import { AppProvider } from '@/components/AppProvider';

export const metadata: Metadata = {
  title: '用户订阅管理系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
