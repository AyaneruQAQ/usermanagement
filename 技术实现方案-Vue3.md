# 用户订阅管理系统 — 技术实现方案（Vue3 + Express 版）

## Context

基于 `需求文档.md` 构建全栈用户订阅服务时长管理系统。本方案采用 Vue3 + Express 前后端分离架构。

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 前端框架 | Vue 3 (Composition API) | `<script setup>` + TypeScript |
| 构建工具 | Vite 6 | 开发服务器 + 生产打包 |
| 前端路由 | Vue Router 4 | SPA 路由 |
| UI 组件 | Element Plus | 最新版 |
| HTTP 客户端 | Axios | 封装统一 `request` 入口 |
| 后端 | Express | 纯 API 服务器 |
| ORM | Sequelize.js | — |
| 数据库 | MySQL | — |
| 认证 | JWT (httpOnly cookie) | `jsonwebtoken` + `cookie-parser` |
| 密码加密 | bcrypt | 10 轮 salt |

### 为什么前后端分离

- Express 独立运行在 3001 端口，专注 API
- Vite 开发服务器运行在 5173 端口，代理 `/api` 到 Express
- 部署时 Vite 构建静态文件，Express 托管（或 nginx 反向代理）
- 后端 CJS，前端 TS，边界清晰

---

## 1. 项目目录结构

```
usermanagement/
├── server/                          # Express 后端
│   ├── index.js                     # Express 入口（端口 3001）
│   ├── config/
│   │   └── database.js              # Sequelize 实例 + MySQL 连接
│   ├── models/
│   │   ├── index.js                 # 导入所有模型，定义关联
│   │   ├── User.js                  # 用户模型
│   │   └── Subscription.js          # 订阅模型
│   ├── middleware/
│   │   ├── auth.js                  # JWT 验证中间件
│   │   └── validate.js              # 请求参数校验中间件
│   ├── routes/
│   │   ├── index.js                 # 路由聚合
│   │   ├── auth.js                  # /api/auth/*
│   │   └── users.js                 # /api/users/*
│   └── seed.js                      # 初始测试数据
├── client/                          # Vue 3 前端
│   ├── index.html                   # HTML 入口
│   ├── vite.config.ts               # Vite 配置 + API 代理
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts                  # 应用入口：创建 app + 注册插件
│   │   ├── App.vue                  # 根组件
│   │   ├── router/
│   │   │   └── index.ts             # 路由配置 + 导航守卫
│   │   ├── views/
│   │   │   ├── LoginView.vue        # 登录页
│   │   │   └── UserManageView.vue   # 用户管理页（状态持有者）
│   │   ├── components/
│   │   │   ├── UserTable.vue        # 用户表格（含 loading/empty）
│   │   │   └── EditSubscriptionDialog.vue  # 编辑订阅弹窗
│   │   ├── services/
│   │   │   ├── authService.ts       # 登录/登出/获取当前用户
│   │   │   └── userService.ts       # 获取用户列表/更新订阅
│   │   ├── utils/
│   │   │   └── request.ts           # Axios 封装（拦截器、统一错误处理）
│   │   └── types/
│   │       └── index.ts              # TypeScript 类型定义
│   └── .env                         # VITE_API_BASE_URL
├── package.json                     # 根 package.json（concurrently 启动）
└── .gitignore
```

---

## 2. 数据库设计

### user 表（用户基本信息 / 主表）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO_INCREMENT | 主键 |
| name | STRING(50) | NOT NULL | 姓名 |
| phone | STRING(20) | NOT NULL, UNIQUE | 电话（登录标识） |
| password | STRING(255) | NOT NULL | bcrypt 加密 |
| createdAt | DATE | Sequelize timestamps | 创建时间 |
| updatedAt | DATE | Sequelize timestamps | 更新时间 |

### subscription 表（订阅信息）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO_INCREMENT | 主键 |
| userId | INTEGER | NOT NULL, UNIQUE | FK → user.id（一对一） |
| duration | INTEGER | NOT NULL, DEFAULT 0 | 订阅时长（月） |
| expireDate | DATEONLY | NOT NULL | 到期时间 |
| isContinuous | BOOLEAN | NOT NULL, DEFAULT false | 是否连续包月 |
| createdAt | DATE | Sequelize timestamps | 创建时间 |
| updatedAt | DATE | Sequelize timestamps | 更新时间 |

**关联**：`User.hasOne(Subscription)` ↔ `Subscription.belongsTo(User)`，外键 `userId` 在 subscription 表。

---

## 3. API 设计

统一响应格式：`{ code: 0, message: "ok", data: {...} }`

### 认证接口 `/api/auth`

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | /api/auth/login | 否 | `{ phone, password }` → 验证成功设置 httpOnly cookie |
| POST | /api/auth/logout | 否 | 清除 cookie |
| GET | /api/auth/me | 是 | 返回当前用户信息（用于路由守卫校验） |

### 用户接口 `/api/users`（全部需要鉴权）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users | 获取所有用户（含订阅信息） |
| PUT | /api/users/:id/subscription | 更新订阅：`{ duration, expireDate, isContinuous }` |

### 参数校验

| 接口 | 规则 |
|------|------|
| login | phone 必填、合法手机号；password 必填、≥6 位 |
| update subscription | duration ≥0 整数；expireDate 必填、合法日期；isContinuous 布尔值 |

---

## 4. 认证流程

1. 登录 → 后端查 user 表按 phone 查找 → bcrypt.compare → 签发 JWT（24h）→ 写 httpOnly + sameSite cookie
2. 后续请求自动带 cookie → Express auth 中间件验证 → `req.user = { userId, phone }`
3. 前端路由守卫 `beforeEach`：调 `/api/auth/me`，200 → 放行，401 → 跳转 `/login`
4. Axios 配置 `withCredentials: true`

---

## 5. Express 入口

```js
// server/index.js
const express = require('express');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes');
const { sequelize } = require('./config/database');

async function start() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', apiRoutes);

  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(3001, () => {
    console.log('> API Server ready on http://localhost:3001');
  });
}

start();
```

---

## 6. 前端架构

### 路由配置

```ts
// client/src/router/index.ts
const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue') },
  { path: '/',      component: () => import('@/views/UserManageView.vue'), meta: { requiresAuth: true } },
];

// 导航守卫
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const ok = await authService.getCurrentUser(); // 调 /api/auth/me
    if (!ok) return '/login';
  }
});
```

### 组件树

```
App.vue
  └── <router-view>
        ├── LoginView.vue
        │     └── <el-form>（phone + password + 登录按钮）
        └── UserManageView.vue                    # 状态持有者
              ├── <UserTable>                     # el-table + loading/empty
              │     └── 编辑按钮 → emit('edit', row)
              └── <EditSubscriptionDialog>        # el-dialog + el-form
                    └── duration + expireDate + isContinuous
```

### Vite 代理配置

```ts
// client/vite.config.ts
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Axios 封装

```ts
// client/src/utils/request.ts
import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,   // 携带 cookie
});

request.interceptors.response.use(
  (res) => {
    if (res.data.code !== 0) {
      ElMessage.error(res.data.message || '请求失败');
      return Promise.reject(res.data);
    }
    return res.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    } else {
      ElMessage.error(error.message || '网络错误');
    }
    return Promise.reject(error);
  },
);

export default request;
```

---

## 7. 启动方式

### npm scripts（根目录）

```json
{
  "scripts": {
    "dev": "concurrently \"node server/index.js\" \"cd client && npm run dev\"",
    "build": "cd client && npm run build",
    "start": "NODE_ENV=production node server/index.js",
    "seed": "node server/seed.js"
  }
}
```

### 依赖清单

**根目录 `package.json`**（后端 + 协调）：
```json
{
  "dependencies": {
    "express": "^4.21.0",
    "cookie-parser": "^1.4.7",
    "sequelize": "^6.37.0",
    "mysql2": "^3.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

**`client/package.json`**（前端）：
```json
{
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "element-plus": "^2.9.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  }
}
```

---

## 8. 实施顺序

| 阶段 | 步骤 | 涉及文件 |
|------|------|----------|
| **Phase 1: 初始化** | 根 package.json、server/、client/ 目录、依赖安装 | `package.json`, `client/package.json`, `client/vite.config.ts`, `client/index.html` |
| **Phase 2: 后端基础** | DB 配置 → 模型 → 关联 → auth 中间件 → 校验中间件 → Express 入口 | `server/config/database.js`, `server/models/*`, `server/middleware/*`, `server/index.js` |
| **Phase 3: API 路由** | auth 路由 → users 路由 → 路由汇总 | `server/routes/auth.js`, `server/routes/users.js`, `server/routes/index.js` |
| **Phase 4: 前端基础** | main.ts → App.vue → 路由 → request 封装 → 类型 → Service 层 | `client/src/main.ts`, `client/src/App.vue`, `client/src/router/index.ts`, `client/src/utils/request.ts`, `client/src/types/index.ts`, `client/src/services/*` |
| **Phase 5: 视图组件** | LoginView → UserManageView → UserTable → EditSubscriptionDialog | `client/src/views/*`, `client/src/components/*` |
| **Phase 6: 收尾** | 种子数据、验证 | `server/seed.js` |

---

## 9. 验证方式

1. 配置 MySQL 连接信息（`server/config/database.js` 或 `.env`）
2. `npm run seed` 填充测试数据
3. `npm run dev` 启动服务
   - Express: http://localhost:3001
   - Vue 前端: http://localhost:5173（含 `/api` 代理）
4. 场景验证：
   - 访问 http://localhost:5173 → 未登录跳转 `/login`
   - 输入种子用户手机号 + 密码 → 登录 → 跳转 `/` 显示用户列表
   - 点击「编辑」→ 弹窗预填 → 修改保存 → 列表刷新
5. curl 验证：
   - `POST http://localhost:3001/api/auth/login` → 200 + Set-Cookie
   - `GET http://localhost:3001/api/users` 带 cookie → 200
   - `GET http://localhost:3001/api/users` 无 cookie → 401
