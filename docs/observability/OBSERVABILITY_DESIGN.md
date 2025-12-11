# ResumeMatch Pro 可观测性设计方案（Observability Design）

本文档描述 ResumeMatch Pro 在**前端与后端的日志记录、错误监控与问题排查**方面的整体设计方案。

**设计背景：**
- 项目当前定位为**面试展示作品**，重点展示工程化思维和全栈能力
- 无用户注册/登录系统，需要设计匿名用户标识体系
- 未来计划部署到 **AWS Amplify + CloudWatch**

---

## 实施策略（分阶段）

本方案分为三个阶段实施，当前重点在 **MVP 版本**：

### 阶段 1：MVP 版本（当前实施，预计 8.5-10.5 小时）

**目标：** 满足基本排障需求，展示工程化思维，面试时可演示

**实施范围：**
- ✅ **标识体系**：anonymousId（必需）+ requestId（必需）
- ✅ **前端监控**：Sentry 全局错误捕获 + 关键 breadcrumbs（5-6 个）
- ✅ **后端日志**：统一 logger + **本地文件输出** + 核心流程监控
- ✅ **后端 Sentry**：全局错误处理 + 异常上报
- ✅ **设计文档**：完整方案（作为设计能力展示）

**核心监控场景（同等优先级）：**
1. **批量匹配**（用户第一印象，决定是否继续使用）
2. **单个匹配 - Scoring 分支**（快速评分，< 5s）
3. **单个匹配 - Details 分支**（深度分析，10-60s，性能瓶颈）
4. **简历上传**（入口）

### 阶段 2：增强版（用户量增长后）

**新增内容：**
- sessionId（会话级标识）
- 批次级监控（批量匹配的每一批的详细日志）
- 缓存命中率趋势统计和告警
- 详情页场景细分（A/B 场景日志链路）
- 性能基线和异常告警

### 阶段 3：完整版（产品化运营）

**新增内容：**
- 部署到 AWS Amplify + CloudWatch
- 接入 CloudWatch RUM（前端性能监控）
- 自动化性能回归检测
- 用户行为分析和漏斗
- 告警与值班机制

---

## 1. 目标与原则

### 1.1 核心目标

- 能快速回答：**发生了什么问题？在哪一步？影响了谁？怎么复现？**
- 对前端和后端都有基本的监控能力，**前端偏重（体现前端工程化能力）**
- 与未来的 **AWS Amplify + CloudWatch** 部署方案自然衔接
- **开发阶段友好**：本地日志文件 + 终端输出，方便查询和持久化

### 1.2 设计原则

- **轻量但结构化**：统一的日志格式、统一的标识体系
- **前后端可串联**：从前端错误（Sentry）可以跳到后端日志（文件/CloudWatch）继续排查
- **隐私优先**：不在日志中存储简历原文、个人敏感信息，只存必要的摘要和业务 ID
- **抓住重点**：重点监控"会出问题"和"性能瓶颈"的核心流程

---

## 2. 标识体系设计

在没有注册/登录的前提下，引入多层 ID，既方便排查，又不过度追踪用户：

### 2.1 anonymousId（浏览器级匿名用户 ID）**[MVP 必需]**

- **生成方式**：前端首次访问时生成随机 UUID（`crypto.randomUUID()`）
- **存储位置**：`localStorage["rm_anonymous_id"]`
- **生命周期**：与浏览器数据相同，除非用户清空缓存
- **用途**：
  - **前端**：在 Sentry 中作为 `user.id`，聚合同一用户的错误
  - **后端**：日志字段 `anonymousId`，代表"这个浏览器环境"的长期行为
  - **关联能力**：回答"是不是同一个用户反复遇到相同问题"

### 2.2 sessionId（访问会话 ID）**[增强版]**

- **生成方式**：每次打开站点（或每个浏览器标签页）生成 UUID
- **存储位置**：`sessionStorage["rm_session_id"]`
- **生命周期**：页面关闭或刷新后重新生成
- **用途**：
  - **前端**：在 Sentry 的 context 中记录 `session.id`
  - **后端**：日志字段 `sessionId`，用于区分同一 anonymousId 下不同访问会话
  - **关联能力**：区分"同一浏览器的不同访问时段"

### 2.3 requestId（请求/操作 ID）**[MVP 必需]**

- **生成方式**：后端在处理每个 HTTP 请求时生成唯一 ID（UUID 或短 ID）
- **传播方式**：
  - **后端**：日志字段 `requestId`，串联一次请求内的所有日志
  - **响应头**：`X-Request-Id`，返回给前端
  - **前端**：
    - 在 UI 中展示"错误编号"（用户可截图或拷贝给开发者）
    - 把 `requestId` 写入 Sentry 事件的 `tags.requestId` / `extra.requestId`
- **关联能力**：精确定位"某一次请求"的完整链路

### 2.4 多人共用同一台电脑的场景

- **anonymousId 会相同**（同一浏览器配置） → 这是预期行为
- **sessionId 会不同**（不同时间/标签页访问） → 增强版时可区分
- **requestId 总是不同**（每个请求唯一） → MVP 已足够精确定位

**排查时常用索引：**
- `requestId`（最精确）：某次具体操作
- `anonymousId + 时间范围`（用户级）：某个用户的行为序列
- `sessionId + 时间范围`（会话级，增强版）：某次访问会话内的所有行为

---

## 3. 业务场景与监控重点

### 3.1 项目核心业务流程

```
用户上传简历
  ↓
批量匹配（一次匹配多个岗位）← 第一印象，决定用户是否继续使用
  ↓
查看匹配结果列表
  ↓
点击某个岗位，进入详情页
  ↓
详情页加载：
  - 如果该岗位之前参加过批量匹配 → 只请求 details
  - 如果该岗位未参加过批量匹配 → 串行请求 scoring → details
```

### 3.2 批量匹配的实际实现（核心功能）

**为什么批量匹配是核心：**
- ✅ **用户旅程的"门面"**：第一印象，如果慢/失败，用户可能直接离开
- ✅ **核心价值主张**："快速了解我适合哪些岗位"
- ✅ **业务关键指标**：成功率、耗时、缓存命中率都直接影响用户留存

**流程设计：**
- 总共 N 个 jobs，每批处理 `batchSize = 3` 个（固定）
- **批间串行**：等第 1 批全部完成，才开始第 2 批
- **批内并行**（但实际是一个请求）：
  - 将这一批的 jobs 打包成 `job_list: [job1, job2, job3]`
  - 发送**一个 HTTP 请求**到 Dify 批量匹配 workflow（独立 workflow，不同于单个匹配）
  - Dify 内部串行处理这 3 个 job，返回完整结果

**缓存逻辑：**
- 发送请求前，先查数据库：哪些 job 已有 scoring 缓存（不管是之前批量还是单个匹配留下的）
- 有缓存的直接从 DB 读取，没缓存的才打包发给 Dify
- 一批可能是"部分缓存命中 + 部分重新计算"

**关键特点：**
- ❌ 无法获知批内单个 job 的计算耗时（Dify 不返回）
- ✅ 可以统计"这批有几个缓存命中、几个重新计算"
- ✅ 可以统计"整批处理耗时"和"Dify 调用耗时"
- ✅ 可以统计"调用了几次 Dify"（如果分多批）

**典型性能：**
- 全部缓存命中：< 500ms（只查 DB）
- 全部需要计算：< 10s（调用 Dify 批量 workflow）
- 混合场景：介于两者之间

### 3.3 单个匹配的两个分支（核心功能）

#### 分支 1：Scoring（快速评分）

- **功能**：返回 `overall_score` + `scores`（5 维分数）
- **Workflow**：Dify 单个匹配 workflow 的 scoring 分支
- **缓存策略**：数据库独立缓存，只要匹配过（批量或单个）就有缓存
- **典型性能**：
  - 缓存命中：< 100ms
  - 需要计算：< 5s

#### 分支 2：Details（深度分析）**[性能瓶颈]**

- **功能**：返回 `overview, advantages, disadvantages, advice`
- **Workflow**：Dify 单个匹配 workflow 的 details 分支
  - 需要传入 `overall_score` 参数（所以必须先有 scoring）
  - Dify 根据参数不同，走 details 分支
- **缓存策略**：数据库独立缓存，与 scoring 分开存储
  - 可能存在"有 scoring 没 details"的状态（该 job 只参加过批量，没进过详情页）
  - 不可能存在"只有 details 没 scoring"的状态
- **典型性能**：
  - 缓存命中：< 100ms
  - 需要计算：**10-60s（AI 生成，性能瓶颈）**

**为什么 details 是监控重点：**
- ✅ 耗时最长（10-60s），直接影响用户体验
- ✅ 最容易超时或失败
- ✅ 缓存命中率对用户体验影响巨大（命中 < 100ms，未命中 10-60s）

### 3.4 详情页的两种场景

#### 场景 A：该 job 之前参加过批量匹配（有 scoring 缓存）

**流程：**
1. 用户从 jobs 列表点击进入详情页
2. Scoring 数据从页面 props/state **直接传递**，不发请求
3. 页面加载后，检查 details 缓存：
   - 有缓存 → 从 DB 读取（< 100ms）
   - 无缓存 → 调用 Dify 生成（10-60s）

**性能特点：**
- 最快：< 100ms（details 命中缓存）
- 最慢：10-60s（details 需要计算）

#### 场景 B：该 job 之前没参加过批量匹配（无任何缓存）

**流程：**
1. 用户直接进入某个 job 的详情页（例如从外部链接）
2. **串行请求**：
   - 步骤 1：发起 scoring 请求 → 等待返回 `overall_score`
   - 步骤 2：发起 details 请求（传入 `overall_score`）→ 等待返回 details
3. 两个结果都返回后，页面完整展示

**性能特点：**
- 总耗时 = `scoringLatency + detailsLatency`
- 典型情况：约 4s（scoring）+ 30s（details 平均）= **约 34s**
- 必须有良好的 loading UI 和进度提示

**为什么必须串行：**
- Details 分支需要 `overall_score` 参数来判断走哪个分支
- 无法并行发起两个请求

---

## 4. 前端可观测性方案（MVP 版本）

### 4.1 目标

- 捕获并分析：JS 运行时错误、React 渲染错误、接口调用失败
- 记录关键用户行为轨迹（breadcrumbs）
- 将前端错误与后端日志通过 `requestId` 关联

### 4.2 工具与集成

**工具：** Sentry（Browser + React SDK）

**初始化位置：**
- 前端入口（如 `app/layout.tsx` 或 `sentry.client.config.ts`）

**关键配置：**
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // tracesSampleRate: 0.1,  // MVP 可以先不开性能监控
});

// 设置匿名用户 ID
const anonymousId = getAnonymousId();
Sentry.setUser({ id: anonymousId });
```

### 4.3 捕获内容（MVP 重点）

#### 1. 全局错误捕获（自动）
- 运行时错误、Promise rejection
- React 组件渲染错误（ErrorBoundary）

#### 2. 关键用户行为 breadcrumbs（手动，5-6 个）

**必需的 breadcrumbs：**

```typescript
// 1. 上传简历
Sentry.addBreadcrumb({
  category: 'resume',
  message: 'User uploaded resume',
  level: 'info',
  data: { fileType, fileSize }
});

// 2. 批量匹配（重要！）
Sentry.addBreadcrumb({
  category: 'match',
  message: 'Batch match started',
  data: { jobCount }
});

// 3. 进入详情页
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'Entered job details page',
  data: { jobId, hasScoringCache, hasDetailsCache }
});

// 4. Scoring 请求（如果没缓存）
Sentry.addBreadcrumb({
  category: 'api',
  message: 'Single match scoring request started',
  data: { requestId, jobId }
});

// 5. Details 请求（性能瓶颈）
Sentry.addBreadcrumb({
  category: 'api',
  message: 'Single match details request started',
  level: 'info',
  data: { requestId, jobId, overallScore }
});

// 6. 批量匹配完成（可选）
Sentry.addBreadcrumb({
  category: 'match',
  message: 'Batch match completed',
  data: { jobCount, duration }
});
```

#### 3. API 错误处理

在统一的 API 调用层：
- 从响应头读取 `X-Request-Id`
- 如果请求失败，将 `requestId` 附加到 Sentry 事件：

```typescript
Sentry.captureException(error, {
  tags: { requestId, endpoint },
  extra: { requestId, statusCode, responseBody }
});
```

### 4.4 错误展示给用户

错误页面显示：
```
出现了一些问题，请稍后重试。
如需协助，请提供错误编号：ABC123
```

（ABC123 就是 `requestId`，用户可以截图发给你）

---

## 5. 后端可观测性方案（MVP 版本）

### 5.1 目标

- 将后端行为记录为**结构化日志**，便于本地开发和未来 CloudWatch 查询
- **开发阶段：输出到本地日志文件 + 终端，方便查询和持久化**
- **核心监控：批量匹配 + 单个匹配（scoring + details）**，同等优先级
- 能够通过 `requestId` 与前端 Sentry 事件关联

### 5.2 Logger 封装（支持文件输出）

**设计一个 logger 工具（`lib/logging/logger.ts`）：**

```typescript
import fs from 'fs';
import path from 'path';

// 日志文件配置
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `app-${process.env.NODE_ENV || 'development'}.log`);

// 确保日志目录存在（只在服务端）
if (typeof window === 'undefined') {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function log(
  level: 'info' | 'warn' | 'error',
  event: string,
  data: Record<string, any> = {}
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data
  };
  
  const output = JSON.stringify(logEntry);
  
  // 1. 终端输出（保留，方便开发时实时查看）
  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
  
  // 2. 文件输出（只在服务端）
  if (typeof window === 'undefined') {
    try {
      fs.appendFileSync(LOG_FILE, output + '\n');
    } catch (err) {
      console.error('Failed to write log file:', err);
    }
  }
}

// 辅助函数
export function getAnonymousId(req: Request): string | undefined {
  return req.headers.get('X-Anonymous-Id') || undefined;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
```

**查看日志：**
```bash
# 实时查看
tail -f logs/app-development.log

# 搜索某个 requestId
grep "req_abc123" logs/app-development.log

# 搜索错误
grep '"level":"error"' logs/app-development.log

# 用 jq 格式化查看（需安装 jq）
cat logs/app-development.log | jq .

# 统计批量匹配的缓存命中率
grep "batch_match_completed" logs/app-development.log | jq .cacheHitRate
```

**`.gitignore` 配置：**
```
logs/
*.log
```

### 5.3 日志字段规范（MVP 简化版）

**必需字段：**
```typescript
{
  timestamp: string,        // ISO 时间戳
  level: string,            // info | warn | error
  event: string,            // 事件名称
  requestId: string,        // 每个请求唯一
  anonymousId?: string,     // 从请求头读取
  resumeId?: string,        // 如果涉及简历
}
```

**条件字段：**
```typescript
{
  // 批量匹配专用
  jobCount?: number,          // 总 job 数量
  cachedJobs?: number,        // 缓存命中数量
  computedJobs?: number,      // 重新计算数量
  failedJobs?: number,        // 失败数量
  cacheHitRate?: number,      // 缓存命中率
  difyCallCount?: number,     // Dify 调用次数
  avgDifyLatencyMs?: number,  // 平均 Dify 耗时
  
  // 单个匹配专用
  jobId?: string,             // 岗位 ID
  overallScore?: number,      // 评分
  fromCache?: boolean,        // 是否命中缓存
  
  // 通用
  latencyMs?: number,         // 总耗时
  difyLatencyMs?: number,     // Dify 调用耗时
  error?: string,             // 失败时的错误信息
}
```

### 5.4 关键日志点（MVP 版本）

#### 核心监控 1：批量匹配（同等优先级）

**事件 1：`batch_match_started`**
```typescript
log('info', 'batch_match_started', {
  requestId,
  anonymousId,
  resumeId,
  jobCount
});
```

**事件 2：`batch_match_completed`**
```typescript
log('info', 'batch_match_completed', {
  requestId,
  anonymousId,
  resumeId,
  jobCount,
  cachedJobs,          // 多少个命中缓存
  computedJobs,        // 多少个重新计算
  failedJobs,          // 多少个失败
  cacheHitRate,        // 缓存命中率
  latencyMs,           // 总耗时
  difyCallCount,       // 调用 Dify 次数
  avgDifyLatencyMs     // 平均每次 Dify 耗时
});
```

**事件 3：`batch_match_failed`**
```typescript
log('error', 'batch_match_failed', {
  requestId,
  anonymousId,
  resumeId,
  jobCount,
  error: error.message,
  latencyMs
});
```

#### 核心监控 2：单个匹配 - Scoring（同等优先级）

```typescript
// 开始
log('info', 'single_match_scoring_started', {
  requestId, anonymousId, resumeId, jobId
});

// 完成
log('info', 'single_match_scoring_completed', {
  requestId, anonymousId, resumeId, jobId,
  fromCache, overallScore, latencyMs, difyLatencyMs
});

// 失败
log('error', 'single_match_scoring_failed', {
  requestId, anonymousId, resumeId, jobId,
  error, latencyMs
});
```

#### 核心监控 3：单个匹配 - Details（同等优先级，性能瓶颈）

```typescript
// 开始
log('info', 'single_match_details_started', {
  requestId, anonymousId, resumeId, jobId, overallScore
});

// 完成
log('info', 'single_match_details_completed', {
  requestId, anonymousId, resumeId, jobId, overallScore,
  fromCache, latencyMs, difyLatencyMs
});

// 失败
log('error', 'single_match_details_failed', {
  requestId, anonymousId, resumeId, jobId, overallScore,
  error, latencyMs
});
```

#### 次优先级：简历上传

```typescript
// 开始
log('info', 'resume_upload_started', {
  requestId, anonymousId, fileType, fileSize
});

// 完成
log('info', 'resume_upload_completed', {
  requestId, anonymousId, resumeId, fileType, latencyMs
});

// 失败
log('error', 'resume_upload_failed', {
  requestId, anonymousId, fileType, error, latencyMs
});
```

### 5.5 统一错误处理

**设计一个全局错误处理包装器：**

```typescript
export function withErrorHandling(handler) {
  return async (req: Request) => {
    const requestId = generateRequestId();
    try {
      return await handler(req, requestId);
    } catch (error) {
      log('error', 'api_unhandled_error', {
        requestId,
        anonymousId: getAnonymousId(req),
        route: req.url,
        error: error.message
      });
      
      Sentry.captureException(error, {
        tags: { requestId },
        extra: { route: req.url }
      });
      
      return Response.json(
        { error: 'Internal server error' },
        { 
          status: 500,
          headers: { 'X-Request-Id': requestId }
        }
      );
    }
  };
}
```

---

## 6. 性能基线与监控指标

### 6.1 性能基线参考（基于实际测试）

```yaml
批量匹配（每批3个job）：
  全部缓存命中：< 500ms  (只查 DB)
  全部需要计算：< 10s    (调用 Dify 批量 workflow)
  混合场景：介于两者之间
  → 关键指标：缓存命中率、总耗时

单个匹配 - Scoring：
  缓存命中：< 100ms
  需要计算：< 5s

单个匹配 - Details（性能瓶颈）：
  缓存命中：< 100ms   → 用户几乎无感知，体验好
  需要计算：10-60s    → 用户需要长时间等待，必须有 loading
  → 关键优化指标：提高缓存命中率

详情页加载（场景 B，无缓存）：
  总耗时 = scoring(~4s) + details(~30s平均) ≈ 34s
  → 必须有良好的 loading UI 和进度提示
```

### 6.2 MVP 阶段的关键监控指标（同等优先级）

**1. 批量匹配性能（核心指标）**
- **平均耗时**：应 < 10s（每批 3 个 job）
- **缓存命中率**：目标 > 50%
- **失败率**：应 < 5%

**如果发现问题：**
- 耗时过长且缓存命中率低 → 缓存策略有问题
- 耗时过长但缓存命中率高 → Dify 批量 workflow 慢
- 失败率高 → 排查 Dify 调用或网络问题

**2. Details 缓存命中率（核心指标）**
- **目标**：> 70%
- **如果 < 50%**：说明很多用户要等 10-60s，体验差

**3. Details 计算耗时分布（核心指标）**
- 监控 `difyLatencyMs` 的分布（10s / 30s / 60s 各占多少）
- 如果经常 > 45s：可能需要优化 workflow 或考虑流式返回

**4. Scoring 和 Details 的失败率**
- 统计 `_failed` 事件的占比
- 如果 > 5%：需要排查是 Dify 问题还是数据库问题

---

## 7. 部署阶段与日志演进

### 7.1 本地开发阶段（当前）

**日志输出：**
- ✅ 终端 console 输出（实时查看）
- ✅ 本地日志文件（持久化，方便搜索）
  - 路径：`logs/app-development.log`
  - 格式：每行一个 JSON 对象

**查看方式：**
- 终端：实时滚动查看
- 文件：`tail -f`, `grep`, `jq` 等工具

**前端监控：**
- Sentry development 环境

### 7.2 部署到 Amplify 后（未来）

**日志输出（无需改造）：**
- ✅ 终端 console 输出 → 自动进入 **CloudWatch Logs**
- ✅ 当前 logger 设计（JSON 格式）直接兼容

**查看方式：**
- CloudWatch Logs：完整日志流
- CloudWatch Insights：结构化查询
  ```sql
  -- 查询某个 requestId 的完整链路
  fields @timestamp, level, event, latencyMs, error
  | filter requestId = "req_abc123"
  | sort @timestamp asc
  
  -- 统计批量匹配缓存命中率
  fields event, cacheHitRate
  | filter event = "batch_match_completed"
  | stats avg(cacheHitRate) as avgCacheHitRate
  
  -- 查询某个用户的行为序列
  fields @timestamp, event, jobId, latencyMs
  | filter anonymousId = "anon_xyz789"
  | sort @timestamp asc
  ```

**Sentry 与 CloudWatch 联动：**
- 排查起点：Sentry（前端错误 + requestId）
- 深入排查：CloudWatch（后端日志链路）

---

## 8. 隐私与合规考虑

### 8.1 不记录的内容

- ❌ 简历原文、职位 JD 原文
- ❌ 用户真实姓名、电话、邮箱、身份证、住址等敏感信息

### 8.2 可以记录的内容

- ✅ 非敏感统计信息：文件类型、大小、页数、字符数范围
- ✅ 匿名 ID：anonymousId, sessionId, requestId
- ✅ 业务 ID：resumeId, jobId（内部 hash 或 UUID）
- ✅ 评分结果：overall_score, scores（数字，无敏感信息）

### 8.3 Sentry 数据清洗

在 Sentry 项目设置中配置 data scrubber：
- 自动删除常见敏感字段：`password, token, authorization, email, phone, address`

---

## 9. MVP 版本实施清单

### 9.1 前端（3-4 小时）

- [ ] 实现 `getAnonymousId()` 函数（localStorage）
- [ ] 初始化 Sentry + 设置 `anonymousId` 为 user.id
- [ ] 添加 React ErrorBoundary
- [ ] 添加 5-6 个关键 breadcrumbs（上传/批量开始/批量完成/详情页/scoring/details）
- [ ] API 调用层：读取 `X-Request-Id` 并附加到错误事件

### 9.2 后端（4-5 小时）

- [ ] 封装 `logger` 工具（支持终端 + 文件输出）
- [ ] 确保 `logs/` 目录在 `.gitignore` 中
- [ ] 实现 `generateRequestId()` 和 `getAnonymousId(req)`
- [ ] **批量匹配日志**（核心，完整统计）
  - `batch_match_started`
  - `batch_match_completed`（包含 cachedJobs, computedJobs, cacheHitRate 等）
  - `batch_match_failed`
- [ ] **单个匹配 - Scoring 日志**（核心）
  - `_started`, `_completed`, `_failed`
  - 记录 `fromCache`, `latencyMs`, `difyLatencyMs`
- [ ] **单个匹配 - Details 日志**（核心，性能瓶颈）
  - `_started`, `_completed`, `_failed`
  - 记录 `fromCache`, `latencyMs`, `difyLatencyMs`
- [ ] 简历上传日志（次优先级）
- [ ] 全局错误处理包装器 + Sentry 上报

### 9.3 测试验证（1 小时）

- [ ] 本地制造几种场景：
  - 批量匹配（全缓存 / 部分缓存 / 全计算）
  - Details 请求超时
  - Scoring 请求失败
- [ ] 确认：
  - 终端能看到实时日志
  - `logs/app-development.log` 正确写入
  - 能用 `grep` / `jq` 查询日志
  - Sentry 中能看到错误 + anonymousId + requestId

### 9.4 本地日志查询练习（0.5 小时）

- [ ] 用 `grep` 搜索某个 requestId
- [ ] 用 `jq` 统计批量匹配的平均缓存命中率
- [ ] 用 `tail -f` 实时查看日志

---

## 10. 面试讲述要点

### 10.1 设计亮点

**"我为这个项目设计了完整的可观测性方案，分为三个阶段实施。当前实现了 MVP 版本。"**

**核心设计：**
1. **标识体系**：三层 ID（anonymousId / sessionId / requestId），追踪用户行为和关联前后端日志
2. **前端偏重**：用 Sentry 做前端错误监控，体现前端工程化能力
3. **核心流程监控**：批量匹配和单个匹配同等重要，都是完整监控
4. **开发友好**：本地阶段输出到文件 + 终端，查询方便、可持久化
5. **云原生设计**：日志基于 console 输出，部署到 Amplify 后自动进入 CloudWatch

### 10.2 工程判断

**"为什么批量匹配和单个匹配都要重点监控？"**
- 批量匹配：用户第一印象，决定是否继续使用，失败 = 流失
- 单个匹配：深度体验，details 耗时 10-60s，是最大性能瓶颈
- 两者同等重要，都需要监控缓存命中率、耗时、失败率

**"为什么开发阶段输出到本地文件？"**
- 终端日志重启就丢失，查询不方便
- 本地文件持久化，可以用 grep/jq 等工具快速分析
- 成本低（1 小时实现），收益高（立刻解决痛点）
- 部署到 AWS 后，日志格式不变，自动进入 CloudWatch

### 10.3 实际价值

**"这套方案解决了什么问题？"**
- **批量匹配慢**：看日志中的 `cacheHitRate` 和 `avgDifyLatencyMs`，定位是缓存还是 Dify 慢
- **用户投诉详情页卡住**：从 Sentry 拿 requestId → 在日志文件/CloudWatch 搜索 → 看到 details 超时
- **性能优化方向**：统计 details 缓存命中率，如果很低，优先提升缓存

---

## 11. 总结

本方案设计了一套**轻量、实用、可演示**的可观测性体系，核心特点：

✅ **分阶段实施**：MVP（8.5-10.5h） → 增强版 → 完整版
✅ **前端偏重**：Sentry 做专门的前端错误追踪，体现前端工程化能力
✅ **核心流程同等重要**：批量匹配 + 单个匹配（scoring + details）都是完整监控
✅ **开发友好**：本地文件 + 终端输出，查询方便、可持久化
✅ **云原生设计**：与 AWS Amplify + CloudWatch 自然衔接，部署时无需改造
✅ **隐私优先**：不记录敏感信息，只记录必要的统计和业务 ID
✅ **可讲述性强**：既有完整设计，又有实际实现，还有工程权衡，适合面试展示

**预计实施时间（MVP 版本）：8.5-10.5 小时**
