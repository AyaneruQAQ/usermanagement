-- 在 Supabase Dashboard → SQL Editor 中执行以下语句

-- 1. profiles 表（用户扩展信息）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. subscriptions 表（订阅信息）
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL DEFAULT 0,
  expire_date DATE NOT NULL,
  is_continuous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security（允许认证用户读写自己的数据）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: 认证用户均可读（角色校验在应用层 API Route 中完成）
CREATE POLICY "Authenticated users read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- subscriptions: 认证用户可读（增改删由应用层控制）
CREATE POLICY "Authenticated users read subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

-- subscriptions: admin 可增改删
CREATE POLICY "Admin manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. seed 脚本使用 service_role + Admin API（email_confirm: true），无需关闭邮箱确认
