import { verifyAuth, getProfile } from '@/lib/auth';
import { success, error } from '@/lib/response';

export async function GET() {
  try {
    const user = await verifyAuth();
    if (!user) return error(401, '未登录');

    const profile = await getProfile(user.id);

    return success({
      id: user.id,
      name: profile?.name || '',
      phone: user.email,
      role: profile?.role || 'user',
    });
  } catch (err) {
    console.error('Auth check error:', err);
    return error(500, '服务器错误');
  }
}
