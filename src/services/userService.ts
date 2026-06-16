import request from '@/utils/request';
import type { User } from '@/types';

export async function getUsers(params?: { name?: string; phone?: string }) {
  return request.get<unknown, { code: number; message: string; data: User[] }>(
    '/users',
    { params },
  );
}

export async function updateSubscription(
  userId: string,
  data: { duration: number; expireDate: string; isContinuous: boolean },
) {
  return request.put(`/users/${userId}/subscription`, data);
}
