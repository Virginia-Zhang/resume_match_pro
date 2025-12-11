# ResumeMatch Pro 日志与监控策略（Logging Strategy）

本文件在整体可观测性设计（见 `OBSERVABILITY_DESIGN.md`）的基础上，具体说明：

- **MVP 版本的具体实施内容**（当前重点）
- **前端 / 后端各自的日志与监控实践**
- **关键业务事件清单与字段规范**
- **本地日志文件输出方案**
- **性能基线与排查场景示例**

---

## 实施范围说明

根据分阶段策略，当前文档重点描述 **MVP 版本** 的实施细节：

- ✅ **当前实施（MVP）**：核心流程（批量 + 单个匹配）完整监控 + 本地文件输出
- 📋 **未来扩展（增强版）**：批次级监控 + 缓存趋势统计 + 性能告警
- 📋 **完整版本**：CloudWatch 集成 + RUM + 自动化告警

文档中会用标签标注：
- **[MVP]**：当前阶段需要实现
- **[增强版]**：用户量增长后再补充
- **[完整版]**：产品化运营时考虑

---

## 1. 标识体系在日志中的使用 **[MVP]**

### 1.1 三层标识字段

在所有后端日志和 Sentry 事件中，统一使用以下标识：

| 字段 | 级别 | 生成位置 | MVP 状态 | 用途 |
|------|------|---------|---------|------|
| `anonymousId` | 浏览器级 | 前端（localStorage） | ✅ 必需 | 用户标识，追踪同一浏览器的行为序列 |
| `sessionId` | 会话级 | 前端（sessionStorage） | ⏸️ 暂缓 | 区分同一浏览器的不同访问会话 |
| `requestId` | 请求级 | 后端（每个请求生成） | ✅ 必需 | 精确定位单次请求的完整链路 |

### 1.2 传递方式 **[MVP]**

**前端 → 后端：**
```typescript
// 前端在所有 API 请求中带上
fetch('/api/match/batch', {
  headers: {
    'X-Anonymous-Id': anonymousId,
    // 'X-Session-Id': sessionId,  // [增强版]
  }
});
```

**后端 → 前端：**
```typescript
// 后端在响应头中返回
Response.json(data, {
  headers: {
    'X-Request-Id': requestId
  }
});
```

**前端 Sentry：**
```typescript
// 设置用户标识
Sentry.setUser({ id: anonymousId });

// 设置会话信息（[增强版]）
// Sentry.setContext("session", { id: sessionId });

// 附加 requestId 到错误事件
Sentry.captureException(error, {
  tags: { requestId },
  extra: { requestId, endpoint, statusCode }
});
```

---

## 2. 后端日志策略 **[MVP]**

### 2.1 Logger 工具封装（支持文件输出）

**文件位置：** `lib/logging/logger.ts`

**完整实现（支持终端 + 文件）：**
```typescript
import fs from 'fs';
import path from 'path';

// ============ 日志文件配置 ============

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(
  LOG_DIR, 
  `app-${process.env.NODE_ENV || 'development'}.log`
);

// 确保日志目录存在（只在服务端）
if (typeof window === 'undefined') {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// ============ 核心 Logger 函数 ============

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

// ============ 辅助函数 ============

export function getAnonymousId(req: Request): string | undefined {
  return req.headers.get('X-Anonymous-Id') || undefined;
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
```

**`.gitignore` 配置：**
```gitignore
# 日志文件
logs/
*.log
```

**查看日志的常用命令：**
```bash
# 实时查看日志
tail -f logs/app-development.log

# 搜索某个 requestId 的完整链路
grep "req_abc123" logs/app-development.log

# 搜索所有错误日志
grep '"level":"error"' logs/app-development.log

# 用 jq 格式化查看（需要安装 jq）
cat logs/app-development.log | jq .

# 统计批量匹配的平均缓存命中率
grep "batch_match_completed" logs/app-development.log | jq .cacheHitRate | awk '{sum+=$1; count++} END {print sum/count}'

# 查看最近 10 条 details 完成的日志
grep "single_match_details_completed" logs/app-development.log | tail -10 | jq .

# 统计各类事件的数量
jq -r .event logs/app-development.log | sort | uniq -c
```

### 2.2 日志字段规范 **[MVP 简化版]**

#### 必需字段（所有日志）

```typescript
{
  timestamp: string,      // ISO 时间戳，如 "2025-12-09T10:15:30.123Z"
  level: string,          // "info" | "warn" | "error"
  event: string,          // 事件名称，如 "batch_match_completed"
  requestId: string,      // 每个请求唯一的 ID
}
```

#### 推荐字段（根据事件类型）

```typescript
{
  // 通用
  anonymousId?: string,   // 从请求头读取，用户标识
  resumeId?: string,      // 如果涉及简历
  latencyMs?: number,     // 总耗时（毫秒）
  error?: string,         // 失败时的错误信息
  
  // 批量匹配专用
  jobCount?: number,          // 总 job 数量
  cachedJobs?: number,        // 缓存命中数量
  computedJobs?: number,      // 重新计算数量
  failedJobs?: number,        // 失败数量（如果有部分失败逻辑）
  cacheHitRate?: number,      // 缓存命中率（0-1）
  difyCallCount?: number,     // Dify 调用次数（如果分批）
  avgDifyLatencyMs?: number,  // 平均每次 Dify 耗时
  
  // 单个匹配专用
  jobId?: string,         // 岗位 ID
  overallScore?: number,  // 评分（details 请求时记录）
  fromCache?: boolean,    // 是否命中缓存（关键！）
  difyLatencyMs?: number, // 调用 Dify 的耗时（毫秒）
}
```

#### [增强版] 额外字段

```typescript
{
  sessionId?: string,           // 会话级标识
  batchId?: string,             // 批量匹配的批次 ID
  batchIndex?: number,          // 第几批
  cacheAgeSeconds?: number,     // 缓存年龄
}
```

### 2.3 日志级别约定

| 级别 | 含义 | 使用场景 | MVP 使用频率 |
|------|------|---------|-------------|
| `info` | 正常业务事件 | 请求开始、成功完成、缓存命中 | 高 |
| `warn` | 非预期但非致命 | 部分数据缺失、重试成功 | 中 |
| `error` | 严重错误 | 请求失败、未捕获异常 | 低（但必须有） |
| `debug` | 开发调试 | 中间计算结果 | 暂不使用 |

---

## 3. 关键业务事件清单 **[MVP]**

### 3.1 核心监控 1：批量匹配（同等优先级）

**为什么批量匹配是核心：**
- ✅ 用户旅程的"第一印象"，决定是否继续使用
- ✅ 核心价值主张："快速了解我适合哪些岗位"
- ✅ 如果批量匹配慢/失败，用户可能直接流失

#### 事件 1：`batch_match_started`

**触发时机：** 收到批量匹配请求

**字段：**
```json
{
  "timestamp": "2025-12-09T10:20:00.000Z",
  "level": "info",
  "event": "batch_match_started",
  "requestId": "req_batch001",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobCount": 9
}
```

#### 事件 2：`batch_match_completed`（重点统计）

**触发时机：** 批量匹配全部完成

**字段（完整版）：**
```json
{
  "timestamp": "2025-12-09T10:20:25.000Z",
  "level": "info",
  "event": "batch_match_completed",
  "requestId": "req_batch001",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobCount": 9,
  "cachedJobs": 3,
  "computedJobs": 6,
  "failedJobs": 0,
  "cacheHitRate": 0.33,
  "latencyMs": 25000,
  "difyCallCount": 2,
  "avgDifyLatencyMs": 9500
}
```

**关键字段说明：**
- `cachedJobs`：多少个 job 命中缓存（直接从 DB 读取）
- `computedJobs`：多少个 job 需要调用 Dify 重新计算
- `failedJobs`：多少个 job 失败（如果有部分失败容忍逻辑）
- `cacheHitRate`：缓存命中率（cachedJobs / jobCount）
- `difyCallCount`：调用了几次 Dify（如果分批，9 个 job 分 3 批 = 3 次调用）
- `avgDifyLatencyMs`：平均每次 Dify 调用耗时

**能回答的问题：**
- ✅ "批量匹配慢，是因为缓存命中率低，还是 Dify 本身慢？"
- ✅ "批量匹配的整体成功率是多少？"
- ✅ "缓存策略是否有效？（看 cacheHitRate）"

#### 事件 3：`batch_match_failed`

**触发时机：** 批量匹配失败

**字段：**
```json
{
  "timestamp": "2025-12-09T10:20:25.000Z",
  "level": "error",
  "event": "batch_match_failed",
  "requestId": "req_batch001",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobCount": 9,
  "error": "Network timeout while calling Dify",
  "latencyMs": 15000
}
```

#### 实现示例（批量匹配 API）

```typescript
// API: /api/match/batch
export async function POST(req: Request) {
  const { resumeId, jobIds } = await req.json();
  const requestId = generateRequestId();
  const anonymousId = getAnonymousId(req);
  const startTime = Date.now();
  
  // 1. 开始日志
  log('info', 'batch_match_started', {
    requestId,
    anonymousId,
    resumeId,
    jobCount: jobIds.length
  });
  
  try {
    // 检查缓存
    const cacheResults = await db.getMatchScores(resumeId, jobIds);
    const cachedJobIds = cacheResults.map(r => r.jobId);
    const jobsToCompute = jobIds.filter(id => !cachedJobIds.includes(id));
    
    // 统计 Dify 调用
    let difyCallCount = 0;
    let totalDifyLatency = 0;
    let failedJobs = 0;
    
    // 分批计算（如果有需要计算的）
    const computedResults = [];
    if (jobsToCompute.length > 0) {
      const batchSize = 3;
      for (let i = 0; i < jobsToCompute.length; i += batchSize) {
        const batch = jobsToCompute.slice(i, i + batchSize);
        
        try {
          const difyStart = Date.now();
          const batchResults = await callDifyBatchWorkflow(resumeId, batch);
          const difyLatency = Date.now() - difyStart;
          
          difyCallCount++;
          totalDifyLatency += difyLatency;
          computedResults.push(...batchResults);
        } catch (error) {
          failedJobs += batch.length;
          // 可以选择继续处理其他批次，或直接抛出错误
        }
      }
    }
    
    // 保存计算结果
    if (computedResults.length > 0) {
      await db.saveMatchScores(resumeId, computedResults);
    }
    
    // 合并结果
    const allResults = [...cacheResults, ...computedResults];
    
    // 2. 完成日志（完整统计）
    log('info', 'batch_match_completed', {
      requestId,
      anonymousId,
      resumeId,
      jobCount: jobIds.length,
      cachedJobs: cachedJobIds.length,
      computedJobs: computedResults.length,
      failedJobs,
      cacheHitRate: cachedJobIds.length / jobIds.length,
      latencyMs: Date.now() - startTime,
      difyCallCount,
      avgDifyLatencyMs: difyCallCount > 0 
        ? Math.round(totalDifyLatency / difyCallCount) 
        : 0
    });
    
    return Response.json(allResults, {
      headers: { 'X-Request-Id': requestId }
    });
    
  } catch (error) {
    // 3. 失败日志
    log('error', 'batch_match_failed', {
      requestId,
      anonymousId,
      resumeId,
      jobCount: jobIds.length,
      error: error.message,
      latencyMs: Date.now() - startTime
    });
    
    // Sentry 上报
    Sentry.captureException(error, {
      tags: { requestId, event: 'batch_match_failed' },
      extra: { resumeId, jobCount: jobIds.length, anonymousId }
    });
    
    throw error;
  }
}
```

---

### 3.2 核心监控 2：单个匹配 - Scoring 分支

#### 事件 1：`single_match_scoring_started`

**触发时机：** 收到 scoring 请求

**字段：**
```json
{
  "timestamp": "2025-12-09T10:15:30.123Z",
  "level": "info",
  "event": "single_match_scoring_started",
  "requestId": "req_abc123",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123"
}
```

#### 事件 2：`single_match_scoring_completed`

**触发时机：** scoring 请求成功完成（缓存命中 或 计算完成）

**字段：**
```json
{
  "timestamp": "2025-12-09T10:15:34.567Z",
  "level": "info",
  "event": "single_match_scoring_completed",
  "requestId": "req_abc123",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123",
  "fromCache": false,
  "overallScore": 75,
  "latencyMs": 4444,
  "difyLatencyMs": 4200
}
```

**关键字段说明：**
- `fromCache: true` → 缓存命中，`latencyMs` 应 < 100ms，`difyLatencyMs` 为空
- `fromCache: false` → 重新计算，`latencyMs` 应 < 5s，`difyLatencyMs` 约等于 `latencyMs`

#### 事件 3：`single_match_scoring_failed`

**触发时机：** scoring 请求失败

**字段：**
```json
{
  "timestamp": "2025-12-09T10:15:35.123Z",
  "level": "error",
  "event": "single_match_scoring_failed",
  "requestId": "req_abc123",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123",
  "error": "Dify workflow timeout",
  "latencyMs": 65000
}
```

#### 实现示例（Scoring API）

```typescript
// API: /api/match/scoring
export async function POST(req: Request) {
  const { resumeId, jobId } = await req.json();
  const requestId = generateRequestId();
  const anonymousId = getAnonymousId(req);
  const startTime = Date.now();
  
  // 1. 开始日志
  log('info', 'single_match_scoring_started', {
    requestId,
    anonymousId,
    resumeId,
    jobId
  });
  
  try {
    // 检查缓存
    const cached = await db.getMatchScore(resumeId, jobId);
    if (cached) {
      // 缓存命中
      log('info', 'single_match_scoring_completed', {
        requestId,
        anonymousId,
        resumeId,
        jobId,
        fromCache: true,
        overallScore: cached.overall_score,
        latencyMs: Date.now() - startTime
      });
      
      return Response.json(cached, {
        headers: { 'X-Request-Id': requestId }
      });
    }
    
    // 调用 Dify
    const difyStart = Date.now();
    const result = await callDifyWorkflow({ resumeId, jobId });
    const difyLatency = Date.now() - difyStart;
    
    // 保存
    await db.saveMatchScore(resumeId, jobId, result);
    
    // 2. 完成日志（重新计算）
    log('info', 'single_match_scoring_completed', {
      requestId,
      anonymousId,
      resumeId,
      jobId,
      fromCache: false,
      overallScore: result.overall_score,
      latencyMs: Date.now() - startTime,
      difyLatencyMs: difyLatency
    });
    
    return Response.json(result, {
      headers: { 'X-Request-Id': requestId }
    });
    
  } catch (error) {
    // 3. 失败日志
    log('error', 'single_match_scoring_failed', {
      requestId,
      anonymousId,
      resumeId,
      jobId,
      error: error.message,
      latencyMs: Date.now() - startTime
    });
    
    // Sentry 上报
    Sentry.captureException(error, {
      tags: { requestId, event: 'single_match_scoring_failed' },
      extra: { resumeId, jobId, anonymousId }
    });
    
    throw error;
  }
}
```

---

### 3.3 核心监控 3：单个匹配 - Details 分支（性能瓶颈）

#### 事件 1：`single_match_details_started`

**触发时机：** 收到 details 请求

**字段：**
```json
{
  "timestamp": "2025-12-09T10:15:35.200Z",
  "level": "info",
  "event": "single_match_details_started",
  "requestId": "req_def456",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123",
  "overallScore": 75
}
```

**关键说明：**
- `overallScore` 是从 scoring 传入的参数，Dify 根据此参数判断走 details 分支

#### 事件 2：`single_match_details_completed`

**触发时机：** details 请求成功完成

**字段：**
```json
{
  "timestamp": "2025-12-09T10:16:05.800Z",
  "level": "info",
  "event": "single_match_details_completed",
  "requestId": "req_def456",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123",
  "overallScore": 75,
  "fromCache": false,
  "latencyMs": 30600,
  "difyLatencyMs": 30400
}
```

**关键字段说明：**
- `fromCache: true` → 缓存命中，`latencyMs` 应 < 100ms，用户体验好
- `fromCache: false` → 调用 AI 生成，`latencyMs` 通常 **10-60s**，用户需要长时间等待
- **这是最需要监控的性能瓶颈**

#### 事件 3：`single_match_details_failed`

**触发时机：** details 请求失败

**字段：**
```json
{
  "timestamp": "2025-12-09T10:17:05.800Z",
  "level": "error",
  "event": "single_match_details_failed",
  "requestId": "req_def456",
  "anonymousId": "anon_xyz789",
  "resumeId": "resume_001",
  "jobId": "job_123",
  "overallScore": 75,
  "error": "Dify workflow timeout after 60s",
  "latencyMs": 60500
}
```

#### 实现示例（Details API）

```typescript
// API: /api/match/details
// 结构与 scoring 类似，但：
// - 事件名：single_match_details_*
// - 输入参数多一个：overallScore
// - difyLatencyMs 通常 10-60s
// - 需要特别关注超时和失败情况

export async function POST(req: Request) {
  const { resumeId, jobId, overallScore } = await req.json();
  const requestId = generateRequestId();
  const anonymousId = getAnonymousId(req);
  const startTime = Date.now();
  
  log('info', 'single_match_details_started', {
    requestId,
    anonymousId,
    resumeId,
    jobId,
    overallScore
  });
  
  try {
    // 检查缓存
    const cached = await db.getMatchDetails(resumeId, jobId);
    if (cached) {
      log('info', 'single_match_details_completed', {
        requestId,
        anonymousId,
        resumeId,
        jobId,
        overallScore,
        fromCache: true,
        latencyMs: Date.now() - startTime
      });
      
      return Response.json(cached, {
        headers: { 'X-Request-Id': requestId }
      });
    }
    
    // 调用 Dify（注意：需要传入 overallScore）
    const difyStart = Date.now();
    const result = await callDifyWorkflow({ 
      resumeId, 
      jobId, 
      overallScore  // Details 分支的必需参数
    });
    const difyLatency = Date.now() - difyStart;
    
    // 保存
    await db.saveMatchDetails(resumeId, jobId, result);
    
    log('info', 'single_match_details_completed', {
      requestId,
      anonymousId,
      resumeId,
      jobId,
      overallScore,
      fromCache: false,
      latencyMs: Date.now() - startTime,
      difyLatencyMs: difyLatency
    });
    
    return Response.json(result, {
      headers: { 'X-Request-Id': requestId }
    });
    
  } catch (error) {
    log('error', 'single_match_details_failed', {
      requestId,
      anonymousId,
      resumeId,
      jobId,
      overallScore,
      error: error.message,
      latencyMs: Date.now() - startTime
    });
    
    Sentry.captureException(error, {
      tags: { requestId, event: 'single_match_details_failed' },
      extra: { resumeId, jobId, overallScore, anonymousId }
    });
    
    throw error;
  }
}
```

---

### 3.4 次优先级：简历上传

#### 事件清单

```typescript
// 1. 上传开始
log('info', 'resume_upload_started', {
  requestId,
  anonymousId,
  fileType: "pdf",
  fileSize: 1024000  // bytes
});

// 2. 上传完成
log('info', 'resume_upload_completed', {
  requestId,
  anonymousId,
  resumeId: "resume_001",
  fileType: "pdf",
  latencyMs: 1200
});

// 3. 上传失败
log('error', 'resume_upload_failed', {
  requestId,
  anonymousId,
  fileType: "pdf",
  error: "File size exceeds limit",
  latencyMs: 300
});
```

---

## 4. 前端监控策略 **[MVP]**

### 4.1 Sentry 初始化

**文件位置：** `app/layout.tsx` 或 `sentry.client.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";
import { getAnonymousId } from "@/lib/analytics/ids";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // tracesSampleRate: 0.1,  // MVP 可暂不开启性能监控
});

// 设置匿名用户 ID
const anonymousId = getAnonymousId();
Sentry.setUser({ id: anonymousId });
```

### 4.2 关键 Breadcrumbs（手动添加）**[MVP]**

#### Breadcrumb 1：用户上传简历

```typescript
Sentry.addBreadcrumb({
  category: 'resume',
  message: 'User uploaded resume',
  level: 'info',
  data: {
    fileType: 'pdf',
    fileSize: 1024000
  }
});
```

#### Breadcrumb 2：批量匹配开始

```typescript
Sentry.addBreadcrumb({
  category: 'match',
  message: 'Batch match started',
  level: 'info',
  data: {
    jobCount: 9
  }
});
```

#### Breadcrumb 3：批量匹配完成（可选）

```typescript
Sentry.addBreadcrumb({
  category: 'match',
  message: 'Batch match completed',
  level: 'info',
  data: {
    jobCount: 9,
    duration: 25000  // ms
  }
});
```

#### Breadcrumb 4：进入 job 详情页

```typescript
Sentry.addBreadcrumb({
  category: 'navigation',
  message: 'Entered job details page',
  level: 'info',
  data: {
    jobId: 'job_123',
    hasScoringCache: true,
    hasDetailsCache: false
  }
});
```

#### Breadcrumb 5：Scoring 请求开始

```typescript
Sentry.addBreadcrumb({
  category: 'api',
  message: 'Single match scoring request started',
  level: 'info',
  data: {
    requestId: 'req_abc123',
    jobId: 'job_123'
  }
});
```

#### Breadcrumb 6：Details 请求开始（重点）

```typescript
Sentry.addBreadcrumb({
  category: 'api',
  message: 'Single match details request started',
  level: 'info',
  data: {
    requestId: 'req_def456',
    jobId: 'job_123',
    overallScore: 75
  }
});
```

### 4.3 API 错误处理

**在统一的 API 调用封装中：**

```typescript
async function apiCall(endpoint: string, options: RequestInit) {
  const anonymousId = getAnonymousId();
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'X-Anonymous-Id': anonymousId,
      }
    });
    
    // 读取 requestId
    const requestId = response.headers.get('X-Request-Id');
    
    if (!response.ok) {
      // 错误处理
      const error = new Error(`API Error: ${response.status}`);
      
      Sentry.captureException(error, {
        tags: {
          requestId,
          endpoint,
          statusCode: response.status
        },
        extra: {
          requestId,
          endpoint,
          statusCode: response.status,
          anonymousId
        }
      });
      
      throw error;
    }
    
    return response.json();
    
  } catch (error) {
    // 网络错误
    Sentry.captureException(error, {
      tags: { endpoint },
      extra: { endpoint, anonymousId }
    });
    throw error;
  }
}
```

### 4.4 错误展示给用户

```typescript
// 错误页面或 toast 提示
function ErrorMessage({ requestId }: { requestId?: string }) {
  return (
    <div>
      <p>出现了一些问题，请稍后重试。</p>
      {requestId && (
        <p className="text-sm text-gray-500">
          如需协助，请提供错误编号：{requestId}
        </p>
      )}
    </div>
  );
}
```

---

## 5. 性能基线与监控指标 **[MVP]**

### 5.1 性能基线参考

基于实际测试结果：

| 场景 | 缓存命中 | 需要计算 | 说明 |
|------|---------|---------|------|
| **批量匹配（3 jobs/批）** | < 500ms | < 10s | 批量 workflow 效率高，核心用户体验 |
| **单个 Scoring** | < 100ms | < 5s | 相对快速 |
| **单个 Details** | < 100ms | **10-60s** | **最大性能瓶颈** |
| **详情页加载（场景 B）** | - | ~34s | scoring(~4s) + details(~30s) |

### 5.2 关键监控指标（同等优先级）

#### 指标 1：批量匹配性能（核心指标）

**计算方式：**
```bash
# 从日志文件统计
grep "batch_match_completed" logs/app-development.log | jq '{
  avgLatency: .latencyMs,
  cacheHitRate: .cacheHitRate,
  avgDifyLatency: .avgDifyLatencyMs
}'
```

**目标：**
- 平均耗时：< 10s
- 缓存命中率：> 50%
- 失败率：< 5%

**如果发现问题：**
- 耗时过长且 `cacheHitRate` < 0.3 → 缓存策略有问题
- 耗时过长但 `cacheHitRate` > 0.5 → Dify 批量 workflow 慢
- `avgDifyLatencyMs` 接近 10s → Dify 接近性能上限
- 失败率高 → 排查 Dify 调用或网络问题

#### 指标 2：Details 缓存命中率（核心指标）

**计算方式：**
```bash
# 从日志文件统计
grep "single_match_details_completed" logs/app-development.log | \
  jq -r .fromCache | \
  awk '{cache += ($1 == "true"); total++} END {print cache/total}'
```

**目标：** > 70%

**如果低于 50%：**
- 说明很多用户要等 10-60s
- 需要优化：提高缓存命中率、考虑缓存预热、或优化 Dify workflow

#### 指标 3：Details 计算耗时分布

**统计 `difyLatencyMs` 的分布：**
```bash
grep "single_match_details_completed" logs/app-development.log | \
  jq 'select(.fromCache == false) | .difyLatencyMs' | \
  sort -n
```

**目标：**
- P50（中位数）：约 30s
- P95：< 50s
- P99：< 60s

**如果 P95 > 50s：**
- 考虑优化 Dify workflow
- 考虑流式返回（提升用户体验）
- 考虑超时告警（> 60s 时发送通知）

#### 指标 4：各类事件的失败率

**计算方式：**
```bash
# 统计各类事件的成功和失败数量
jq -r '.event' logs/app-development.log | sort | uniq -c
```

**目标：** 所有 `_failed` 事件占比 < 5%

**如果 > 5%：**
- 排查是 Dify 服务不稳定、网络超时、还是数据库问题

### 5.3 本地日志分析脚本示例

**简单的分析脚本（`scripts/analyze-logs.js`）：**

```javascript
const fs = require('fs');

// 读取日志文件
const logs = fs.readFileSync('logs/app-development.log', 'utf-8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

// 1. 统计批量匹配的平均缓存命中率
const batchLogs = logs.filter(l => l.event === 'batch_match_completed');
const avgBatchCacheHit = batchLogs.reduce((sum, l) => sum + l.cacheHitRate, 0) / batchLogs.length;
console.log(`批量匹配平均缓存命中率: ${(avgBatchCacheHit * 100).toFixed(1)}%`);

// 2. 统计 details 缓存命中率
const detailsLogs = logs.filter(l => l.event === 'single_match_details_completed');
const detailsCacheHits = detailsLogs.filter(l => l.fromCache === true).length;
const detailsCacheHitRate = detailsCacheHits / detailsLogs.length;
console.log(`Details 缓存命中率: ${(detailsCacheHitRate * 100).toFixed(1)}%`);

// 3. 统计 details 计算耗时分布
const computedDetails = detailsLogs
  .filter(l => l.fromCache === false)
  .map(l => l.difyLatencyMs)
  .sort((a, b) => a - b);

if (computedDetails.length > 0) {
  const p50 = computedDetails[Math.floor(computedDetails.length * 0.5)];
  const p95 = computedDetails[Math.floor(computedDetails.length * 0.95)];
  const p99 = computedDetails[Math.floor(computedDetails.length * 0.99)];
  
  console.log(`Details 计算耗时 P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
}

// 4. 统计错误率
const errorLogs = logs.filter(l => l.level === 'error');
const errorRate = errorLogs.length / logs.length;
console.log(`错误率: ${(errorRate * 100).toFixed(2)}%`);
```

---

## 6. 排查场景示例 **[MVP]**

### 场景 1：用户投诉"批量匹配很慢"

**排查步骤：**

1. **用户提供信息**：
   - "我刚才 10:20 左右上传简历，批量匹配等了好久"
   - 或者用户提供了错误编号（requestId）

2. **在日志文件中搜索**：
   ```bash
   # 搜索该时间段的批量匹配日志
   grep "2025-12-09T10:2" logs/app-development.log | \
     grep "batch_match" | jq .
   ```

3. **发现问题**：
   ```json
   {
     "event": "batch_match_completed",
     "requestId": "req_batch001",
     "jobCount": 9,
     "cachedJobs": 0,
     "computedJobs": 9,
     "cacheHitRate": 0,
     "latencyMs": 28000,
     "difyCallCount": 3,
     "avgDifyLatencyMs": 9200
   }
   ```

4. **分析**：
   - `cacheHitRate: 0` → 所有 job 都没缓存，全部重新计算
   - `latencyMs: 28000` → 约 28s，确实很慢
   - `avgDifyLatencyMs: 9200` → 每次 Dify 调用约 9.2s，接近上限

5. **结论**：
   - 短期：缓存完全未命中，属于"首次匹配"的正常情况
   - 长期优化方向：
     - 提高缓存命中率（预加载热门职位）
     - 优化 Dify workflow（9.2s 偏慢）

### 场景 2：用户投诉"详情页一直转圈"

**排查步骤：**

1. **在 Sentry 中查找**：
   - 筛选时间范围 + 用户的 anonymousId
   - 或直接搜索 requestId（如果用户提供了错误编号）

2. **发现前端错误**：
   - 错误类型：`API timeout`
   - Breadcrumbs 显示：
     - 进入详情页 → scoring 请求成功 → details 请求开始 → 超时

3. **从 Sentry 获取 `requestId`**：`req_def456`

4. **在日志文件中搜索**：
   ```bash
   grep "req_def456" logs/app-development.log | jq .
   ```

5. **看到日志链路**：
   ```json
   { "event": "single_match_details_started", "requestId": "req_def456", ... }
   { "event": "single_match_details_failed", "requestId": "req_def456", 
     "error": "Dify workflow timeout after 60s", "latencyMs": 60500 }
   ```

6. **结论**：Dify workflow 超时，需要优化 workflow 或增加超时时间

### 场景 3：发现 Details 缓存命中率很低

**排查步骤：**

1. **运行分析脚本**（或手动统计）：
   ```bash
   node scripts/analyze-logs.js
   ```
   - Details 缓存命中率：25%
   - 说明 75% 的用户要等 10-60s

2. **可能原因**：
   - 用户大多是首次访问详情页（正常）
   - 缓存失效策略有问题（需要检查）
   - 数据库缓存查询逻辑有 bug（需要检查代码）

3. **优化方向**：
   - 批量匹配时，预生成部分 details 数据
   - 调整缓存失效策略（延长缓存时间）
   - 考虑在用户查看列表时，后台预加载 top 3 jobs 的 details

---

## 7. 与 AWS CloudWatch 的集成（未来）

### 7.1 本地开发阶段（当前）

- **后端日志**：
  - 终端 console 输出（实时查看）
  - 本地日志文件（持久化，`logs/app-development.log`）
- **查看方式**：
  - 终端：实时滚动
  - 文件：`tail -f`, `grep`, `jq`
  - 分析脚本：`node scripts/analyze-logs.js`

### 7.2 部署到 Amplify 后（未来）

- **自动集成**：
  - Amplify 自动收集所有 `console.log/error` 到 CloudWatch Logs
  - 当前 logger 设计（JSON 格式）直接兼容，无需改造

- **查询方式**（CloudWatch Insights）：
  ```sql
  -- 查询某个 requestId 的完整链路
  fields @timestamp, level, event, latencyMs, error
  | filter requestId = "req_abc123"
  | sort @timestamp asc
  
  -- 统计批量匹配缓存命中率
  fields event, cacheHitRate
  | filter event = "batch_match_completed"
  | stats avg(cacheHitRate) as avgCacheHitRate
  
  -- 查询 details 耗时分布
  fields event, difyLatencyMs
  | filter event = "single_match_details_completed" and fromCache = false
  | stats percentile(difyLatencyMs, 50, 95, 99)
  
  -- 查询某个用户的行为序列
  fields @timestamp, event, jobId, latencyMs
  | filter anonymousId = "anon_xyz789"
  | sort @timestamp asc
  ```

---

## 8. 安全与隐私约束

### 8.1 禁止记录的内容

- ❌ 简历原文、职位 JD 原文
- ❌ 用户真实姓名、电话、邮箱、身份证、住址
- ❌ 完整的错误堆栈中可能包含的敏感信息（需裁剪）

### 8.2 允许记录的内容

- ✅ 文件类型、大小、页数
- ✅ 匿名 ID、会话 ID、请求 ID
- ✅ 业务 ID（resumeId, jobId，应该是 hash 或 UUID）
- ✅ 评分结果（数字，无敏感信息）
- ✅ 错误类型和消息（不含敏感参数）

### 8.3 Sentry 数据清洗

在 Sentry 项目设置中配置：
- 自动删除：`password, token, authorization, email, phone, address, ssn`

---

## 9. MVP 实施检查清单

### 9.1 前端（3-4 小时）

- [ ] **标识体系**
  - [ ] 实现 `getAnonymousId()`（localStorage）
  - [ ] 在所有 API 请求中带上 `X-Anonymous-Id` 头部

- [ ] **Sentry 集成**
  - [ ] 初始化 Sentry + 设置 `anonymousId` 为 `user.id`
  - [ ] 添加 React ErrorBoundary
  - [ ] 添加 5-6 个关键 breadcrumbs（上传/批量开始/批量完成/详情页/scoring/details）

- [ ] **API 错误处理**
  - [ ] 从响应头读取 `X-Request-Id`
  - [ ] 将 `requestId` 附加到 Sentry 错误事件

- [ ] **错误展示**
  - [ ] 错误页面显示"错误编号"（requestId）

### 9.2 后端（4-5 小时）

- [ ] **Logger 工具**
  - [ ] 封装 `log()` 函数（支持终端 + 文件输出）
  - [ ] 确保日志目录自动创建
  - [ ] 确保 `logs/` 在 `.gitignore` 中
  - [ ] 实现 `generateRequestId()` 和 `getAnonymousId(req)`

- [ ] **批量匹配日志**（核心，同等优先级）
  - [ ] `batch_match_started`
  - [ ] `batch_match_completed`（包含完整统计）
    - [ ] cachedJobs
    - [ ] computedJobs
    - [ ] cacheHitRate
    - [ ] difyCallCount
    - [ ] avgDifyLatencyMs
  - [ ] `batch_match_failed`

- [ ] **单个匹配 - Scoring 日志**（核心，同等优先级）
  - [ ] `single_match_scoring_started`
  - [ ] `single_match_scoring_completed`（区分 fromCache）
  - [ ] `single_match_scoring_failed`

- [ ] **单个匹配 - Details 日志**（核心，同等优先级，性能瓶颈）
  - [ ] `single_match_details_started`
  - [ ] `single_match_details_completed`（区分 fromCache，记录 difyLatencyMs）
  - [ ] `single_match_details_failed`

- [ ] **简历上传日志**（次优先级）
  - [ ] `resume_upload_started`
  - [ ] `resume_upload_completed`
  - [ ] `resume_upload_failed`

- [ ] **全局错误处理**
  - [ ] 统一错误处理包装器
  - [ ] Sentry `captureException` 集成
  - [ ] 响应头返回 `X-Request-Id`

### 9.3 测试验证（1 小时）

- [ ] **本地测试**
  - [ ] 批量匹配（全缓存 / 部分缓存 / 全计算）
  - [ ] Details 超时错误
  - [ ] Scoring 失败错误
  - [ ] 观察缓存命中和未命中的日志差异

- [ ] **验证日志输出**
  - [ ] 终端能看到实时日志
  - [ ] `logs/app-development.log` 正确写入
  - [ ] 能用 `grep` 搜索 requestId
  - [ ] 能用 `jq` 格式化查看

- [ ] **验证关联**
  - [ ] 在 Sentry 中看到错误 + anonymousId + requestId
  - [ ] 在日志文件中用 requestId 找到对应记录
  - [ ] breadcrumbs 显示完整用户操作路径

### 9.4 本地日志查询练习（0.5 小时）

- [ ] 用 `grep` 搜索某个 requestId 的完整链路
- [ ] 用 `jq` 统计批量匹配的平均缓存命中率
- [ ] 用 `tail -f` 实时查看日志
- [ ] 运行分析脚本（如果编写了）

---

## 10. 总结

本策略文档描述了 **MVP 版本** 的具体实施细节，核心特点：

✅ **核心流程同等重要**：批量匹配 + 单个匹配（scoring + details）都是完整监控
✅ **批量匹配完整统计**：cachedJobs, computedJobs, cacheHitRate, difyCallCount 等关键指标
✅ **本地文件输出**：开发阶段友好，查询方便、可持久化
✅ **标识体系**：anonymousId（必需）+ requestId（必需），sessionId 暂缓到增强版
✅ **前端偏重**：用 Sentry 做专门的前端错误追踪，体现前端工程化能力
✅ **轻量实用**：实施成本 8.5-10.5 小时，不臃肿
✅ **可演示性强**：能在面试中展示完整的监控链路和排查流程
✅ **云原生设计**：基于 console 输出，未来部署到 Amplify 后自动进入 CloudWatch

**实施优先级：**
1. 批量匹配（完整统计）— 核心，用户第一印象
2. 单个匹配（scoring + details）— 核心，深度体验
3. 简历上传 — 次优先级，入口
4. 性能统计和告警 — 增强版

**预计实施时间（MVP 版本）：8.5-10.5 小时**
