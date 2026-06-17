'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Space, Typography, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './UserHeader.module.css';
import { getCurrentUser, logout } from '@/services/authService';

export default function UserHeader() {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    getCurrentUser()
      .then((res) => setName(res.data.name))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className={styles.header}>
      <Typography.Title level={4} className={styles.title}>
        用户订阅管理
      </Typography.Title>

      <Space>
        <UserOutlined />
        <Typography.Text>{name || '--'}</Typography.Text>
        <Button
          type="link"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
        >
          登出
        </Button>
      </Space>
    </div>
  );
}
