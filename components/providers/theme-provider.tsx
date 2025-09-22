/**
 * @file theme-provider.tsx
 * @description Theme provider component using next-themes for dark/light mode switching.
 * @description ダーク/ライトモード切り替えのためのnext-themesを使用したテーマプロバイダーコンポーネント。
 * @author Virginia Zhang
 * @remarks Client component. Wraps the app with theme context.
 * @remarks クライアントコンポーネント。アプリをテーマコンテキストでラップ。
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
