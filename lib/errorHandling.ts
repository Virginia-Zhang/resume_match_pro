/**
 * @file errorHandling.ts
 * @description Unified error handling utilities for user-friendly error messages.
 * @description ユーザーフレンドリーなエラーメッセージ用の統一エラーハンドリングユーティリティ。
 * @author Virginia Zhang
 * @remarks Reusable error handling functions across the application.
 * @remarks アプリケーション全体で再利用可能なエラーハンドリング関数。
 */

/**
 * @description Friendly error message structure with user-friendly message and retry information
 * @description ユーザーフレンドリーなメッセージと再試行情報を含むエラーメッセージ構造
 */
export interface FriendlyErrorMessage {
  /** User-friendly error message / ユーザーフレンドリーなエラーメッセージ */
  message: string;
  /** Whether this error is retryable / このエラーが再試行可能かどうか */
  isRetryable: boolean;
}

/**
 * @description Check if error message indicates gateway timeout
 * @description エラーメッセージがゲートウェイタイムアウトを示しているかチェック
 * @param msg Error message to check
 * @param msg チェックするエラーメッセージ
 * @returns True if it's a gateway timeout error
 * @returns ゲートウェイタイムアウトエラーの場合true
 */
export function isGatewayTimeoutMessage(msg: string | null): boolean {
  if (!msg) return false;
  return /\b504\b|gateway\s*time-?out|dify\s*http\s*504/i.test(msg);
}

/**
 * @description Get user-friendly error message for any error type
 * @description あらゆるエラータイプに対してユーザーフレンドリーなエラーメッセージを取得
 * @param error The raw error message or Error object
 * @param error 生のエラーメッセージまたはErrorオブジェクト
 * @returns User-friendly error message and retry information
 * @returns ユーザーフレンドリーなエラーメッセージと再試行情報
 * @remarks If you need custom error handling, create a FriendlyErrorMessage object directly instead of calling this function
 * @remarks カスタムエラーハンドリングが必要な場合は、この関数を呼び出す代わりにFriendlyErrorMessageオブジェクトを直接作成してください
 */
export function getFriendlyErrorMessage(
  error: unknown
): FriendlyErrorMessage {
  // Extract error message from various error types
  let errorMessage: string;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = '不明なエラーが発生しました。';
  }

  // Gateway timeout errors
  if (isGatewayTimeoutMessage(errorMessage)) {
    return {
      message: '分析処理がタイムアウトしました。ページを更新して再試行してください。',
      isRetryable: true,
    };
  }

  // Network errors
  if (/network|fetch|connection|timeout/i.test(errorMessage)) {
    return {
      message: 'ネットワークエラーが発生しました。インターネット接続を確認して再試行してください。',
      isRetryable: true,
    };
  }

  // Server errors (5xx)
  if (/\b5\d{2}\b/.test(errorMessage)) {
    return {
      message: 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください。',
      isRetryable: true,
    };
  }

  // Client errors (4xx) - usually not retryable
  if (/\b4\d{2}\b/.test(errorMessage)) {
    return {
      message: 'リクエストに問題があります。ページを更新して再試行してください。',
      isRetryable: true,
    };
  }

  // JSON parsing errors
  if (/json|parse|syntax/i.test(errorMessage)) {
    return {
      message: 'データの処理中にエラーが発生しました。ページを更新して再試行してください。',
      isRetryable: true,
    };
  }

  // Dify specific errors
  if (/dify|workflow/i.test(errorMessage)) {
    return {
      message: 'AI分析サービスでエラーが発生しました。しばらく時間をおいて再試行してください。',
      isRetryable: true,
    };
  }

  // Generic fallback for any other error
  return {
    message: '分析処理中にエラーが発生しました。ページを更新して再試行してください。',
    isRetryable: true,
  };
}
