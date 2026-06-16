import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { validateDuration, validateExpireDate } from '@/lib/validate';
import { success, error } from '@/lib/response';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifyAuth();
    if (!user) return error(401, '未登录');

    const { id: userId } = await params;
    const { duration, expireDate, isContinuous } = await req.json();

    const durationErr = validateDuration(duration);
    if (durationErr) return error(1, durationErr);

    const dateErr = validateExpireDate(expireDate);
    if (dateErr) return error(1, dateErr);

    const supabase = await createClient();

    // 使用 upsert：存在则更新，不存在则创建
    const { data: sub, error: upsertErr } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          duration,
          expire_date: expireDate,
          is_continuous:
            typeof isContinuous === 'boolean' ? isContinuous : false,
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (upsertErr) {
      console.error('Upsert error:', upsertErr);
      return error(1, '更新失败');
    }

    return success(sub);
  } catch (err) {
    console.error('Update subscription error:', err);
    return error(500, '服务器错误');
  }
}
