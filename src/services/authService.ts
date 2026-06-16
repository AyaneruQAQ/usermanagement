import request from '@/utils/request';
import type { User } from '@/types';

export async function login(phone: string, password: string) {
  return request.post<unknown, { code: number; message: string; data: User }>(
    '/auth/login',
    { phone, password },
  );
}

export async function logout() {
  return request.post('/auth/logout');
}

export async function getCurrentUser() {
  return request.get<unknown, { code: number; message: string; data: User }>(
    '/auth/me',
  );
}
