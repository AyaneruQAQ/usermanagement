import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validatePhone, validatePassword } from '@/lib/validate';
import { success, error } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    const phoneErr = validatePhone(phone);
    if (phoneErr) return error(1, phoneErr);

    const passwordErr = validatePassword(password);
    if (passwordErr) return error(1, passwordErr);

    const supabase = await createClient();

    // Supabase Auth：手机号映射为内部邮箱
    const email = phone.trim() + '@user.local';
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr || !data.user) {
      console.log('Login: auth failed', authErr);
      return error(1, '手机号或密码错误');
    }

    console.log('Login: user authenticated', data.user.id);

    // 检查是否为 admin 角色
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('Login: profile query', { profile, profileErr });

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      return error(403, '无权限登录管理平台');
    }

    return success({
      id: data.user.id,
      phone: phone.trim(),
      name: data.user.user_metadata?.name || '',
      role: profile.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(500, '服务器错误');
  }
}
