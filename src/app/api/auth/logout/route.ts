import { createClient } from '@/utils/supabase/server';
import { success, error } from '@/lib/response';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return success(null, '已登出');
  } catch (err) {
    console.error('Logout error:', err);
    return error(500, '服务器错误');
  }
}
