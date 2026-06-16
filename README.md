# 用户订阅管理系统

一个基于 Next.js 15 + Supabase 的全栈用户订阅服务时长管理平台。仅管理员可登录，管理普通用户的订阅时长、到期时间及连续包月状态。

## 技术栈

| 层 | 技术 |
|---|------|
| 全栈框架 | Next.js 15 (App Router) |
| UI 组件 | Ant Design 6.x |
| 后端 | Next.js API Routes |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| HTTP | Axios (统一 request 封装) |

## 快速开始

### 1. 环境准备

```bash
# 安装依赖
npm install
```

### 2. 配置环境变量

复制 `.env.example` → `.env.local`，填入 Supabase 项目信息：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

> `NEXT_PUBLIC_` 前缀的变量会暴露给浏览器，`SUPABASE_SERVICE_ROLE_KEY` 仅服务端使用。

### 3. 初始化数据库

在 Supabase Dashboard → SQL Editor 中执行 `supabase_init.sql`，创建 `profiles` 和 `subscriptions` 表。

### 4. 填充测试数据

```bash
npm run seed
```

种子账号：

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800000000 | 123456 |
| 普通用户 | 13800000001 | 123456 |
| 普通用户 | 13800000002 | 123456 |
| 普通用户 | 13800000003 | 123456 |

### 5. 启动开发服务

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                  # 服务端根布局
│   ├── page.tsx                    # 用户管理主页
│   ├── login/page.tsx              # 登录页
│   ├── middleware.ts               # Session 刷新
│   └── api/                        # API Routes
│       ├── auth/login/route.ts     # POST 登录
│       ├── auth/logout/route.ts    # POST 登出
│       ├── auth/me/route.ts        # GET 当前用户
│       ├── users/route.ts          # GET 用户列表
│       └── users/[id]/subscription/route.ts  # PUT 更新订阅
├── components/
│   ├── AppProvider.tsx             # ConfigProvider + AuthGuard
│   ├── AuthGuard.tsx               # 路由守卫
│   ├── UserTable.tsx               # 用户表格
│   └── EditSubscriptionModal.tsx   # 编辑弹窗
├── services/                       # API 调用层
├── lib/                            # 工具（auth/validate/response/seed）
├── utils/
│   ├── request.ts                  # Axios 封装
│   └── supabase/                   # Supabase 客户端
└── types/                          # TypeScript 类型
```

## 功能

- 仅管理员可登录（非 admin 角色返回 403）
- 用户列表展示姓名、电话、订阅时长、到期时间、连续包月状态
- 按姓名 / 电话模糊搜索
- 点击编辑 → 弹窗修改订阅时长、到期时间、连续包月

## 数据库表

### profiles

| 列名 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK → auth.users |
| name | VARCHAR(50) | 姓名 |
| phone | VARCHAR(20) | 电话（登录标识） |
| role | VARCHAR(20) | admin / user |

### subscriptions

| 列名 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | PK |
| user_id | UUID | FK → auth.users |
| duration | INTEGER | 订阅时长（月） |
| expire_date | DATE | 到期时间 |
| is_continuous | BOOLEAN | 是否连续包月 |

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbopack) |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务 |
| `npm run seed` | 填充测试数据 |
