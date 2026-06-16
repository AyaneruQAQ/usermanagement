'use client';

import React from 'react';
import { Table, Button, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types';

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
}

export default function UserTable({ users, loading, onEdit }: Props) {
  const columns: ColumnsType<User> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: '订阅时长',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        const sub = Array.isArray(record.subscriptions)
          ? record.subscriptions[0]
          : record.subscriptions;
        return `${sub?.duration ?? 0} 月`;
      },
    },
    {
      title: '到期时间',
      key: 'expireDate',
      width: 120,
      render: (_, record) => {
        const sub = Array.isArray(record.subscriptions)
          ? record.subscriptions[0]
          : record.subscriptions;
        return sub?.expire_date ?? '-';
      },
    },
    {
      title: '是否连续包月',
      key: 'isContinuous',
      width: 120,
      render: (_, record) => {
        const sub = Array.isArray(record.subscriptions)
          ? record.subscriptions[0]
          : record.subscriptions;
        return sub?.is_continuous ? (
          <Tag color="green">是</Tag>
        ) : (
          <Tag>否</Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => onEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      locale={{ emptyText: <Empty description="暂无用户数据" /> }}
      pagination={false}
    />
  );
}
