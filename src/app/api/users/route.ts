import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { success, error } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth();
    if (!user) return error(401, '未登录');

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';

    let query = supabase
      .from('profiles')
      .select(
        `
        id, name, phone, role, created_at, updated_at,
        subscriptions (*)
      `,
      )
      .eq('role', 'user');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (phone) {
      query = query.ilike('phone', `%${phone}%`);
    }

    const { data: users } = await query;
    return success(users || []);
  } catch (err) {
    console.error('Get users error:', err);
    return error(500, '服务器错误');
  }
}
