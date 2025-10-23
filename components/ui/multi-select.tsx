"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

/**
 * @file multi-select.tsx
 * @description Multi-select dropdown component for filtering options
 * @description 複数選択可能なドロップダウンコンポーネント
 * @author Virginia Zhang
 * @remarks Client component using shadcn/ui primitives
 * @remarks shadcn/ui プリミティブを使用するクライアントコンポーネント
 */

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * @component MultiSelect
 * @description Multi-select dropdown with search and badge display
 * @description 検索とバッジ表示機能付きの複数選択ドロップダウン
 * @param {MultiSelectProps} props - Component props
 * @param {MultiSelectProps} props コンポーネントのプロパティ
 * @returns {React.ReactElement} Multi-select component
 * @returns {React.ReactElement} 複数選択コンポーネント
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "選択してください",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  /**
   * @description Handle option selection/deselection
   * @description オプションの選択/選択解除を処理
   */
  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  /**
   * @description Handle option toggle
   * @description オプションの切り替えを処理
   */
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[42px] h-auto",
            selected.length > 0 && "h-auto",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
              {selected.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge
                  variant="secondary"
                  key={value}
                  className="mr-1 mb-1 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(value);
                  }}
                >
                  {option?.label}
                  <span
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex items-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(value);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(value);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="検索..." />
          <CommandList>
            <CommandEmpty>見つかりませんでした</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

