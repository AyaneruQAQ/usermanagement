import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  console.error('❌ 请先在 .env.local 中设置 SUPABASE_SERVICE_ROLE_KEY');
  console.error('   从 Supabase Dashboard → Settings → API → service_role secret 获取');
  process.exit(1);
}

// 使用 service_role key 创建用户，可直接设置 email_confirm
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seed() {
  const password = '123456';

  console.log('> Creating admin user...');

  // Admin API 创建用户，email_confirm: true 跳过邮箱确认
  const { data: admin, error: adminErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: '13800000000@user.local',
      password,
      email_confirm: true,
      user_metadata: { name: '管理员' },
    });

  if (adminErr) {
    if (adminErr.message?.includes('already been registered')) {
      console.log('> Admin user already exists');
    } else {
      console.error('Admin creation error:', adminErr.message);
    }
  }

  if (admin?.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: admin.user.id,
      name: '管理员',
      phone: '13800000000',
      role: 'admin',
    });
    console.log('> Admin user ready: 13800000000');
  }

  // 创建普通用户
  const regularUsers = [
    { phone: '13800000001', name: '张三' },
    { phone: '13800000002', name: '李四' },
    { phone: '13800000003', name: '王五' },
  ];

  console.log('> Creating regular users...');

  for (const u of regularUsers) {
    const { data, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: `${u.phone}@user.local`,
        password,
        email_confirm: true,
        user_metadata: { name: u.name },
      });

    if (createErr) {
      if (createErr.message?.includes('already been registered')) {
        console.log(`  ${u.name} already exists (skipping)`);
        continue;
      }
      console.error(`  Error creating ${u.name}:`, createErr.message);
      continue;
    }

    if (data?.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        name: u.name,
        phone: u.phone,
        role: 'user',
      });

      const idx = regularUsers.indexOf(u);
      const expireMonths = [12, 6, 3][idx];
      const now = new Date();
      await supabaseAdmin.from('subscriptions').upsert(
        {
          user_id: data.user.id,
          duration: expireMonths,
          expire_date: new Date(
            now.getFullYear(),
            now.getMonth() + expireMonths,
            now.getDate(),
          )
            .toISOString()
            .split('T')[0],
          is_continuous: idx === 0,
        },
        { onConflict: 'user_id' },
      );

      console.log(`  ${u.name} (${u.phone}) ready`);
    }
  }

  console.log('>');
  console.log('> Seed complete!');
  console.log('>');
  console.log('> Admin (password: 123456):');
  console.log('>   13800000000 (管理员)');
  console.log('>');
  console.log('> Regular users (password: 123456):');
  console.log('>   13800000001 (张三)');
  console.log('>   13800000002 (李四)');
  console.log('>   13800000003 (王五)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
