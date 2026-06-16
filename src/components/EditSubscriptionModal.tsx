'use client';

import React, { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Switch } from 'antd';
import type { User, Subscription } from '@/types';
import dayjs from 'dayjs';

interface Props {
  open: boolean;
  user: User | null;
  onOk: (values: { duration: number; expireDate: string; isContinuous: boolean }) => void;
  onCancel: () => void;
  loading: boolean;
}

function getSub(user: User): Subscription | null {
  if (!user?.subscriptions) return null;
  return Array.isArray(user.subscriptions) ? user.subscriptions[0] : user.subscriptions;
}

export default function EditSubscriptionModal({ open, user, onOk, onCancel, loading }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    const sub = getSub(user!);
    if (sub) {
      form.setFieldsValue({
        duration: sub.duration,
        expireDate: dayjs(sub.expire_date),
        isContinuous: sub.is_continuous,
      });
    }
  }, [user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk({
        duration: values.duration,
        expireDate: values.expireDate.format('YYYY-MM-DD'),
        isContinuous: values.isContinuous,
      });
    } catch {
      // 表单校验失败
    }
  };

  return (
    <Modal
      title="编辑订阅"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="duration"
          label="订阅时长（月）"
          rules={[{ required: true, message: '请输入订阅时长' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入月数" />
        </Form.Item>
        <Form.Item
          name="expireDate"
          label="到期时间"
          rules={[{ required: true, message: '请选择到期时间' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="isContinuous" label="是否连续包月" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
