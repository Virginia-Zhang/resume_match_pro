/**
 * @file theme-toggle.tsx
 * @description Theme toggle button component for switching between light/dark modes.
 * @description ライト/ダークモード切り替えのためのテーマトグルボタンコンポーネント。
 * @author Virginia Zhang
 * @remarks Client component. Uses next-themes useTheme hook.
 * @remarks クライアントコンポーネント。next-themesのuseThemeフックを使用。
 */

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
