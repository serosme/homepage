# Homepage Agent Instructions

个人自用的 Nuxt 4 书签管理应用：单用户密码登录，左栏文件夹树 + 右栏根级书签，节点行右侧三个点菜单负责新建、编辑、删除和同级上移下移。

这是个人项目，使用场景、数据来源和操作流程都是明确且受控的：实现时保持简单、直接，优先复用现有模块，不为假想的通用性增加抽象层或防御代码。

技术栈：Nuxt 4、Nuxt UI v4、Nuxt Hub、Drizzle ORM + SQLite/Cloudflare D1、Tailwind CSS v4、TypeScript 6。

## 功能

功能编号用于和下面的目录树对应，目录树中的每个源码文件都标注了所属功能编号。

- **F1 密码登录**：单用户密码登录。密码与 JWT 签名密钥同为环境变量 `AUTH_SECRET`，成功后设置 httpOnly cookie；除 `/api/auth/login` 外所有 API 都经中间件校验 token。
- **F2 书签数据与树构建**：一次拉取全部行，经 `sortBookmarks` 排序后用 `buildTree` 组装为左树的嵌套结构与右树的平铺列表。
- **F3 双栏视图与节点菜单**：左栏文件夹树（文件夹 + 挂在文件夹下的书签），右栏根级书签；节点行 hover 时显示三个点，菜单通过右键节点/空白区域打开，按节点类型分派，两棵树底部各有一个默认透明、hover 才显示的新建虚拟项。
- **F4 新建与编辑**：书签、文件夹各一个 create/edit 双模式弹窗；新建位置由 `nextPosition(parentId, type)` 给出，提交带 `submitting` 守卫防重复提交。
- **F5 删除**：书签/文件夹删除；非空文件夹拒绝删除；删除后把同组剩余项整段重编号。
- **F6 同级上移下移**：三个点菜单里的 Move Up / Move Down；处于分组首尾时对应项 disabled，请求在途时全部 disabled。
- **F7 排序位置模型**：`position` 的分组不变式、`nextPosition` 语义，以及统一的单条语句重编号 `renumberGroupQuery`。
- **F8 请求与错误处理**：`selfFetch` 统一弹错误 toast、401 跳登录；`useSelfFetch` 是其 useFetch 封装。
- **F9 数据库与迁移**：Drizzle schema、开发用本地 SQLite、生产用 Cloudflare D1、迁移文件。
- **F10 部署与备份**：`pnpm deploy` 构建 Workers 产物并应用 D1 迁移；`pnpm backup` 导出远程 D1 到 `db.sql`。
- **F11 文件树**：使用 NuxtHub Blob Storage（本地 FS driver、生产 Cloudflare R2 driver），通过对象路径构建左侧完整文件树（文件夹与文件统一使用前端 lucide 图标），支持文件夹、文件和空白处右键菜单，空白处可上传文件；文件可下载、删除，文件夹可删除并往里上传（没有整夹下载、也没有重命名），上传弹窗可选择文件并填写路径前缀（默认取所在文件夹）并显示分片上传进度，右侧预留预览窗格；页面留白与双栏比例复用书签页的 `pl-[28vw] pr-[22vw] py-[10vh]`。
- **F12 工程配置与项目技能**：Nuxt / ESLint / TypeScript / Wrangler 配置、编辑器设置、Agent 技能锁定。

### 目录与功能对应

```text
.
├─ app/                            # F1–F8：Nuxt 前端
│  ├─ app.vue                      # F3：Nuxt 根组件，UApp 包裹 NuxtPage
│  ├─ assets/css/main.css          # F12：Tailwind CSS v4 + Nuxt UI 全局样式
│  ├─ components/
│  │  ├─ FileDeleteModal.vue          # F11：文件/文件夹删除确认弹窗（submitting 防重复提交）
│  │  ├─ FileTree.vue                 # F11：Blob 文件树节点展示，文件夹和文件行使用右键菜单，点击样式与书签树一致
│  │  ├─ FileUploadModal.vue         # F11：上传弹窗（选择文件 + 路径前缀 + 分片上传进度条）
│  │  ├─ BookmarkFormModal.vue     # F4：书签新增/编辑弹窗（create/edit 双模式，submitting 防重复提交）
│  │  ├─ FolderFormModal.vue       # F4：文件夹新增/编辑弹窗（create/edit 双模式，submitting 防重复提交）
│  │  └─ LoginForm.vue             # F1：登录表单（UAuthForm，密码登录）
│  ├─ composables/
│  │  ├─ useFiles.ts                 # F11：获取 Blob 文件树与分片上传（带进度回调）
│  │  ├─ useFileMenu.ts              # F11：文件/文件夹右键菜单（下载、删除，文件夹上传）
│  │  ├─ useFileUploadForm.ts        # F11：上传弹窗状态（open + defaultPath）
│  │  ├─ useFileDeleteForm.ts        # F11：删除确认弹窗状态（open + node）
│  │  ├─ useDeleteFile.ts            # F11：文件/文件夹删除（DELETE + toast，刷新由页面负责）
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
│  │  ├─ bookmarks.vue             # F3：主页面，组装全部 composable，节点 hover 显示三个点，节点及空白处右键打开菜单，右下角链接到 /files
│  │  ├─ files.vue                 # F11：文件树与右侧预留空白预览区，右下角链接回 /bookmarks
│  │  └─ login.vue                 # F1：登录页（redirect 查询参数回跳）
│  └─ utils/
│     ├─ bookmark-tree.ts          # F2/F7：sortBookmarks 排序与 buildTree 组树
│     ├─ selfFetch.ts              # F8：$fetch 实例（全局错误 toast + 401 跳转登录）
│     └─ useSelfFetch.ts           # F8：useFetch 封装（基于 selfFetch）
├─ server/                         # F1/F2/F4–F7/F9/F11：Nitro 服务端
│  ├─ middleware/auth.ts           # F1：/api/* 校验 token，/api/auth/* 放行
│  ├─ api/auth/login.post.ts       # F1：POST /api/auth/login，校验密码并设置 httpOnly cookie
│  ├─ api/bookmarks/index.get.ts   # F2：GET /api/bookmarks，取全部行
│  ├─ api/bookmarks/index.post.ts  # F4：POST /api/bookmarks，创建书签/文件夹
│  ├─ api/bookmarks/[id].put.ts    # F4：PUT /api/bookmarks/:id，更新书签/文件夹
│  ├─ api/bookmarks/[id].delete.ts # F5/F7：DELETE /api/bookmarks/:id，删除 + 同组剩余项重编号
│  ├─ api/bookmarks/reorder.put.ts # F6/F7：PUT /api/bookmarks/reorder，同级整段重编号
│  ├─ api/files/tree.get.ts        # F11：GET /api/files/tree，读取 Blob 全部对象并构建文件树
│  ├─ api/files/multipart/         # F11：分片上传路由 [action]/[...pathname]，交给 blob.handleMultipartUpload
│  ├─ api/files/download.get.ts    # F11：GET /api/files/download?path=，下载 Blob 文件
│  ├─ api/files/delete.delete.ts   # F11：DELETE /api/files/delete?path=，删除单个文件或整个文件夹前缀
│  ├─ db/schema.ts                 # F9：bookmarks 表定义（Drizzle ORM）
│  ├─ db/migrations/sqlite/        # F9：迁移 SQL 与 meta
│  └─ utils/
│     ├─ jwt.ts                    # F1：JWT 签发/验证（jose，密钥为 AUTH_SECRET）
│     ├─ blob-files.ts             # F11：listBlobs，拉全量对象后按前缀过滤（绕开 fs driver 的 prefix 目录语义）
│     ├─ blob-tree.ts              # F11：buildFileTree，把 Blob 对象路径组装为文件树
│     └─ renumber.ts               # F7：renumberGroupQuery，单条语句把分组 position 重写为 1..n
├─ shared/types/db.ts              # F9：前后端共享类型（Bookmark, InsertBookmark）
├─ shared/types/files.ts           # F11：文件树节点类型（FileTreeNode）
├─ docs/bookmark-slim-backlog.md   # F2/F4：书签与认证侧可精简项、保留项（本轮只记录不改）
├─ docs/download-notes.md          # F11：下载方案的取舍（64MB 上限的由来、被放弃的流式/预签名方案）
├─ .agents/skills/                 # F12：nuxt-ui / cloudflare / wrangler 技能安装内容
├─ .vscode/settings.json           # F12：ESLint 保存自动修复、禁用 Prettier、Tailwind 提示
├─ public/
│  ├─ favicon.ico                  # F12：站点图标
│  └─ robots.txt                   # F12：爬虫规则
├─ .env.example                    # F12：环境变量模板（AUTH_SECRET）
├─ eslint.config.js                # F12：@antfu/eslint-config
├─ nuxt.config.ts                  # F12：模块（@nuxthub/core、@nuxt/ui）、hub.db=sqlite、hub.blob、routeRules
├─ opencode.json                   # F12：Nuxt UI MCP 配置
├─ package.json                    # F12：依赖与 dev/build/lint/typecheck/deploy 脚本
├─ pnpm-lock.yaml                  # F12：依赖锁定
├─ pnpm-workspace.yaml             # F12：workspace 配置
├─ skills-lock.json                # F12：Agent 技能版本锁定
├─ tsconfig.json                   # F12：TypeScript / Nuxt 工程引用
├─ wrangler.jsonc                  # F10：绑定声明（D1 名 DB、R2 名 BLOB）
├─ AGENTS.md                       # F12：本文件，功能、目录与约束
└─ .gitignore                      # F12：忽略 .env、.data、.output、db.sql 等
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

| 方法   | 路径                                          | 说明                                                                                                                                                    |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/login`                             | 密码登录（body: password），成功设置 token cookie（httpOnly）                                                                                           |
| GET    | `/api/bookmarks`                              | 获取所有书签（按 position 排序）                                                                                                                        |
| POST   | `/api/bookmarks`                              | 创建书签/文件夹（body: name, type, position，数据库非空约束）                                                                                           |
| PUT    | `/api/bookmarks/reorder`                      | 同级重排（body: parentId, type, ids），按 ids 顺序把该分组的 position 重写为 1..n；不校验 ids 覆盖度，由调用方保证传完整分组                            |
| PUT    | `/api/bookmarks/:id`                          | 更新书签/文件夹（parentId 不能等于自身 id；不存在时更新 0 行）                                                                                          |
| DELETE | `/api/bookmarks/:id`                          | 删除；非空文件夹返回 400 'Folder is not empty'；删除与同组剩余项重编号在同一 `db.batch()` 中原子完成（重编号是单条语句，见 `server/utils/renumber.ts`） |
| GET    | `/api/files/tree`                             | 读取 NuxtHub Blob Storage 的全部对象，按 `/` 分隔构建完整文件夹/文件树                                                                                  |
| POST   | `/api/files/multipart/[action]/[...pathname]` | 分片上传：action 为 create / upload / complete / abort，由客户端 `useMultipartUpload` 调用；分片按片缓冲，不受 128MB 内存与单请求 100MB 限制            |
| GET    | `/api/files/download?path=`                   | 下载指定 Blob 文件，响应以附件形式返回                                                                                                                  |
| DELETE | `/api/files/delete?path=`                     | 删除 Blob：`path` 以 `/` 结尾（文件夹）时用 `listBlobs` 取出整棵子树再一次性 `blob.del`，否则删除单个文件                                               |

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

## 文件存储

- 文件对象走 NuxtHub Blob Storage（`hub.blob: true`），服务端统一使用 `@nuxthub/blob` 的 `blob.list / get / put / delete`，**不直接读取 `event.context.cloudflare.env` 下的 R2 binding**
- driver 由 `@nuxthub/core` 按 hosting 自动选择：本地 `pnpm dev` 使用 `fs` driver（目录为 `hub.dir` 下的 `blob/`），Cloudflare 构建使用 `cloudflare-r2` driver（binding 名 `BLOB`）
- `wrangler.jsonc` 声明 R2 绑定时必须使用 binding 名 `BLOB`，与 driver 默认 binding 一致；否则生产环境会报 `R2 binding "BLOB" not found`
- 本地 Blob 目录不会自动同步到线上 R2，两边数据独立
- `server/utils/blob-tree.ts` 的 `buildFileTree` 只负责把 `BlobObject.pathname` 按 `/` 拆成文件树，不接触具体 driver；前端 `FileTree.vue` 统一给文件使用 `i-lucide-file`、文件夹使用 `i-lucide-folder`，并为文件和文件夹提供右键菜单
- 文件图标不区分扩展名，统一由前端 `FileTree.vue` 渲染 `i-lucide-file`
- 上传走**分片上传**：服务端是 `server/api/files/multipart/[action]/[...pathname].ts`，内容就是 `blob.handleMultipartUpload(event)`；客户端用官方 `useMultipartUpload` 按 `/create` → `/upload/<pathname>` → `/complete/<pathname>` 调用，`pathname` 由 `prefix` + 文件名拼出。分片按片缓冲（`streamToArrayBuffer(stream, contentLength)`），所以内存占用约等于一片（10MB），**不受 Workers 128MB 内存上限和单请求 100MB 体积上限约束**，比旧的「整个请求体流式写入」更适合大文件，并且自带进度、失败重试（`maxRetry`）和 `abort()`
- **不要退回单请求整体上传**：不论是 `readMultipartFormData`（整份读进内存，峰值是文件大小的 2~3 倍，几十 MB 就会触发 Workers 的 128MB 限制、报[错误 1102](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/)），还是「把请求体流交给 `blob.put`」（会报 `Provided readable stream must have a known length`，必须补 `FixedLengthStream`）——这两条路都已经淘汰，它们只在本地 Node 下看不出问题
- `useMultipartUpload` 内部使用自己的 `ofetch`，**不走 `selfFetch`**；上传失败由 multipart composable 自身处理，不额外挂载全局 Toast 回调
- **`completed` 只 resolve 不 reject**：`useMultipartUpload` 在重试耗尽后是 `Promise.all` 里 catch 掉再 `return`，所以成功 resolve `complete` 的返回值、失败 resolve `undefined`。`useFiles.upload` 必须判空并抛错，否则上传失败会被当成成功（弹窗照常关闭并 refresh）
- **同名文件默认覆盖**：multipart 上传不在 `create` 阶段检查目标是否已存在；`complete` 会直接写入同名 key 并覆盖原文件
- **并发策略：本地与线上统一串行**（`concurrent: 1`）。本地 fs driver 的分片状态是本地 JSON 文件，每个分片请求都要「读它 → 改 → 整个写回」，并发会出现三类问题：多个请求同时读改写同一文件互相覆盖、`writeFile` 先截断再写导致别的请求读到半截 JSON（`JSON.parse` 失败）、失败重试把同一分片号重新入队造成重复上传——任一条都会报 `Multipart upload not found`（这个错名有误导性，它同时覆盖了「文件不存在」和「JSON 解析失败」）。线上 R2 虽由服务端维护分片状态，但为保持两端上传参数与并发行为一致，也使用串行上传。
- **本地中断上传会留残留**：fs driver 的分片元数据就写在 blob 目录里（`<pathname>.mpu.<uploadId>.json` 和 `.mpu.<uploadId>/分片文件`），而 `walkDir` 把它们当普通对象列出来——本地 `pnpm dev` 中途关页面／刷新会让这些垃圾节点出现在文件树里并永久保留（正常 complete 会删掉，重试耗尽时库会 `abort`）。线上 R2 的分片状态在服务端，没有这些文件；清理就是手动删掉 `.data/blob` 下对应的 `*.mpu.*.json` 和 `.mpu.*` 目录
- **`partSize × concurrent` 就是服务端内存峰值**：`createGenericMultipartUploadHandler` 对每个分片做 `streamToArrayBuffer(stream, contentLength)`，整片进内存。当前 10MB × 5 = 50MB，Workers 上限 128MB（per-isolate，还要装应用本身和其它请求）。**别把这两个值一起放大**，例如 50MB × 3 就是 150MB，会直接撞内存上限报 1102；要提速优先调 `partSize`（重传代价和内存都线性上涨，需要权衡），并发上限别超过 5
- **不要用服务端 prefix 前缀列举**：`server/utils/blob-files.ts` 的 `listBlobs(prefix)` 是「拉全量 + 内存按前缀过滤」。`@nuxthub/blob` 的 fs driver 把 `list` 的 prefix 当目录名处理（`join(dir, prefix)`），传文件 key 会以「读目录」失败返回空列表，传 `docs/` 这类带斜杠的目录也不一定命中，结果是删除「接口成功但什么都没发生」。前缀过滤统一走 `listBlobs(prefix)`（内部就是「拉全量 + 内存过滤」两步，不再单独暴露 `listAllBlobs` / `filterByPrefix`），前缀尾部斜杠会被剥掉再比较，并只匹配 `${base}/` 下的对象，避免误匹配同名文件 `docs` 或 `docs-other.txt`；`tree.get.ts` 直接用 `listBlobs('')`，`delete.delete.ts` 用 `listBlobs(path)` 取整棵子树；R2 driver 的 `list({ prefix })` 本身是正常的，但为了两端一致也走同一个函数
- 下载走 `server/api/files/download.get.ts`：`blob.head` 取大小（文件不存在时它自己抛 404）→ 超过 `MAX_SIZE`（64MB）返回 413 → `blob.serve(event, path)` 流式返回（内部读成 ArrayBuffer 后包成 ReadableStream，返回给 h3 时 `isStream` 认 `pipeTo`）。**`Content-Disposition` 的头值只能是 latin1**，中文名直接写进 `filename=` 会让 Node / Workers 的头校验抛 `ERR_INVALID_CHAR`、整个下载 500，所以 ASCII 名回退一份、真正的名字走 RFC 5987 的 `filename*=UTF-8''`
- **下载的 64MB 上限是 NuxtHub API 的边界，不是随手设的**：`blob.get` / `blob.serve` / `driver.get` / `driver.getArrayBuffer` 全都是整份读——fs 和 R2 driver 都没有流式读接口，所以单个下载请求的峰值内存是 O(文件大小)。`serve` 已经把「返回 Blob 再被 h3 复制一份」的 2× 降到 1×，但线上 isolate 上限仍是 128MB，留出运行时余量后取 64MB；本地 `pnpm dev` 同样受限，为的是本地和线上行为一致。**要下任意大小只能绕过 NuxtHub 直读 R2 binding**（`R2ObjectBody.body` 是 ReadableStream），那会让本地（fs）和线上走两条不同实现、行为可能不一致（内容类型来源、404 语义、路径解码都不同），这一点已明确放弃——见 `docs/download-notes.md`
- 删除走 `server/api/files/delete.delete.ts`：key 以 `/` 结尾（文件夹）时用 `listBlobs(path)` 收集整棵子树再一次性 `blob.del(keys)`，否则直接 `blob.del(path)`；两个 driver 的 delete 都会忽略不存在的 key，所以不做存在性校验（删不存在的路径是幂等的，个人单用户也不需要「别人先删了」这种防御）。handler 不写 return：Nitro 用 `preemptive` router，`undefined` 会被转成 `null` → 204。`useDeleteFile.remove(path)` 只负责发请求和 toast，**不在内部调 `refresh`**——刷新由页面在 `@deleted` 时做一次（`refresh` 由 `useFetch` 同一 key 去重，重复调用会取消其中一个请求并抛出 `AbortError: AsyncData request cancelled by deduplication` 被全局 toast 弹出来）
- 删除确认弹窗（`FileDeleteModal.vue`）按 `node.type` 显示「删除文件夹 / 删除文件」，文件夹额外提示会连带删除内部文件，提交带 `submitting` 守卫；菜单状态由 `useFileDeleteForm`（`open + node`）持有，与上传弹窗的 `useFileUploadForm` 同构
- 上传弹窗（`FileUploadModal.vue`）收文件 + 路径前缀 + 上传进度条。最终 key 是 `prefix/文件名`；路径为空就是根目录；在文件夹里上传时路径默认是该文件夹的 `key`，用户可以继续往后追加一层（如 `documents/photos`），**新增的层不需要预先存在**，上传后自然会出现在树里——这就是替代「新建文件夹」的做法。上传期间路径输入与文件选择都 disabled，避免中途改 key
- 前端 `useFiles` 的 `upload(key, file, onProgress)` 把 key 的目录部分交给 `useMultipartUpload` 的 `prefix`（`key.slice(0, -文件名)`），文件本体直接用 `File`——create 内部就是按 `file.name` 拼 pathname，不需要再包一层 `new File`；进度的 `watch(progress)` 建在事件处理器的调用栈里（不在 setup 作用域），不会随组件销毁自动停止，所以 `upload()` 里用 `try/finally` 手动 `stop()`；库上报的是「已完成片数 / 总片数」且先赋值再 `push`（滞后一片），要按 `chunks` 换算成正在传的那一片，否则小于一片的文件全程 0%、多片文件最多停在 `(n-1)/n`；上传弹窗通过 `upload` prop 注入，**不要在弹窗里再调一次 `useFiles()`**——那会在同一 key 上重复发起 `useSelfFetch('/api/files/tree')`，Nuxt 去重取消其中一个请求并抛 `AbortError: AsyncData request cancelled by deduplication` 并被全局 toast 弹出来
- 右键菜单靠 token class 定位节点：`UTree` 只把 `item.class` 透传到带 `data-slot="link"` 的元素上、不转发任意属性，所以 `FileTree.vue` 的 `buildTreeItems` 组树时给每个节点挂 `file-node-<n>` 类并同时建 `token → node` 的 Map，`@contextmenu` 里 `closest('[data-slot="link"]')` 取类名再查 Map（拿不到类名就当成空白处，弹根级菜单）；升级 Nuxt UI 时要重新核对 `item.class` 是否仍落在 link 元素上
- `files.vue` 的文件树区域铺满左侧栏并支持空白处右键上传，右侧是**预留的空白预览区**（还没有选中/预览逻辑，不维护 selected 状态）；页面用 `flex h-screen`（而不是书签页的 `min-h-screen flex`）——树要撑满视口高度，下方空白处才能右键上传，所以子元素要用 `h-full`；`FileTree` 的 `items` 收 `TreeItem[]`，只负责展示与右键菜单，不向外抛选中事件
- 服务端不校验 prefix 是否存在，也不校验它是不是已存在的目录（只拦同名文件）

## 前端架构约定

- **文案语言与页面导航**：书签页菜单、弹窗和提示使用英文；文件树页菜单、弹窗等界面文案使用中文，但所有 Toast 提示统一使用英文；`/files` 没有全局导航，两页右下角各有一个 `fixed bottom-4 right-4` 的仅图标 `UButton to=...` 链接互相跳转（书签页文件树图标 → `/files`，文件页书签图标 → `/bookmarks`）
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
- R2 bucket 也要先建：`wrangler r2 bucket create homepage-files`（`wrangler.jsonc` 的 `r2_buckets` 按名绑定到 `BLOB`，bucket 不存在时部署会报绑定解析失败）；它是生产环境的文件存储，本地 `.data/blob` 不会同步过去
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
