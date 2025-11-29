"use client";

import { PrimaryCtaButton } from "@/components/common/buttons/CtaButtons";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobCategories } from "@/hooks/queries/useJobs";
import React from "react";

/**
 * @file JobFilters.tsx
 * @description Job filtering component with category, residence, and location filters
 * @description 職種、居住地、勤務地による求人フィルタリングコンポーネント
 * @author Virginia Zhang
 * @remarks Client component for job filtering UI
 * @remarks 求人フィルタリングUI用のクライアントコンポーネント
 */

// Residence options for filter
// フィルター用の居住地オプション
const residenceOptions = [
  { label: "日本", value: "japan" },
  { label: "海外", value: "overseas" },
];

// Location options for work location filter
// 勤務地フィルター用のロケーションオプション
const locationOptions = [
  { label: "東京都", value: "tokyo" },
  { label: "その他", value: "other" },
];

interface JobFiltersProps {
  readonly selectedCategories: string[];
  readonly onCategoriesChange: (categories: string[]) => void;
  readonly selectedResidence: string;
  readonly onResidenceChange: (residence: string) => void;
  readonly selectedLocations: string[];
  readonly onLocationsChange: (locations: string[]) => void;
  readonly onMatch: () => void;
  readonly isMatching: boolean;
}

/**
 * @component JobFilters
 * @description Filter UI for job search with multi-select and single-select dropdowns
 * @description 複数選択と単一選択ドロップダウンによる求人検索フィルターUI
 * @param {JobFiltersProps} props - Component props
 * @param {JobFiltersProps} props コンポーネントのプロパティ
 * @returns {React.ReactElement} Job filters component
 * @returns {React.ReactElement} 求人フィルターコンポーネント
 */
export default function JobFilters({
  selectedCategories,
  onCategoriesChange,
  selectedResidence,
  onResidenceChange,
  selectedLocations,
  onLocationsChange,
  onMatch,
  isMatching,
}: JobFiltersProps): React.ReactElement {
  /**
   * @description Fetch job categories via TanStack Query to populate the filter dropdown.
   * @description TanStack Query を用いて求人カテゴリを取得し、フィルターに表示。
   */
  const {
    data: jobCategories = [],
    isLoading: categoriesLoading,
  } = useJobCategories();

  // Check if required filters are selected to enable matching button
  // マッチングボタンを有効にするために必要なフィルターが選択されているかチェック
  const canMatch = selectedCategories.length > 0 && selectedResidence !== "";

  return (
    <div className="w-full space-y-4">
      {/* Filter Controls */}
      {/* フィルターコントロール */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        {/* Job Category Multi-Select (Required) */}
        {/* 職種複数選択（必須） */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground mb-1 block">
            <span className="text-red-500">*</span> 職種
          </p>
          <MultiSelect
            options={jobCategories}
            selected={selectedCategories}
            onChange={onCategoriesChange}
            placeholder={categoriesLoading ? "読み込み中..." : "職種を選択"}
            className="w-full"
          />
        </div>

        {/* Residence Single-Select (Required) */}
        {/* お住まい単一選択（必須） */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground mb-1 block">
            <span className="text-red-500">*</span> お住まい
          </p>
          <Select value={selectedResidence} onValueChange={onResidenceChange}>
            <SelectTrigger className="w-full min-h-[42px]">
              <SelectValue placeholder="お住まいを選択" />
            </SelectTrigger>
            <SelectContent>
              {residenceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Work Location Multi-Select (Optional) */}
        {/* 勤務地複数選択（任意） */}
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs text-muted-foreground mb-1 block">
            勤務地
          </p>
          <MultiSelect
            options={locationOptions}
            selected={selectedLocations}
            onChange={onLocationsChange}
            placeholder="勤務地を選択"
            className="w-full"
          />
        </div>

        {/* AI Matching Button */}
        {/* AIマッチングボタン */}
        <div className="flex-shrink-0">
          <PrimaryCtaButton
            onClick={onMatch}
            disabled={!canMatch || isMatching}
            className="w-full sm:w-auto h-[42px] px-6"
          >
            {isMatching ? "分析中..." : "AIマッチング"}
          </PrimaryCtaButton>
        </div>
      </div>
    </div>
  );
}

