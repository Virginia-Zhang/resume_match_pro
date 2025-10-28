# 前端分批请求批量匹配实现方案

## 方案概述

采用**前端分批请求**方案：前端控制分批逻辑，顺序向后端 `/api/match/batch` 发送多次请求，每获取一批结果立即显示在页面上。

### 核心特性

- ✅ **实现极简**：前端一个 for 循环 + await，后端无需改动
- ✅ **无额外压力**：顺序请求（一次一个），后端负载与流式方案相同  
- ✅ **独立性好**：每批请求独立，某批失败不影响其他批次
- ✅ **状态持久化**：使用 sessionStorage 保存匹配结果，用户浏览详情后返回不丢失
- ✅ **请求中断**：使用 AbortController，页面卸载时自动取消未完成的请求
- ✅ **友好错误提示**：集成现有的 ErrorDisplay 和 getFriendlyErrorMessage

## 后端改造

### 1. 添加常量到 `app/constants/constants.ts`

```typescript
// ---------- AI Matching Configuration ----------
/**
 * Number of jobs per batch for AI matching.
 * AI マッチングのバッチあたりの求人数。
 */
export const BATCH_SIZE = 3 as const;

/**
 * Maximum retry attempts for failed batch matching requests.
 * 失敗したバッチマッチングリクエストの最大再試行回数。
 */
export const MAX_BATCH_RETRIES = 1 as const;
```

### 2. 修改 `app/api/match/batch/route.ts`

将硬编码的 `maxRetries = 1` 改为使用常量：

```typescript
import { MAX_BATCH_RETRIES } from '@/app/constants/constants';

async function callDifyAPIWithRetry(
  resumeText: string,
  jobs: Array<{id: string; job_description: string}>
): Promise<DifyResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_BATCH_RETRIES; attempt++) {
    try {
      return await callDifyAPI(resumeText, jobs);
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_BATCH_RETRIES) {
        console.log(`⚠️ Batch failed, retrying (${attempt + 1}/${MAX_BATCH_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError!;
}
```

**注意：** 后端保持现有的同步返回方式（`NextResponse.json()`），无需改为流式响应。

## 前端实现

### 1. 创建批量匹配 Hook

**新文件：** `app/jobs/useBatchMatching.ts`

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { getFriendlyErrorMessage, FriendlyErrorMessage } from '@/lib/errorHandling';
import { API_MATCH_BATCH, BATCH_SIZE } from '@/app/constants/constants';
import { getApiBase } from '@/lib/runtime-config';

interface MatchResultItem {
  job_id: string;
  overall: number;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    soft: number;
  };
}

import type { JobDetailV2 } from '@/types/jobs_v2';
import { serializeJDForBatchMatching } from '@/lib/jobs';

interface UseBatchMatchingResult {
  results: MatchResultItem[];
  isMatchingComplete: boolean;
  isMatching: boolean;
  errorInfo: FriendlyErrorMessage | null;
  processedJobs: number;
  totalJobs: number;
  startMatching: (resumeText: string, jobs: JobDetailV2[]) => Promise<void>;
}

const STORAGE_RESULTS_KEY = 'batch-matching-results';
const STORAGE_COMPLETE_KEY = 'batch-matching-complete';

/**
 * @description Custom hook for batch matching with progressive results display
 * @description 段階的な結果表示を伴うバッチマッチング用カスタムフック
 */
export function useBatchMatching(): UseBatchMatchingResult {
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [errorInfo, setErrorInfo] = useState<FriendlyErrorMessage | null>(null);
  const [processedJobs, setProcessedJobs] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  /**
   * @description Load saved results from sessionStorage on mount
   * @description マウント時に sessionStorage から保存された結果を読み込む
   */
  useEffect(() => {
    try {
      const savedResults = sessionStorage.getItem(STORAGE_RESULTS_KEY);
      const isComplete = sessionStorage.getItem(STORAGE_COMPLETE_KEY) === 'true';
      
      if (savedResults) {
        setResults(JSON.parse(savedResults));
        setIsMatchingComplete(isComplete);
      }
    } catch (error) {
      console.error('Failed to load saved results:', error);
    }
  }, []);
  
  /**
   * @description Save results to sessionStorage whenever they change
   * @description 結果が変更されるたびに sessionStorage に保存
   */
  useEffect(() => {
    try {
      if (results.length > 0) {
        sessionStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
        sessionStorage.setItem(STORAGE_COMPLETE_KEY, isMatchingComplete.toString());
      }
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  }, [results, isMatchingComplete]);
  
  /**
   * @description Cancel ongoing requests when component unmounts
   * @description コンポーネントのアンマウント時に進行中のリクエストをキャンセル
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  /**
   * @description Split array into chunks
   * @description 配列をチャンクに分割
   */
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  
  /**
   * @description Start batch matching process
   * @description バッチマッチング処理を開始
   */
  const startMatching = useCallback(async (resumeText: string, jobs: JobDetailV2[]) => {
    // Reset state
    // 状態をリセット
    setResults([]);
    setIsMatchingComplete(false);
    setIsMatching(true);
    setErrorInfo(null);
    setTotalJobs(jobs.length);
    setProcessedJobs(0);
    
    // Clear previous saved results
    // 以前の保存結果をクリア
    sessionStorage.removeItem(STORAGE_RESULTS_KEY);
    sessionStorage.removeItem(STORAGE_COMPLETE_KEY);
    
    // Create new AbortController for this matching session
    // このマッチングセッション用の新しい AbortController を作成
    abortControllerRef.current = new AbortController();
    
    // Split jobs into batches
    // ジョブをバッチに分割
    const batches = chunkArray(jobs, BATCH_SIZE);
    
    try {
      const apiUrl = `${getApiBase()}${API_MATCH_BATCH}`;
      const accumulatedResults: MatchResultItem[] = [];
      
      // Process each batch sequentially
      // 各バッチを順次処理
      for (let i = 0; i < batches.length; i++) {
        console.log(`📦 Processing batch ${i + 1}/${batches.length}`);
        
        try {
          // Serialize JobDetailV2 objects to optimized text for AI analysis
          // JobDetailV2 オブジェクトをAI分析用の最適化テキストにシリアライズ
          const serializedJobs = batches[i].map(job => ({
            id: job.id,
            job_description: serializeJDForBatchMatching(job)
          }));
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resume_text: resumeText,
              jobs: serializedJobs
            }),
            signal: abortControllerRef.current.signal
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const batchData = await response.json();
          
          // Immediately update results with new batch
          // 新しいバッチで結果を即座に更新
          if (batchData.match_results && Array.isArray(batchData.match_results)) {
            accumulatedResults.push(...batchData.match_results);
            setResults([...accumulatedResults]);
            setProcessedJobs(accumulatedResults.length);
            console.log(`✅ Batch ${i + 1} completed: ${batchData.match_results.length} results`);
          }
          
        } catch (batchError) {
          // Check if it was aborted by user navigation
          // ユーザーのナビゲーションによって中断されたかチェック
          if (batchError instanceof Error && batchError.name === 'AbortError') {
            console.log('🛑 Matching cancelled by user navigation');
            return;
          }
          
          console.error(`❌ Batch ${i + 1} failed:`, batchError);
          // Continue with next batch instead of stopping
          // 停止せずに次のバッチを続行
          continue;
        }
      }
      
      // Mark matching as complete
      // マッチング完了をマーク
      setIsMatchingComplete(true);
      console.log(`✅ All batches completed: ${accumulatedResults.length} total results`);
      
    } catch (error) {
      // Check if it was aborted
      // 中断されたかチェック
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Matching cancelled by user navigation');
        return;
      }
      
      const friendlyError = getFriendlyErrorMessage(error);
      setErrorInfo(friendlyError);
      console.error('❌ Matching process error:', error);
    } finally {
      setIsMatching(false);
    }
  }, []);
  
  return {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatching
  };
}
```

### 2. 创建排序下拉菜单组件

**新文件：** `components/jobs/SortDropdown.tsx`

```typescript
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';

interface SortDropdownProps {
  disabled: boolean;
  onSortChange: (sortBy: 'overall' | 'postedAt') => void;
}

type SortOption = 'overall' | 'postedAt';

const SORT_OPTIONS = [
  { value: 'overall', label: 'マッチングスコア' },
  { value: 'postedAt', label: '投稿日' }
] as const;

/**
 * @component SortDropdown
 * @description ソートドロップダウンコンポーネント（マッチング完了後に利用可能）
 * @description Sort dropdown component (available after matching completion)
 */
export default function SortDropdown({ disabled, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('overall');

  const handleSortSelect = (sortBy: SortOption) => {
    setSelectedSort(sortBy);
    onSortChange(sortBy);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
        title={disabled ? 'マッチング完了後に利用可能' : undefined}
      >
        <Filter className="h-4 w-4" />
        <span>並べ替え</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && !disabled && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortSelect(option.value as SortOption)}
              className={`
                w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700
                ${selectedSort === option.value 
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. 在 Jobs 页面中使用

**修改文件：** `app/jobs/page.tsx`

核心改动：
- 添加 `"use client"` 转为客户端组件
- 集成 `useBatchMatching` hook
- 添加「AIマッチング」按钮（筛选条件选择后显示）
- 添加进度条显示（匹配开始时显示）
- 添加排序下拉菜单（匹配开始后显示，完成后启用）
- 使用 `ErrorDisplay` 组件显示错误

**伪代码示例：**

```typescript
"use client";

import { useBatchMatching } from './useBatchMatching';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { Progress } from '@/components/ui/progress';
import SortDropdown from '@/components/jobs/SortDropdown';

export default function JobsPage() {
  const {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatching
  } = useBatchMatching();
  
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  
  const handleStartMatching = () => {
    // filteredJobs 应该是 JobDetailV2[] 类型，直接传递给 startMatching
    // filteredJobs should be JobDetailV2[] type, pass directly to startMatching
    setHasStartedMatching(true);
    startMatching(resumeText, filteredJobs);
  };
  
  // 计算进度百分比
  const progressPercent = totalJobs > 0 ? Math.round((processedJobs / totalJobs) * 100) : 0;
  
  return (
    <div>
      {/* 筛选UI */}
      <button onClick={handleStartMatching} disabled={isMatching}>
        {isMatching ? '分析中...' : 'AIマッチング'}
      </button>
      
      {/* 进度条显示（匹配开始时显示） */}
      {isMatching && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              AIマッチング分析中...
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {progressPercent}%
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-2 mb-2" />
          
          <div className="text-xs text-blue-600 dark:text-blue-400">
            分析済み: {processedJobs}/{totalJobs} 件
          </div>
        </div>
      )}
      
      {/* 排序下拉菜单（匹配开始后显示，完成后启用） */}
      {hasStartedMatching && (
        <div className="flex justify-end mb-4">
          <SortDropdown 
            disabled={!isMatchingComplete}
            onSortChange={handleSortChange}
          />
        </div>
      )}
      
      {/* 错误显示 */}
      {errorInfo && (
        <ErrorDisplay
          title="マッチング分析エラー"
          errorInfo={errorInfo}
        />
      )}
      
      {/* 实时显示匹配结果 */}
      {filteredJobs.map(job => {
        const matchResult = results.find(r => r.job_id === job.id);
        return (
          <JobItem 
            key={job.id} 
            job={job}
            matchResult={matchResult}
            isLoading={isMatching && !matchResult}
          />
        );
      })}
    </div>
  );
}
```

## 核心特性说明

### 1. 进度条显示

**显示时机：**
- 用户点击「AIマッチング」按钮后立即显示
- 匹配完成后自动隐藏

**显示内容：**
- 进度条：使用 shadcn Progress 组件，显示百分比进度
- 进度文本：显示"分析済み: {processedJobs}/{totalJobs} 件"
- 状态文本：显示"AIマッチング分析中..."

**样式设计：**
```css
/* 进度条容器 */
.progress-container {
  @apply mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800;
}

/* 进度条标题 */
.progress-title {
  @apply text-sm font-medium text-blue-900 dark:text-blue-100;
}

/* 进度百分比 */
.progress-percent {
  @apply text-sm font-semibold text-blue-700 dark:text-blue-300;
}

/* 进度文本 */
.progress-text {
  @apply text-xs text-blue-600 dark:text-blue-400;
}
```

### 2. 排序下拉菜单

**显示时机：**
- 用户点击「AIマッチング」按钮后显示
- 如果用户从未点击匹配按钮，则永远不显示

**可用状态：**
- 匹配进行中：禁用状态（opacity-50, cursor-not-allowed）
- 匹配完成后：启用状态，可正常使用

**排序选项：**
- `マッチングスコア` (overall) - 按匹配分数降序排列
- `投稿日` (postedAt) - 按发布时间降序排列

**样式设计：**
```css
/* 排序按钮 */
.sort-button {
  @apply flex items-center gap-2 px-3 py-2;
}

/* 禁用状态 */
.sort-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* 下拉菜单 */
.sort-dropdown {
  @apply absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10;
}

/* 下拉选项 */
.sort-option {
  @apply w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700;
}

/* 选中状态 */
.sort-option.selected {
  @apply bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300;
}
```

### 3. 请求流程

```
用户点击「AIマッチング」
    ↓
前端分批：[Job1-3], [Job4-6], [Job7-9]
    ↓
顺序请求（await）：
    Request 1 → [Job1-3] → Response 1 → 立即显示 ✅ → 保存到 sessionStorage
    Request 2 → [Job4-6] → Response 2 → 立即显示 ✅ → 保存到 sessionStorage
    Request 3 → [Job7-9] → Response 3 → 立即显示 ✅ → 保存到 sessionStorage
    ↓
所有完成 → isMatchingComplete = true → 显示排序 → 保存完成状态
```

### 2. 状态持久化（sessionStorage）

**保存时机：**
- 每批结果返回后立即保存
- 所有批次完成后保存完成状态

**恢复时机：**
- 组件挂载时自动从 sessionStorage 恢复

**清除时机：**
- 开始新的匹配时清除
- 用户关闭浏览器/标签页时自动清除（session结束）

**用户体验：**
```
场景1：用户完成匹配 → 进入job详情 → 返回jobs页面
结果：✅ 匹配结果仍然显示，排序功能可用

场景2：匹配进行中 → 进入job详情 → 返回jobs页面
结果：✅ 已完成的批次结果仍然显示，但未完成（请求已中断）

场景3：关闭浏览器 → 重新打开
结果：✅ 匹配结果清除，需要重新匹配（符合预期）
```

### 3. 请求中断（AbortController）

**中断时机：**
- 用户离开 jobs 页面（进入详情页）
- 组件卸载时

**中断效果：**
- 正在进行的 fetch 请求被取消
- 不会触发 React 警告（state update on unmounted component）
- 不会浪费后端资源

**错误处理：**
```typescript
catch (error) {
  if (error.name === 'AbortError') {
    // 正常的用户导航，静默处理
    console.log('🛑 Matching cancelled');
    return;
  }
  // 其他错误正常处理
  setErrorInfo(getFriendlyErrorMessage(error));
}
```

### 4. 错误处理

**单批次失败：**
- 捕获错误但继续处理下一批次
- 失败的批次不显示结果（显示骨架屏）
- 不中断整个匹配流程

**网络错误/连接中断：**
- 使用 `getFriendlyErrorMessage` 获取友好错误信息
- 使用 `ErrorDisplay` 组件展示错误和重试按钮
- 点击重试按钮重新调用 `startMatching`

**后端重试：**
- 后端保持现有的重试逻辑（`MAX_BATCH_RETRIES = 1`）
- 每批请求失败时后端自动重试1次

## 性能分析

**后端压力：**
- 顺序请求，同一时间只有1个请求
- 每个请求处理3个jobs（BATCH_SIZE）
- 100个jobs = 34批 × 4秒/批 ≈ 2分16秒
- ✅ **后端负载与单批请求完全相同，无额外压力**

**前端体验：**
- 实时显示结果（不需要等待所有批次完成）
- 状态持久化（浏览详情后返回不丢失）
- 友好错误提示（统一使用 ErrorDisplay）

## 测试要点

1. ✅ 测试多批次场景（9+ jobs）
2. ✅ 测试单批次失败但继续处理下一批次
3. ✅ 测试匹配进行中切换到详情页再返回（请求中断 + 状态保持）
4. ✅ 测试匹配完成后切换到详情页再返回（状态完整保持）
5. ✅ 测试关闭浏览器后重新打开（状态清除）
6. ✅ 测试网络中断后的错误显示
7. ✅ 测试 ErrorDisplay 组件集成
8. ✅ 测试完成状态触发排序功能
9. ✅ 测试进度条显示和更新（百分比 + 已完成/总数）
10. ✅ 测试排序下拉菜单显示时机（匹配开始后显示）
11. ✅ 测试排序下拉菜单禁用状态（匹配进行中禁用，完成后启用）
12. ✅ 测试排序功能（按匹配分数和发布时间排序）
13. ✅ 测试从未点击匹配按钮时排序菜单不显示

## 优势总结

| 维度 | 前端分批请求 | 流式JSON |
|------|------------|---------|
| 实现复杂度 | ⭐ 极简 | ⭐⭐⭐ 复杂 |
| 后端改动 | ✅ 仅常量 | ❌ 大幅改动 |
| 调试难度 | ⭐ 容易 | ⭐⭐⭐ 困难 |
| 错误处理 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 状态持久化 | ✅ sessionStorage | ❌ 需额外实现 |
| 请求中断 | ✅ AbortController | ❌ 需手动处理 |
| 用户体验 | ✅ 实时显示 + 状态保持 | ✅ 实时显示 |
| 后端压力 | ✅ 相同 | ✅ 相同 |
| HTTP开销 | ⚠️ 略高 | ✅ 最低 |

