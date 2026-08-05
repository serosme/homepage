# AGENTS

## 项目概述

Nuxt 4 书签管理应用：密码登录（单用户）+ 左右分栏展示文件夹树（左）和根级书签（右），支持右键菜单创建/编辑/删除，使用 Nuxt UI v4、Nuxt Hub、Drizzle ORM + SQLite/Cloudflare D1、Tailwind CSS v4、TypeScript 6。

## 命令

| 命令               | 说明                           |
| ------------------ | ------------------------------ |
| `pnpm dev`         | 启动开发服务器                 |
| `pnpm build`       | 构建生产版本                   |
| `pnpm preview`     | 预览构建结果                   |
| `pnpm lint`        | ESLint 检查（含格式化）        |
| `pnpm lint:fix`    | ESLint 自动修复                |
| `pnpm typecheck`   | TypeScript 类型检查            |
| `pnpm ncu`         | 检查依赖更新                   |
| `pnpm ncuu`        | 一键更新依赖                   |
| `pnpm generate:db` | Drizzle 数据库迁移生成         |
| `pnpm deploy`      | 部署到 Cloudflare Workers + D1 |

- 包管理器为 `pnpm`（锁定在 pnpm-lock.yaml，workspace 配置在 pnpm-workspace.yaml）
- `pnpm dev` 启动后支持 HMR，修改前端代码无需重新构建或重启
- 无测试框架，无 CI 配置

## 项目结构

```text
app/                    前端页面与应用代码
├── app.vue             根组件（UApp 包裹 NuxtPage）
├── assets/css/main.css 全局样式（Tailwind CSS v4 + Nuxt UI）
├── components/
│   ├── BookmarkFormModal.vue  书签新增/编辑弹窗（create/edit 双模式）
│   ├── FolderFormModal.vue    文件夹新增/编辑弹窗（create/edit 双模式）
│   └── LoginForm.vue          登录表单（UAuthForm，密码登录）
├── composables/
│   ├── useBookmarks.ts        书签数据获取与树结构构建
│   ├── useBookmarkForm.ts     书签弹窗状态管理（openCreate/openEdit）
│   ├── useFolderForm.ts       文件夹弹窗状态管理（openCreate/openEdit）
│   ├── useDeleteBookmark.ts   书签删除（DELETE + refresh + toast）
│   ├── useDeleteFolder.ts     文件夹删除（DELETE + refresh + toast）
│   ├── useBookmarkMenu.ts     书签右键菜单（打开/编辑/删除）
│   └── useFolderMenu.ts       文件夹右键菜单（新建×2/编辑/删除）
├── pages/
│   ├── index.vue              重定向到 /bookmarks
│   ├── bookmarks.vue          主页面（左右分栏布局，组装全部 composable，左树菜单按节点类型分派）
│   └── login.vue              登录页（redirect 查询参数回跳）
└── utils/
    ├── bookmark-tree.ts       排序与树结构构建工具函数
    ├── selfFetch.ts           $fetch 实例（全局错误 toast + 401 跳转登录）
    └── useSelfFetch.ts        useFetch 封装（基于 selfFetch）
server/                 服务端代码
├── middleware/auth.ts   API 认证中间件（/api/* 校验 token，/api/auth/* 放行）
├── api/auth/
│   └── login.post.ts    POST /api/auth/login（校验密码，设置 httpOnly cookie）
├── api/bookmarks/
│   ├── index.get.ts     GET /api/bookmarks
│   ├── index.post.ts    POST /api/bookmarks
│   ├── [id].put.ts      PUT /api/bookmarks/:id
│   └── [id].delete.ts   DELETE /api/bookmarks/:id
├── db/
│   ├── schema.ts        数据库表定义（Drizzle ORM）
│   └── migrations/sqlite/  迁移文件
└── utils/
    └── jwt.ts           JWT 签发/验证（jose，密钥为环境变量 AUTH_SECRET）
shared/                 前后端共享代码
└── types/db.ts          数据库类型（Bookmark, InsertBookmark）
```

## API 端点

| 方法   | 路径                 | 说明                                                           |
| ------ | -------------------- | -------------------------------------------------------------- |
| POST   | `/api/auth/login`    | 密码登录（body: password），成功设置 token cookie（httpOnly）  |
| GET    | `/api/bookmarks`     | 获取所有书签（按 position 排序）                               |
| POST   | `/api/bookmarks`     | 创建书签/文件夹（body: name, type, position 必填）             |
| PUT    | `/api/bookmarks/:id` | 更新书签/文件夹（parentId 不能等于自身 id）                    |
| DELETE | `/api/bookmarks/:id` | 删除；非空文件夹返回 400 'Folder is not empty'，不存在返回 400 |

除 `/api/auth/login` 外所有 API 均需登录（`server/middleware/auth.ts` 校验 token）。

## 数据库

- 开发环境使用本地 SQLite（由 `@nuxthub/core` 自动处理），无需配置环境变量
- 生产环境为 Cloudflare D1，连接配置在 `nuxt.config.ts` 中（需设置环境变量 `NUXT_HUB_CLOUDFLARE_ACCOUNT_ID`、`NUXT_HUB_CLOUDFLARE_API_TOKEN`、`NUXT_HUB_CLOUDFLARE_DATABASE_ID`）
- Drizzle Kit 无独立配置文件，由 `@nuxthub/core` 自动处理
- 迁移文件位于 `server/db/migrations/sqlite/`

### 表结构：bookmarks

| 字段     | 类型    | 说明                      |
| -------- | ------- | ------------------------- |
| id       | integer | 主键，自增                |
| parentId | integer | 父文件夹 ID（可空）       |
| type     | text    | 'folder' 或 'bookmark'    |
| name     | text    | 名称（必填）              |
| url      | text    | 书签 URL（bookmark 类型） |
| position | integer | 排序位置                  |

## 前端架构约定

- **浅层封装**：书签/文件夹的**新增、编辑、删除**逻辑全部分离（useBookmarkForm / useFolderForm / useDeleteBookmark / useDeleteFolder），即使代码相似也不合并
- **单一职能**：数据（`useBookmarks`）、弹窗状态（`*Form`）、删除（`useDelete*`）、菜单（`*Menu`）各自独立，互不混合
- **依赖注入**：页面（bookmarks.vue）实例化 composable 后以参数注入菜单 composable（如 `useFolderMenu(bookmarkForm, folderForm, removeFolder)`），菜单内部不自行实例化状态类 composable
- **错误处理（fail loudly）**：`selfFetch` 已在全局统一弹出错误 toast，业务代码**不写 try/catch 包裹请求**；失败时异常自然传播（unhandled rejection 即预期表现），成功路径（emit/refresh/toast）不执行
- **例外**：`server/utils/jwt.ts` 的 `verifyToken` 用 try/catch 将校验失败转为布尔值（预期输入判断，非意外错误）

## Lint / 格式化

- ESLint 使用 `@antfu/eslint-config`，已启用 formatters 和 vue 规则
- VS Code 中 style/format 类规则设为 `"off"`（由 ESLint 自动修复处理），引号和分号规则也由 ESLint 自动修复
- 不支持 Prettier（在 `.vscode/settings.json` 中禁用）
- 保存时自动执行 ESLint 修复

## 工作流程

- 每次修改代码后，必须执行 `pnpm lint` 和 `pnpm typecheck`，根据输出完善代码直至无报错
- 禁止使用 `pnpm lint:fix`。仅使用 `pnpm lint` 检查，且只修复本次修改相关代码的错误，非本次修改的预存错误忽略
- **代码修改后必须同步更新本文件**：新增、修改或删除文件时（组件、composable、页面、API、工具函数等），需立即更新**项目结构**、**API 端点**等对应章节，确保本文件始终反映最新代码细节

## 部署

- 使用 Cloudflare Workers + D1 部署
- D1 数据库绑定配置在 `wrangler.jsonc` 中
- 部署命令 `pnpm deploy` 执行：构建 Nitro preset `cloudflare_module` → `wrangler deploy` → 应用 D1 迁移

## Nuxt UI

- Nuxt UI MCP 已配置在 `opencode.json` 中，可直接查询组件文档
- 图标使用 `@iconify-json/lucide` 集，格式如 `i-lucide-*`
- 项目实际使用的组件：`UApp`、`UModal`、`UForm`、`UTree`、`UContextMenu`、`UInput`、`UButton`、`UFormField`、`UToast`、`UAuthForm`
