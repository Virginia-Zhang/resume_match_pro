/**
 * @file index.ts
 * @description Barrel export for client-side storage utilities.
 * @description クライアントサイドストレージユーティリティのバレルエクスポート。
 * @author Virginia Zhang
 */

export {
  clearBatchMatchMetadata,
  loadBatchMatchMetadata,
  saveBatchMatchMetadata,
  type CachedBatchMatchMetadata,
} from "./batch-match-cache";