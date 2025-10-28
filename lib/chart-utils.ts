/**
 * @file chart-utils.ts
 * @description Utility functions for chart rendering and interaction
 * @description チャートレンダリングとインタラクション用のユーティリティ関数
 * @author Virginia Zhang
 * @remarks Pure functions for chart data processing and event handling
 * @remarks チャートデータ処理とイベント処理用の純粋関数
 */

import type { HoverState } from "@/types/matching";
import React from "react";

/**
 * @description Normalize scores data for radar chart display
 * @description レーダーチャート表示用のスコアデータを正規化
 * @param scores Raw scores object
 * @param scores 生のスコアオブジェクト
 * @returns Normalized scores array for radar chart
 * @returns レーダーチャート用の正規化されたスコア配列
 */
export function normalizeScores(scores: Record<string, number> | undefined) {
  // Map English keys to Japanese labels for display
  // 表示用に英語キーを日本語ラベルにマッピング
  const labelMap: Record<string, string> = {
    skills: "技術スキル",
    experience: "経験",
    projects: "プロジェクト",
    education: "学歴",
    soft: "ソフトスキル",
  };

  // Create fallback data with all labels set to 0
  // すべてのラベルを0に設定したフォールバックデータを作成
  const fallback = Object.values(labelMap).map(name => ({ name, value: 0 }));
  if (!scores) return fallback;

  // Convert scores object to array format for radar chart
  // スコアオブジェクトをレーダーチャート用の配列形式に変換
  const items = Object.entries(scores).map(([rawName, value]) => {
    // Use Japanese label if available, otherwise use original key
    // 利用可能な場合は日本語ラベルを使用、そうでなければ元のキーを使用
    const name = labelMap[rawName] || rawName;
    return { name, value: Number(value) };
  });
  return items;
}

/**
 * @description Handles radar chart mouse move events for hover state management
 * @description レーダーチャートのマウス移動イベントを処理してホバー状態を管理
 * @param state Recharts mouse move state object from onMouseMove event
 * @param state onMouseMoveイベントからのRechartsマウス移動状態オブジェクト
 * @param setHover State setter function for hover information
 * @param setHover ホバー情報の状態セッター関数
 * @param currentHover Current hover state for comparison to avoid unnecessary updates
 * @param currentHover 不要な更新を避けるための比較用現在のホバー状態
 * @remarks This function extracts hover data from Recharts event and updates state efficiently
 * @remarks この関数はRechartsイベントからホバーデータを抽出し、効率的に状態を更新
 */
export function handleRadarChartMouseMove(
  state: unknown,
  setHover: React.Dispatch<React.SetStateAction<HoverState | null>>,
  currentHover: HoverState | null
): void {
  // Type assertion to access Recharts event structure
  // Rechartsイベント構造にアクセスするための型アサーション
  const payload = (
    state as unknown as {
      isTooltipActive?: boolean;
      activePayload?: Array<{
        payload?: { name?: string; value?: number };
      }>;
    }
  )?.activePayload;
  
  // Extract the first payload item (radar chart typically has one data point per axis)
  // 最初のペイロードアイテムを抽出（レーダーチャートは通常軸ごとに1つのデータポイントを持つ）
  const p = payload && payload[0] && payload[0].payload;
  const name = (p?.name as string) || "";
  const value = Number(p?.value);
  
  // Validate extracted data - if invalid, clear hover state
  // 抽出されたデータを検証 - 無効な場合はホバー状態をクリア
  if (!name || Number.isNaN(value)) {
    if (currentHover !== null) setHover(null);
    return;
  }
  
  // Update hover state only if the data has actually changed
  // データが実際に変更された場合のみホバー状態を更新
  // This prevents unnecessary re-renders when hovering over the same data point
  // これにより、同じデータポイント上でホバーしても不要な再レンダリングを防ぐ
  setHover(prev =>
    prev && prev.name === name && prev.value === value
      ? prev  // Return same object reference if data unchanged
      : { name, value }  // Create new object if data changed
  );
}

/**
 * @description Renders overview text with proper sentence formatting
 * @description 適切な文のフォーマットで概要テキストをレンダリング
 * @param overviewText The overview text to format
 * @param overviewText フォーマットする概要テキスト
 * @returns JSX elements for formatted overview text
 * @returns フォーマットされた概要テキストのJSX要素
 * @remarks Splits text by Japanese sentence endings and adds proper punctuation
 * @remarks 日本語の文末でテキストを分割し、適切な句読点を追加
 */
export function renderOverviewText(overviewText: string): React.JSX.Element[] {
  return overviewText
    .split(/[。！？]/)
    .filter(sentence => sentence.trim())
    .map((sentence, index) => {
      // Create a div element for each sentence with proper formatting
      // 各文に対して適切なフォーマットでdiv要素を作成
      return React.createElement('div', { key: index, className: "mb-2" }, [
        // First child: trimmed sentence text
        // 最初の子要素：トリムされた文のテキスト
        sentence.trim(),
        // Second child: conditionally add period if sentence doesn't end with punctuation
        // 2番目の子要素：文が句読点で終わっていない場合に条件付きで句点を追加
        sentence.trim() &&
          !sentence.endsWith("。") &&
          !sentence.endsWith("！") &&
          !sentence.endsWith("？") &&
          "。"
      ]);
    });
}
