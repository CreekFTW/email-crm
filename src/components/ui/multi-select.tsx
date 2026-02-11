"use client";

import * as React from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedLabels = selected.map((value) => {
    const option = options.find((o) => o.value === value);
    return option ? option.label : value;
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "border-input flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30"
        )}
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedLabels.map((label, index) => (
              <Badge key={selected[index]} variant="secondary" className="gap-1 pr-1">
                {label}
                <span
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  onClick={(e) => handleRemove(selected[index], e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRemove(selected[index], e as unknown as React.MouseEvent);
                    }
                  }}
                  className={cn(
                    "hover:bg-muted rounded-full p-0.5 cursor-pointer",
                    disabled && "pointer-events-none opacity-50"
                  )}
                >
                  <X className="size-3" />
                </span>
              </Badge>
            ))
          )}
        </div>
        <ChevronDown
          className={cn("size-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent/50"
                )}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && (
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="text-muted-foreground py-2 text-center text-sm">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}