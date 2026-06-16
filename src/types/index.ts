export interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  subscriptions?: Subscription | Subscription[];
}

export interface Subscription {
  id: number;
  user_id: string;
  duration: number;
  expire_date: string;
  is_continuous: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
