# 批量匹配缓存时序竞争条件修复 / Batch Match Cache Timing Race Condition Fix

## 问题描述 / Problem Description

### 症状 / Symptoms

用户在jobs页面筛选出4个job并点击批量匹配：
- 其中3个job之前已匹配过，有缓存数据
- 只有第4个job需要新匹配
- 匹配请求成功，第4个job的结果也存入数据库
- **但第4个job的匹配分数未显示在页面上**

User filtered 4 jobs on the jobs page and clicked batch match:
- 3 of them were previously matched with cached data
- Only the 4th job needed new matching
- Match request succeeded, 4th job result was stored in database
- **But the 4th job's match score did NOT display on the page**

### 根本原因 / Root Cause

这是一个典型的**竞争条件（Race Condition）**问题：

1. **批量匹配完成**：前端收到新匹配结果（包含第4个job）
2. **设置本地状态**：`setResults([...accumulatedResults])` 包含所有4个job
3. **数据库异步写入**：API使用`void storeBatchMatchResults()`非阻塞写入
4. **`isMatching`变为false**：触发`useBatchCacheQuery`的`enabled`条件
5. **立即refetch数据库**：由于`staleTime: 0`，query立即从数据库重新获取
6. **获取到旧数据**：第4个job的结果可能还没写入完成，只获取到3个job
7. **用旧数据覆盖新数据**：hydration逻辑检测到长度不同（3 !== 4），用旧数据覆盖

This is a classic **Race Condition** problem:

1. **Batch matching completes**: Frontend receives new results (including 4th job)
2. **Update local state**: `setResults([...accumulatedResults])` contains all 4 jobs
3. **Async database write**: API uses `void storeBatchMatchResults()` non-blocking write
4. **`isMatching` becomes false**: Triggers `useBatchCacheQuery`'s `enabled` condition
5. **Immediate database refetch**: Due to `staleTime: 0`, query immediately refetches from database
6. **Gets stale data**: 4th job result may not be written yet, only gets 3 jobs
7. **Overwrites new data with stale**: Hydration logic detects different length (3 !== 4), overwrites with stale data

## 修复方案 / Solution

实施了**三重防护机制**来彻底解决竞争条件：

Implemented **triple defense mechanism** to completely resolve the race condition:

### 1. 即时缓存更新 / Immediate Cache Update

**位置 / Location**: `handleBatchSuccess` 函数

**修改 / Change**: 在每个批次成功后，立即更新React Query缓存

```typescript
const handleBatchSuccess = (
  newResults: MatchResultItem[],
  accumulatedResults: MatchResultItem[]
): void => {
  accumulatedResults.push(...newResults);
  setResults([...accumulatedResults]);
  setProcessedJobs(accumulatedResults.length);

  // 立即更新React Query缓存，防止竞争条件
  if (resumeId) {
    queryClient.setQueryData(
      queryKeys.match.batchCache(resumeId),
      { results: [...accumulatedResults] }
    );
  }
};
```

**作用 / Effect**: 确保React Query缓存始终包含最新数据，即使数据库写入延迟

### 2. 防护性Hydration逻辑 / Defensive Hydration Logic

**位置 / Location**: Hydration `useEffect`

**修改 / Change**: 只在数据库数据**更多**时才更新本地状态

```typescript
// 修改前 / Before:
if (cacheData.results.length !== results.length) {
  setResults(cacheData.results);
  // ...
}

// 修改后 / After:
if (cacheData.results.length > results.length) {
  setResults(cacheData.results);
  // ...
}
```

**作用 / Effect**: 防止用旧数据（少于本地数据）覆盖新数据

### 3. 延迟Refetch窗口 / Delayed Refetch Window

**位置 / Location**: `useBatchCacheQuery` 调用

**修改 / Change**: 增加`staleTime`给数据库写入留出时间

```typescript
// 修改前 / Before:
staleTime: 0, // Always refetch on mount

// 修改后 / After:
staleTime: 3000, // 3 seconds - enough time for database writes
```

**作用 / Effect**: 
- 在匹配完成后3秒内不会自动refetch
- 给数据库写入足够的缓冲时间
- 仍然能够捕获单个匹配更新（3秒后会refetch）

## 技术细节 / Technical Details

### 竞争条件时间线 / Race Condition Timeline

```
T0: Batch matching completes
    ├─ Frontend: setResults([job1, job2, job3, job4])
    └─ Backend: void storeBatchMatchResults() (async)

T0+10ms: setIsMatching(false)
    └─ useBatchCacheQuery enabled: true

T0+20ms: React Query refetch triggered (staleTime=0)
    └─ Database query: SELECT * FROM match_results
    
T0+30ms: Database returns [job1, job2, job3] (job4 not written yet)
    └─ Hydration: cacheData.length (3) !== results.length (4)
    
T0+40ms: ❌ BUG: setResults([job1, job2, job3]) - loses job4!

T0+100ms: Database write completes for job4 (too late)
```

### 修复后的时间线 / Fixed Timeline

```
T0: Batch matching completes
    ├─ setResults([job1, job2, job3, job4])
    ├─ queryClient.setQueryData() ✅ Cache updated immediately
    └─ Backend: void storeBatchMatchResults() (async)

T0+10ms: setIsMatching(false)
    └─ useBatchCacheQuery enabled: true
    └─ staleTime=3000 ⏰ No immediate refetch

T0+20ms: ✅ No refetch - data is still fresh
    └─ Results remain: [job1, job2, job3, job4]

T0+3000ms: Data becomes stale, refetch on next interaction
    └─ Database write completed by now
    └─ Hydration: cacheData.length (4) === results.length (4)
    └─ ✅ No overwrite needed
```

## 闭包陷阱修复 / Closure Trap Fix

### 问题 / Problem

初始实现中，`handleBatchSuccess`和`finalizeMatching`使用闭包变量`resumeId`更新React Query缓存。如果用户在批量匹配期间切换到另一个resume，会导致缓存污染：

In the initial implementation, `handleBatchSuccess` and `finalizeMatching` used the closure variable `resumeId` to update React Query cache. If user switches to another resume during batch matching, it would cause cache pollution:

```typescript
// ❌ 初始实现 / Initial Implementation (BAD):
const handleBatchSuccess = (...) => {
  queryClient.setQueryData(
    queryKeys.match.batchCache(resumeId),  // 使用闭包变量 / Uses closure variable
    { results: [...accumulatedResults] }
  );
};

// 场景 / Scenario:
T0: resumeId = "resume-A", start matching
T1: User switches resume, resumeId = "resume-B"
T2: Matching for resume-A completes
    → queryClient.setQueryData(batchCache("resume-B"), resume-A data) ❌
    → Resume-A's data pollutes Resume-B's cache!
```

### 解决方案 / Solution

使用参数传递代替闭包变量：

Use parameter passing instead of closure variable:

```typescript
// ✅ 修复后 / After Fix (GOOD):
const handleBatchSuccess = (
  newResults: MatchResultItem[],
  accumulatedResults: MatchResultItem[],
  currentResumeId: string  // 参数传递 / Parameter passing
): void => {
  queryClient.setQueryData(
    queryKeys.match.batchCache(currentResumeId),  // 使用参数 / Uses parameter
    { results: [...accumulatedResults] }
  );
};

// 调用时传入 / Pass when calling:
handleBatchSuccess(newResults, accumulatedResults, currentResumeId);
```

## 依赖更新 / Dependency Updates

更新了`startMatchingInternal`的依赖数组：

Updated `startMatchingInternal` dependency array:

```typescript
// 修改前 / Before:
[batchMutation]

// 修改后 / After:
[batchMutation, queryClient]
// 注意：移除了 resumeId，因为现在通过参数传递，不再需要闭包依赖
// Note: Removed resumeId since it's now passed as parameter, no longer needs closure dependency
```

## 测试场景 / Test Scenarios

### ✅ 场景1：增量批量匹配 / Incremental Batch Matching

1. 筛选出4个job
2. 其中3个已有匹配结果
3. 点击批量匹配
4. **预期**：第4个job的分数立即显示
5. **结果**：✅ 通过

### ✅ 场景2：全新批量匹配 / Fresh Batch Matching

1. 筛选出多个job
2. 都没有匹配结果
3. 点击批量匹配
4. **预期**：所有分数逐步显示
5. **结果**：✅ 通过

### ✅ 场景3：单个匹配后批量匹配 / Single Match Then Batch

1. 在详情页单独匹配1个job
2. 返回列表页
3. 筛选包含该job的多个job
4. 批量匹配剩余job
5. **预期**：所有分数正确显示
6. **结果**：✅ 通过

## 变更文件 / Modified Files

- `hooks/useBatchMatching.ts`
  - 添加`queryClient`和`queryKeys`导入
  - 修改`handleBatchSuccess`：添加即时缓存更新，添加`currentResumeId`参数避免闭包陷阱
  - 修改`finalizeMatching`：添加即时缓存更新，添加`currentResumeId`参数避免闭包陷阱
  - 修改hydration逻辑：`!==` → `>`
  - 修改`useBatchCacheQuery`：`staleTime: 0` → `staleTime: 3000`
  - 更新`startMatchingInternal`依赖数组：移除`resumeId`（不再需要闭包依赖）
  - 更新函数调用：传递`currentResumeId`参数到`handleBatchSuccess`和`finalizeMatching`

## 分支名称 / Branch Name

```
fix/batch-matching-cache-timing-race-condition
```

## 后续优化建议 / Future Optimization Suggestions

1. **数据库写入确认机制**：考虑让API在数据库写入完成后再返回（权衡响应时间）
2. **乐观更新策略**：完善React Query的乐观更新，进一步提升用户体验
3. **监控告警**：添加前端性能监控，检测类似的竞争条件

---

**修复日期 / Fix Date**: 2025-01-08  
**修复者 / Fixed By**: Virginia Zhang  
**状态 / Status**: ✅ 已修复并测试 / Fixed and Tested

