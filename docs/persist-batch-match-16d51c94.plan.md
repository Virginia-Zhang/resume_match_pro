---
name: Batch Match Results Database Persistence
overview: ""
todos:
  - id: e35976c7-f02d-492f-b409-00ba2cb518d0
    content: Modify batch/route.ts to accept resumeId and persist results to match_results table
    status: pending
  - id: 0b3c9c1e-4eea-4ad2-b0a4-0fdc39ebd079
    content: Create new GET endpoint /api/match/batch-cache to fetch cached results by resumeId
    status: pending
  - id: 03723339-bec7-4678-ae8b-b8b361a2f2df
    content: "Update lib/api/match.ts: add resumeId to BatchMatchRequest, add fetchBatchCache function"
    status: pending
  - id: e6ba0ff8-bfcf-410d-9d33-138c9eff080b
    content: "Update useBatchMatching.ts: pass resumeId to API, load cached results from DB on mount"
    status: pending
  - id: 7e5993a6-76c0-4c3f-abfd-9f1ee4912088
    content: Evaluate if sessionStorage cache can be removed or kept as secondary cache
    status: pending
---

# Batch Match Results Database Persistence

## Current Architecture

- **Batch matching**: Uses sessionStorage via [`lib/storage/batch-match-cache.ts`](lib/storage/batch-match-cache.ts) - data lost on browser close
- **Single job matching**: Already persists to `match_results` table via [`app/api/match/route.ts`](app/api/match/route.ts)
- **Database table**: `match_results` with columns: resume_id, job_id, type, data (JSONB), etc.

## Changes Overview

### 1. Database Migration: Update existing source values

**SQL Migration**

Update all existing records: `source: "dify"` -> `source: "single"` to establish consistent naming convention.

### 2. Backend: Update single match source field

**File**: [`app/api/match/route.ts`](app/api/match/route.ts)

Change `source: "dify"` to `source: "single"` in the envelope creation.

### 3. Backend: Store batch results to database

**File**: [`app/api/match/batch/route.ts`](app/api/match/batch/route.ts)

Add database persistence after Dify API returns results:

- Accept `resumeId` in request body (currently only has `resume_text`)
- After successful batch matching, insert each result into `match_results` table with `source: "batch"`
- Store with `type: "scoring"` to match single job format

### 4. Backend: Add API to load cached batch results

**New file**: `app/api/match/batch-cache/route.ts`

Create GET endpoint to fetch all cached scoring results for a resume:

- Query `match_results` table filtered by `resume_id` and `type = "scoring"`
- Return array of `MatchResultItem` objects

### 5. Frontend: Update API types and functions

**File**: [`lib/api/match.ts`](lib/api/match.ts)

- Add `resumeId` to `BatchMatchRequest` interface
- Add new `fetchBatchCache` function to call the GET endpoint

### 6. Frontend: Update batch matching hook

**File**: [`hooks/useBatchMatching.ts`](hooks/useBatchMatching.ts)

- Pass `resumeId` in batch API request payload
- On mount: load `results` from database via new API
- Keep sessionStorage for runtime metadata only: `isComplete`, `processedJobs`, `totalJobs`, `timestamp`

### 7. Update sessionStorage cache structure

**File**: [`lib/storage/batch-match-cache.ts`](lib/storage/batch-match-cache.ts)

- Remove `results` from sessionStorage (now in database)
- Keep only runtime metadata: `resumeId`, `isComplete`, `processedJobs`, `totalJobs`, `timestamp`

## Data Storage Strategy

| Data | Storage | Reason |
|------|---------|--------|
| `results` (MatchResultItem[]) | Database | Persistent across sessions |
| `isComplete` | sessionStorage | Runtime state for UI |
| `processedJobs` | sessionStorage | Progress indicator |
| `totalJobs` | sessionStorage | Progress indicator |
| `timestamp` | sessionStorage | Cache validation |
| `resumeId` | sessionStorage | Cache key validation |

## Source Field Convention

- `source: "single"` - Results from single job matching (detail page)
- `source: "batch"` - Results from batch matching (jobs list page)