# AGENTS

## 项目概述

Nuxt 4 书签管理应用，使用 Nuxt UI v4、Nuxt Hub、Drizzle ORM + SQLite/Cloudflare D1、Tailwind CSS v4、TypeScript 6。

## 命令

| 命令               | 说明                    |
| ------------------ | ----------------------- |
| `pnpm dev`         | 启动开发服务器          |
| `pnpm build`       | 构建生产版本            |
| `pnpm generate`    | 静态生成                |
| `pnpm preview`     | 预览构建结果            |
| `pnpm lint`        | ESLint 检查（含格式化） |
| `pnpm lint:fix`    | ESLint 自动修复         |
| `pnpm ncu`         | 检查依赖更新            |
| `pnpm ncuu`        | 一键更新依赖            |
| `pnpm generate:db` | Drizzle 数据库迁移生成  |

- 包管理器为 `pnpm`（锁定在 pnpm-lock.yaml，workspace 配置在 pnpm-workspace.yaml）
- `postinstall` 自动执行 `nuxt prepare`，安装后无需手动运行
- `pnpm dev` 启动后支持 HMR，修改前端代码无需重新构建或重启
- 无测试框架，无 CI 配置

## 项目结构

```text
app/                    前端页面与应用代码
├── app.vue             根组件
├── assets/css/main.css 全局样式（Tailwind CSS）
├── components/         组件（BookmarkCreateModal 等）
├── composables/        组合式函数
├── pages/              页面（index.vue 等）
└── utils/              工具函数
server/                 服务端代码
├── api/bookmarks/      H3 API 路由
└── db/
    ├── schema.ts       数据库表定义（Drizzle ORM）
    └── migrations/     迁移文件（sqlite/）
shared/                 前后端共享代码
└── types/db.ts         数据库类型（Bookmark, InsertBookmark）
```

## 数据库

- 开发环境使用本地 SQLite（由 `@nuxthub/core` 自动处理），无需配置环境变量
- 生产环境为 Cloudflare D1，连接配置在 `nuxt.config.ts` 中（需设置环境变量 `NUXT_HUB_CLOUDFLARE_ACCOUNT_ID`、`NUXT_HUB_CLOUDFLARE_API_TOKEN`、`NUXT_HUB_CLOUDFLARE_DATABASE_ID`），`.env` 文件已包含这三个变量占位符
- Drizzle Kit 无独立配置文件，由 `@nuxthub/core` 自动处理
- 迁移文件位于 `server/db/migrations/sqlite/`

## Lint / 格式化

- ESLint 使用 `@antfu/eslint-config`，已启用 formatters 和 vue 规则
- 不支持 Prettier（在 `.vscode/settings.json` 中禁用）
- 保存时自动执行 ESLint 修复

## 工作流程

- 每次修改代码后，必须执行 `pnpm lint` 确保代码无问题
- 禁止使用 `pnpm lint:fix`。仅使用 `pnpm lint` 检查，且只修复本次修改相关代码的错误，非本次修改的预存错误忽略

## Nuxt UI

- Nuxt UI MCP 已配置在 `opencode.json` 中，可直接查询组件文档
- 图标使用 `@iconify-json/lucide` 集，格式如 `i-lucide-*`
