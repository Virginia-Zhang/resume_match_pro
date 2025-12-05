/**
 * @file hooks/queries/useMatch.ts
 * @description TanStack Query mutations for scoring/details matching and batch matching.
 * @description スコアリング/詳細マッチングおよびバッチマッチング用の TanStack Query ミューテーション。
 * @author Virginia Zhang
 * @remarks Wraps match API helpers with consistent mutation keys and options.
 * @remarks マッチAPIヘルパーを一貫したミューテーションキーとともにラップ。
 */

"use client";

import {
    fetchBatchCache,
    matchBatch,
    matchDetails,
    matchScoring,
    type BatchCacheResponse,
    type BatchMatchRequest,
    type BatchMatchResponse,
    type MatchApiOptions,
} from "@/lib/api/match";
import { queryKeys } from "@/lib/react-query/query-keys";
import type {
    BaseRequestBody,
    DetailsEnvelope,
    ScoringEnvelope,
} from "@/types/matching";
import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export interface MatchScoringVariables extends BaseRequestBody {
  requestOptions?: MatchApiOptions;
}

export interface MatchDetailsVariables extends BaseRequestBody {
  requestOptions?: MatchApiOptions;
}

export interface BatchMatchVariables extends BatchMatchRequest {
  requestOptions?: MatchApiOptions;
}

/**
 * @description Mutation hook for scoring matching (type=scoring).
 * @description スコアリングマッチング用のミューテーションフック（type=scoring）。
 */
export function useMatchScoringMutation(
  options?: UseMutationOptions<
    ScoringEnvelope,
    Error,
    MatchScoringVariables,
    unknown
  >
) {
  return useMutation({
    mutationKey: queryKeys.match.scoring(),
    mutationFn: ({ requestOptions, ...body }) =>
      matchScoring(body, requestOptions),
    ...options,
  });
}

/**
 * @description Mutation hook for detail matching (type=details).
 * @description 詳細マッチング用のミューテーションフック（type=details）。
 */
export function useMatchDetailsMutation(
  options?: UseMutationOptions<
    DetailsEnvelope,
    Error,
    MatchDetailsVariables,
    unknown
  >
) {
  return useMutation({
    mutationKey: queryKeys.match.details(),
    mutationFn: ({ requestOptions, ...body }) =>
      matchDetails(body, requestOptions),
    ...options,
  });
}

/**
 * @description Mutation hook for batch job matching workflow.
 * @description バッチ求人マッチングワークフロー用のミューテーションフック。
 */
export function useBatchMatchingMutation(
  options?: UseMutationOptions<
    BatchMatchResponse,
    Error,
    BatchMatchVariables,
    unknown
  >
) {
  return useMutation({
    mutationKey: queryKeys.match.batch(),
    mutationFn: ({ requestOptions, ...payload }) =>
      matchBatch(payload, requestOptions),
    ...options,
  });
}

/**
 * @description Backward-compatible alias to keep naming consistent with existing hooks.
 * @description 既存フックとの命名互換性を保つためのエイリアス。
 */
export const useBatchMatching = useBatchMatchingMutation;

/**
 * @description Query hook for fetching all cached scoring results (batch + single) from database.
 * @description データベースからすべてのキャッシュされたスコアリング結果（バッチ＋単一）を取得するクエリフック。
 * @param resumeId Resume ID to fetch cached results for.
 * @param resumeId キャッシュ結果を取得するレジュメID。
 * @param options Optional TanStack Query configuration.
 * @param options オプションの TanStack Query 設定。
 * @remarks Returns all scoring results regardless of source (batch or single matching).
 * @remarks ソースに関係なくすべてのスコアリング結果を返します（バッチまたは単一マッチング）。
 */
export function useBatchCacheQuery(
  resumeId?: string | null,
  options?: Omit<UseQueryOptions<BatchCacheResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.match.batchCache(resumeId),
    queryFn: () => {
      if (!resumeId) {
        return { results: [] };
      }
      return fetchBatchCache(resumeId);
    },
    enabled: Boolean(resumeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}


