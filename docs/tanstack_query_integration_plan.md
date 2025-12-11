## 更新后的 TanStack Query 集成方案

### 一、修正点

#### 1. Provider 文件位置和命名
- 创建 `components/providers/query-provider.tsx`（而非 `app/providers.tsx`）
- 与 `theme-provider.tsx` 保持一致的结构

#### 2. Provider 嵌套
- 多个 Provider 嵌套是标准做法
- 在 `layout.tsx` 中嵌套：
  ```tsx
  <ThemeProvider>
    <QueryProvider>
      {children}
    </QueryProvider>
  </ThemeProvider>
  ```

#### 3. 补充遗漏的 API

需要创建的 Query Hooks：

1. `/api/parse` - PDF 解析
   - `useParsePdfMutation()` - 上传 PDF 文件并解析

2. `/api/resume` - 保存简历
   - `useUploadResumeMutation()` - 保存简历文本到 S3

3. `/api/match` - 统一匹配 API
   - `useMatchSummaryMutation()` - 获取匹配摘要
   - `useMatchDetailsMutation()` - 获取匹配详情

4. `/api/resume-text` - 获取简历文本
   - `useResumeText(resumeId)` - 获取简历文本（已有，需确认）

### 二、更新后的完整方案

#### 阶段 1：基础配置

1. 安装依赖
   ```bash
   pnpm add @tanstack/react-query
   pnpm add -D @tanstack/react-query-devtools
   ```

2. 创建 QueryClient 工具
   - `lib/react-query/get-query-client.ts`

3. 创建 QueryProvider 组件
   - `components/providers/query-provider.tsx`（Client Component）
   - 使用 Next.js App Router 模式

4. 集成到 Root Layout
   - 在 `app/layout.tsx` 中嵌套到 `ThemeProvider` 内部

#### 阶段 2：API Client 封装

创建以下 API 封装：

1. `lib/api/jobs.ts`
   - `fetchJobs()` - 获取所有职位
   - `fetchJobById(id)` - 获取单个职位详情
   - `fetchJobCategories()` - 获取职位分类

2. `lib/api/resume.ts`
   - `parsePdf(file: File)` - 解析 PDF
   - `uploadResume(resumeText: string)` - 上传简历
   - `fetchResumeText(resumeId: string)` - 获取简历文本

3. `lib/api/match.ts`
   - `matchSummary(params)` - 匹配摘要
   - `matchDetails(params)` - 匹配详情
   - `matchBatch(params)` - 批量匹配（保留现有逻辑）

#### 阶段 3：Query Hooks 创建

1. `hooks/queries/useJobs.ts`
   - `useJobs(filters?)`
   - `useJobById(id)`
   - `useJobCategories()`

2. `hooks/queries/useResume.ts`
   - `useResumeText(resumeId)` - Query
   - `useParsePdfMutation()` - Mutation
   - `useUploadResumeMutation()` - Mutation

3. `hooks/queries/useMatch.ts`
   - `useMatchSummaryMutation()` - Mutation
   - `useMatchDetailsMutation()` - Mutation
   - `useBatchMatching()` - 重构现有 hook（使用 `useMutation`）

4. Query Key 管理
   - `lib/react-query/query-keys.ts`

#### 阶段 4：组件迁移

1. Server Components
   - `app/jobs/page.tsx` - 使用 `prefetchQuery` + `HydrationBoundary`

2. Client Components
   - `JobsListClient.tsx` - 使用 `useJobs()` 和 `useResumeText()`
   - `JobDetailClient.tsx` - 使用 `useJobById()`
   - `app/upload/page.tsx` - 使用 `useParsePdfMutation()` 和 `useUploadResumeMutation()`
   - `useBatchMatching.ts` - 重构为使用 `useMutation`
   - `useMatchData.ts` - 重构为使用 `useMatchSummaryMutation()` 和 `useMatchDetailsMutation()`

### 三、文件结构

```
components/providers/
  ├── theme-provider.tsx (已有)
  └── query-provider.tsx (新增)

lib/
  ├── api/
  │   ├── jobs.ts (新增)
  │   ├── resume.ts (新增)
  │   └── match.ts (新增)
  └── react-query/
      ├── get-query-client.ts (新增)
      └── query-keys.ts (新增)

hooks/
  ├── queries/
  │   ├── useJobs.ts (新增)
  │   ├── useResume.ts (新增)
  │   └── useMatch.ts (新增)
  ├── useBatchMatching.ts (重构)
  └── useMatchData.ts (重构)
```

### 四、特殊处理

1. `/api/parse` - 文件上传
   - 使用 `FormData`，Mutation 需要特殊处理
   - 可能需要 `useMutation` 自定义 `mutationFn`

2. `/api/match` - 统一匹配 API
   - 支持 `type=summary` 和 `type=details`
   - 两个独立的 Mutation hooks

3. `useBatchMatching` - 渐进式结果
   - 保持渐进式更新逻辑
   - 使用 `useMutation` 但自定义更新策略
   - 保持 sessionStorage 持久化

### 五、实施顺序

1. 安装依赖 + 创建基础配置
2. 创建 QueryProvider 并集成到 layout
3. 创建 API Client 封装（jobs, resume, match）
4. 创建 Query Hooks（按优先级）
5. 迁移组件（先简单后复杂）
