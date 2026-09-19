# Homepage Agent Instructions

个人自用的 Nuxt 4 书签管理应用：单用户密码登录，左栏文件夹树 + 右栏根级书签，节点行右侧三个点菜单负责新建、编辑、删除和同级上移下移。

这是个人项目，使用场景、数据来源和操作流程都是明确且受控的：实现时保持简单、直接，优先复用现有模块，不为假想的通用性增加抽象层或防御代码。

技术栈：Nuxt 4、Nuxt UI v4、Nuxt Hub、Drizzle ORM + SQLite/Cloudflare D1、Tailwind CSS v4、TypeScript 6。

## 功能

功能编号用于和下面的目录树对应，目录树中的每个源码文件都标注了所属功能编号。

- **F1 密码登录**：单用户密码登录。密码与 JWT 签名密钥同为环境变量 `AUTH_SECRET`，成功后设置 httpOnly cookie；除 `/api/auth/login` 外所有 API 都经中间件校验 token。
- **F2 书签数据与树构建**：一次拉取全部行，经 `sortBookmarks` 排序后用 `buildTree` 组装为左树的嵌套结构与右树的平铺列表。
- **F3 双栏视图与节点菜单**：左栏文件夹树（文件夹 + 挂在文件夹下的书签），右栏根级书签；节点行右侧三个点下拉菜单按节点类型分派，两棵树底部各有一个默认透明、hover 才显示的新建虚拟项。
- **F4 新建与编辑**：书签、文件夹各一个 create/edit 双模式弹窗；新建位置由 `nextPosition(parentId, type)` 给出，提交带 `submitting` 守卫防重复提交。
- **F5 删除**：书签/文件夹删除；非空文件夹拒绝删除；删除后把同组剩余项整段重编号。
- **F6 同级上移下移**：三个点菜单里的 Move Up / Move Down；处于分组首尾时对应项 disabled，请求在途时全部 disabled。
- **F7 排序位置模型**：`position` 的分组不变式、`nextPosition` 语义，以及统一的单条语句重编号 `renumberGroupQuery`。
- **F8 请求与错误处理**：`selfFetch` 统一弹错误 toast、401 跳登录；`useSelfFetch` 是其 useFetch 封装。
- **F9 数据库与迁移**：Drizzle schema、开发用本地 SQLite、生产用 Cloudflare D1、迁移文件。
- **F10 部署与备份**：`pnpm deploy` 构建 Workers 产物并应用 D1 迁移；`pnpm backup` 导出远程 D1 到 `db.sql`。
- **F11 工程配置与项目技能**：Nuxt / ESLint / TypeScript / Wrangler 配置、编辑器设置、Agent 技能锁定。

### 目录与功能对应

```text
.
├─ app/                            # F1–F8：Nuxt 前端
│  ├─ app.vue                      # F3：Nuxt 根组件，UApp 包裹 NuxtPage
│  ├─ assets/css/main.css          # F11：Tailwind CSS v4 + Nuxt UI 全局样式
│  ├─ components/
│  │  ├─ BookmarkFormModal.vue     # F4：书签新增/编辑弹窗（create/edit 双模式，submitting 防重复提交）
│  │  ├─ FolderFormModal.vue       # F4：文件夹新增/编辑弹窗（create/edit 双模式，submitting 防重复提交）
│  │  └─ LoginForm.vue             # F1：登录表单（UAuthForm，密码登录）
│  ├─ composables/
│  │  ├─ useBookmarks.ts           # F2：数据获取与 leftTree / rightTree 构建，并暴露 data 供注入
│  │  ├─ useBookmarkForm.ts        # F4：书签弹窗状态管理（openCreate/openEdit）
│  │  ├─ useFolderForm.ts          # F4：文件夹弹窗状态管理（openCreate/openEdit）
│  │  ├─ useDeleteBookmark.ts      # F5：书签删除（DELETE + refresh + toast）
│  │  ├─ useDeleteFolder.ts        # F5：文件夹删除（DELETE + refresh + toast）
│  │  ├─ useReorderBookmarks.ts    # F6/F7：move / canMove / nextPosition；在途时 canMove 恒 false
│  │  ├─ useBookmarkMenu.ts        # F3/F6：书签三个点菜单（打开/上移下移/编辑/删除）
│  │  └─ useFolderMenu.ts          # F3/F4/F6：文件夹三个点菜单（新建×2/上移下移/编辑/删除）
│  ├─ pages/
│  │  ├─ index.vue                 # F3：重定向到 /bookmarks
│  │  ├─ bookmarks.vue             # F3：主页面，组装全部 composable，item-trailing 插槽渲染三个点菜单
│  │  └─ login.vue                 # F1：登录页（redirect 查询参数回跳）
│  └─ utils/
│     ├─ bookmark-tree.ts          # F2/F7：sortBookmarks 排序与 buildTree 组树
│     ├─ selfFetch.ts              # F8：$fetch 实例（全局错误 toast + 401 跳转登录）
│     └─ useSelfFetch.ts           # F8：useFetch 封装（基于 selfFetch）
├─ server/                         # F1/F2/F4–F7/F9：Nitro 服务端
│  ├─ middleware/auth.ts           # F1：/api/* 校验 token，/api/auth/* 放行
│  ├─ api/auth/login.post.ts       # F1：POST /api/auth/login，校验密码并设置 httpOnly cookie
│  ├─ api/bookmarks/index.get.ts   # F2：GET /api/bookmarks，取全部行
│  ├─ api/bookmarks/index.post.ts  # F4：POST /api/bookmarks，创建书签/文件夹
│  ├─ api/bookmarks/[id].put.ts    # F4：PUT /api/bookmarks/:id，更新书签/文件夹
│  ├─ api/bookmarks/[id].delete.ts # F5/F7：DELETE /api/bookmarks/:id，删除 + 同组剩余项重编号
│  ├─ api/bookmarks/reorder.put.ts # F6/F7：PUT /api/bookmarks/reorder，同级整段重编号
│  ├─ db/schema.ts                 # F9：bookmarks 表定义（Drizzle ORM）
│  ├─ db/migrations/sqlite/        # F9：迁移 SQL 与 meta
│  └─ utils/
│     ├─ jwt.ts                    # F1：JWT 签发/验证（jose，密钥为 AUTH_SECRET）
│     └─ renumber.ts               # F7：renumberGroupQuery，单条语句把分组 position 重写为 1..n
├─ shared/types/db.ts              # F9：前后端共享类型（Bookmark, InsertBookmark）
├─ .agents/skills/                 # F11：nuxt-ui / cloudflare / wrangler 技能安装内容
├─ .vscode/settings.json           # F11：ESLint 保存自动修复、禁用 Prettier、Tailwind 提示
├─ public/
│  ├─ favicon.ico                  # F11：站点图标
│  └─ robots.txt                   # F11：爬虫规则
├─ .env.example                    # F11：环境变量模板（AUTH_SECRET）
├─ eslint.config.js                # F11：@antfu/eslint-config
├─ nuxt.config.ts                  # F11：模块（@nuxthub/core、@nuxt/ui）、hub.db=sqlite、routeRules
├─ opencode.json                   # F11：Nuxt UI MCP 配置
├─ package.json                    # F11：依赖与 dev/build/lint/typecheck/deploy 脚本
├─ pnpm-lock.yaml                  # F11：依赖锁定
├─ pnpm-workspace.yaml             # F11：workspace 配置
├─ skills-lock.json                # F11：Agent 技能版本锁定
├─ tsconfig.json                   # F11：TypeScript / Nuxt 工程引用
├─ wrangler.jsonc                  # F10：D1 绑定声明（binding 名 DB）
├─ AGENTS.md                       # F11：本文件，功能、目录与约束
└─ .gitignore                      # F11：忽略 .env、.data、.output、db.sql 等
```

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
| `pnpm generate:db` | Drizzle 数据库迁移生成         |
| `pnpm backup`      | 导出远程 D1 到 db.sql          |
| `pnpm deploy`      | 部署到 Cloudflare Workers + D1 |

- 包管理器为 `pnpm`（锁定在 pnpm-lock.yaml，workspace 配置在 pnpm-workspace.yaml）
- `pnpm dev` 启动后支持 HMR，修改前端代码无需重新构建或重启
- 本地 `AUTH_SECRET` 配置在 `.env`（已被 gitignore），模板见 `.env.example`
- 无测试框架，无 CI 配置

## API 端点

| 方法   | 路径                     | 说明                                                                                                                                                                    |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/login`        | 密码登录（body: password），成功设置 token cookie（httpOnly）                                                                                                           |
| GET    | `/api/bookmarks`         | 获取所有书签（按 position 排序）                                                                                                                                        |
| POST   | `/api/bookmarks`         | 创建书签/文件夹（body: name, type, position，数据库非空约束）                                                                                                           |
| PUT    | `/api/bookmarks/reorder` | 同级重排（body: parentId, type, ids），按 ids 顺序把该分组的 position 重写为 1..n；不校验 ids 覆盖度，由调用方保证传完整分组                                            |
| PUT    | `/api/bookmarks/:id`     | 更新书签/文件夹（parentId 不能等于自身 id；不存在返回 400）                                                                                                             |
| DELETE | `/api/bookmarks/:id`     | 删除；非空文件夹返回 400 'Folder is not empty'，不存在返回 400；删除与同组剩余项重编号在同一 `db.batch()` 中原子完成（重编号是单条语句，见 `server/utils/renumber.ts`） |

除 `/api/auth/login` 外所有 API 均需登录（`server/middleware/auth.ts` 校验 token）。`reorder` 是静态路由，优先于 `[id]` 动态路由匹配。

## 数据库

- 开发环境使用本地 SQLite（由 `@nuxthub/core` 自动处理），文件位于 `.data/db/sqlite.db`，无需配置环境变量
- 生产环境为 Cloudflare D1：构建时 `NITRO_PRESET=cloudflare_module` 使 `hub.db` 自动切换 `d1` driver
- D1 绑定在 `wrangler.jsonc` 中通过 `database_name` 按名声明（binding 名 `DB`，无需维护 UUID），构建时 nitro 合并进 `.output/server/wrangler.json`，并由 `@nuxthub/core` 自动补充 `migrations_table`/`migrations_dir`
- D1 binding 模式（driver `d1`）不需要 `NUXT_HUB_CLOUDFLARE_*` 环境变量（那是 `d1-http` driver 才需要）
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

历史分组的 position 可以有偏移或间隙；删除或移动后，目标 `(parentId, type)` 分组会归一化为 `1..n`。

## 前端架构约定

- **浅层封装**：书签/文件夹的**新增、编辑、删除**逻辑全部分离（useBookmarkForm / useFolderForm / useDeleteBookmark / useDeleteFolder），即使代码相似也不合并
- **单一职能**：数据（`useBookmarks`）、弹窗状态（`*Form`）、删除（`useDelete*`）、排序（`useReorderBookmarks`）、菜单（`*Menu`）各自独立，互不混合
- **依赖注入**：页面（bookmarks.vue）实例化 composable 后以参数注入菜单 composable（如 `useFolderMenu(bookmarkForm, folderForm, removeFolder, move, canMove)`），菜单内部不自行实例化状态类 composable
- **排序模型**：分组键为 `(parentId, type)`，同组内 `sortBookmarks` 恒定「文件夹优先」→「position 升序」，因此 UI 中一段连续可视区间恰好等于一个分组。客户端排序是唯一权威（`leftTree` / `rightTree` 都经 `sortBookmarks`），不依赖 `GET /api/bookmarks` 的返回顺序。移动**只做整段重编号**（按新顺序把 position 写回 `1..n`），**永不交换 position 值**——历史数据的 position 是全局计数器留下的，可能带偏移和间隙，交换语义未定义且无法自愈。新建位置由 `useReorderBookmarks` 的 `nextPosition(parentId, type)` 统一计算，它返回**可直接写入数据库的 position**（组内 `max(position) + 1`，空分组为 1），调用方（弹窗的 `nextPosition` prop）**不得再 `+1`**——位置计算只发生一次；编辑保留原 position。历史数据无需预先迁移，删除或移动时会将目标分组整段归一化为 `1..n`
- **重编号实现**：必须走 `server/utils/renumber.ts` 的 `renumberGroupQuery(parentId, type, orderedIds)`，它用 SQLite JSON1 的 `json_each` 把顺序当参数传入，**语句数恒为 1、绑定参数为常数个且最多 4 个，与分组大小 N 无关**。不要改回「每行一条 UPDATE」（随 N 线性增长，会撞 D1 每批语句数限制），也不要改成「单条 CASE」（要 2N 个绑定参数，会撞 D1 每查询 100 个绑定参数的限制）。**调用方必须传入该分组的完整成员**——服务端不做覆盖度校验，漏传的行不会被更新
- **菜单求值成本**：三个点菜单的 `items` 在渲染期求值，`canMove` 因此对每个节点每次渲染被调用两次。`useReorderBookmarks` 的 `located` computed 把 `id → { item, group, index }` 预先算好，`locate` 只做 Map 查找；不要在 `canMove` / `locate` 内重排或扫描全量数据（348 行时每渲染会多做约 16ms）
- **错误处理（fail loudly）**：`selfFetch` 已在全局统一弹出错误 toast，业务代码**不写 try/catch 包裹请求**；失败时异常自然传播（unhandled rejection 即预期表现），成功路径（emit/refresh/toast）不执行
- **例外**：`server/utils/jwt.ts` 的 `verifyToken` 用 try/catch 将校验失败转为布尔值（预期输入判断，非意外错误）

## Nuxt UI

- Nuxt UI MCP 已配置在 `opencode.json` 中，可直接查询组件文档
- 图标使用 `@iconify-json/lucide` 集，格式如 `i-lucide-*`
- 项目实际使用的组件：`UApp`、`UModal`、`UForm`、`UTree`、`UDropdownMenu`、`UInput`、`UButton`、`UFormField`、`UAuthForm`
- `UTree` 没有拖拽能力（底层 Reka `TreeRoot` 亦无），排序只通过菜单上移/下移实现
- Toast 通过 Nuxt UI 的 `useToast()` composable 调用，没有直接渲染 `UToast` 组件

## 项目技能

- `skills-lock.json` 锁定 `nuxt-ui`、`cloudflare`、`wrangler` 三个项目技能，安装内容位于 `.agents/skills/`
- Nuxt UI 组件、表单和界面任务使用 `nuxt-ui` 技能
- Cloudflare Workers/D1 开发使用 `cloudflare` 技能；运行或修改 Wrangler 命令前使用 `wrangler` 技能

## 部署

- 使用 Cloudflare Workers + D1 部署
- D1 绑定在 `wrangler.jsonc` 中声明，构建时 nitro 合并到 `.output/server/wrangler.json`
- 部署命令 `pnpm deploy` 通过 `cross-env` 跨平台设置 `NITRO_PRESET=cloudflare_module`，然后执行：构建 Nitro preset `cloudflare_module` → `wrangler deploy --keep-vars` → 应用 D1 迁移（`wrangler --config .output/server/wrangler.json d1 migrations apply DB --remote`）
- `wrangler deploy` 从根目录运行，经构建生成且已被 gitignore 的 `.wrangler/deploy/config.json` 重定向到 `.output/server/wrangler.json`；迁移命令需显式 `--config .output/server/wrangler.json`（`migrations_dir` 为相对该文件的 `db/migrations/sqlite/`）
- 部署前提：wrangler 已认证（`wrangler login`，或设置 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` 环境变量）
- `AUTH_SECRET` 需一次性执行 `wrangler secret put AUTH_SECRET` 设置生产密码（与本地 `.env` 中的值独立，`--keep-vars` 不会覆盖 secrets）
- `pnpm backup` 导出远程 D1 到 `db.sql`（已被 gitignore），经 binding `DB` 从根 `wrangler.jsonc` 解析库名，不依赖构建产物

## 约束

- 这是个人自用项目：单用户、单浏览器操作，数据来源和使用流程都在自己掌控内。按现有代码的写法实现，**不要为假想场景增加防御代码、重复校验、无意义的状态分支或多余的 `try/catch`**；只在真实的外部边界处理错误。
- 优先使用现有技术栈和模块，在现有文件中完成修改；保持实现简单、直接、可读，优先让正常流程直观，不为小功能增加额外抽象、通用层或复杂架构。
- 遵循现有命名、目录职责和数据流，不擅自改变已有 API、配置字段或模块边界。
- 页面请求优先走 `selfFetch` / `useSelfFetch`；样式使用 Tailwind class 与 Nuxt UI 的 `ui` 属性。
- `try/finally` 是允许的：它没有 `catch`，不吞异常，仅用于复位状态（如 `moving`、`submitting`），不违反 fail-loudly 约定。
- ESLint 使用 `@antfu/eslint-config`（已启用 formatters 与 vue 规则），不支持 Prettier（`.vscode/settings.json` 已禁用）；style/format 类规则与引号、分号由 ESLint 自动修复，保存时自动执行。
- `pnpm-workspace.yaml` 有 5 个预存 lint 错误（`shellEmulator` / `trustPolicy` / `minimumReleaseAgeExcludePrune` / `yaml/sort-keys` / `yaml/blank-lines`），属配置问题非代码问题，可忽略。
- 每次修改代码后必须执行 `pnpm lint` 和 `pnpm typecheck`；除上述预存错误外，不得新增错误。
- 禁止使用 `pnpm lint:fix`；只用 `pnpm lint` 检查，并且只修复本次修改相关代码的错误，与本次无关的预存错误忽略。
- **代码修改后必须同步更新本文件**：新增、修改或删除文件时（组件、composable、页面、API、工具函数、配置等），立即更新**功能**、**目录与功能对应**、**API 端点**等对应章节，确保文档始终反映最新代码。
- 不将构建产物、缓存、依赖与本地数据纳入 Git（`.output`、`.nuxt`、`.data`、`node_modules`、`.env`、`db.sql`、`.wrangler`）。
