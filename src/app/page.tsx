'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Input, Button, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './page.module.css';
import { getUsers, updateSubscription } from '@/services/userService';
import UserHeader from '@/components/UserHeader';
import UserTable from '@/components/UserTable';
import EditSubscriptionModal from '@/components/EditSubscriptionModal';
import type { User } from '@/types';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const fetchUsers = useCallback(async (name?: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await getUsers({ name, phone });
      setUsers(res.data);
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    fetchUsers(nameFilter.trim() || undefined, phoneFilter.trim() || undefined);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = async (values: {
    duration: number;
    expireDate: string;
    isContinuous: boolean;
  }) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateSubscription(editingUser.id, values);
      message.success('保存成功');
      setModalOpen(false);
      setEditingUser(null);
      fetchUsers(nameFilter.trim() || undefined, phoneFilter.trim() || undefined);
    } catch {
      // 错误已在拦截器中处理
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div>
      <UserHeader />
      <div className={styles.container}>

      <Space className={styles.searchBar}>
        <Input
          placeholder="姓名"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          onPressEnter={handleSearch}
          className={styles.searchInput}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Input
          placeholder="电话"
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
          onPressEnter={handleSearch}
          className={styles.searchInput}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
      </Space>

      <UserTable users={users} loading={loading} onEdit={handleEdit} />
        <EditSubscriptionModal
          open={modalOpen}
          user={editingUser}
          onOk={handleSave}
          onCancel={handleCancel}
          loading={saving}
        />
      </div>
    </div>
  );
}
