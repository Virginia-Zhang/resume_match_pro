/**
 * @file index.ts
 * @description Barrel export for client-side storage utilities.
 * @description クライアントサイドストレージユーティリティのバレルエクスポート。
 * @author Virginia Zhang
 */

export {
    clearBatchMatchCache,
    loadBatchMatchCache,
    saveBatchMatchCache,
    type CachedBatchMatchData,
} from "./batch-match-cache";
export { resumePointer } from "./resume-pointer";

