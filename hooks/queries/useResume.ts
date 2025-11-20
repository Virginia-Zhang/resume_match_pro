/**
 * @file hooks/queries/useResume.ts
 * @description TanStack Query hooks for resume parsing, upload, and text retrieval.
 * @description レジュメ解析・アップロード・テキスト取得用の TanStack Query フック。
 * @author Virginia Zhang
 * @remarks Client hooks layering React Query over resume API helpers.
 * @remarks レジュメAPIヘルパーの上にReact Queryを重ねるクライアントフック。
 */

"use client";

import {
    fetchResumeText,
    parsePdf,
    uploadResume,
    type ParsePdfResponse,
    type ResumeApiOptions,
    type ResumeUploadResponse,
} from "@/lib/api/resume";
import { queryKeys } from "@/lib/react-query/query-keys";
import { useMutation, useQuery, type UseMutationOptions } from "@tanstack/react-query";

interface UseResumeTextOptions extends ResumeApiOptions {
  enabled?: boolean;
}

export interface ParsePdfVariables {
  file: File;
  requestOptions?: ResumeApiOptions;
}

export interface UploadResumeVariables {
  resumeText: string;
  requestOptions?: ResumeApiOptions;
}

/**
 * @description Fetch resume text by resumeId via TanStack Query.
 * @description TanStack Query で resumeId からレジュメテキストを取得するフック。
 */
export function useResumeText(
  resumeId?: string | null,
  options?: UseResumeTextOptions
) {
  const { enabled = true, ...requestOptions } = options ?? {};

  return useQuery({
    queryKey: queryKeys.resume.text(resumeId),
    queryFn: ({ signal }) => {
      if (!resumeId) {
        throw new Error("resumeId is required to fetch resume text");
      }
      return fetchResumeText(resumeId, { ...requestOptions, signal });
    },
    enabled: Boolean(resumeId) && enabled,
  });
}

/**
 * @description Mutation hook for PDF parsing (POST /api/parse).
 * @description PDF解析用のミューテーションフック（/api/parse）。
 */
export function useParsePdfMutation(
  options?: UseMutationOptions<
    ParsePdfResponse,
    Error,
    ParsePdfVariables,
    unknown
  >
) {
  return useMutation({
    mutationKey: queryKeys.resume.parse(),
    mutationFn: ({ file, requestOptions }) => parsePdf(file, requestOptions),
    ...options,
  });
}

/**
 * @description Mutation hook for uploading resume text (POST /api/resume).
 * @description レジュメテキストアップロード用のミューテーションフック（/api/resume）。
 */
export function useUploadResumeMutation(
  options?: UseMutationOptions<
    ResumeUploadResponse,
    Error,
    UploadResumeVariables,
    unknown
  >
) {
  return useMutation({
    mutationKey: queryKeys.resume.upload(),
    mutationFn: ({ resumeText, requestOptions }) =>
      uploadResume(resumeText, requestOptions),
    ...options,
  });
}


