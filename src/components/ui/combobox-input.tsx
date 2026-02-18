"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ComboboxInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ComboboxInput({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered =
    value.length === 0
      ? options
      : options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()));

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setOpen(true);
    setHighlighted(-1);
  }

  function handleSelect(opt: string) {
    onChange(opt);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-northpeak-green",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-northpeak-surface bg-northpeak-card py-1 shadow-xl"
        >
          {filtered.map((opt, i) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm text-northpeak-text transition-colors",
                i === highlighted
                  ? "bg-northpeak-green/15 text-northpeak-green"
                  : "hover:bg-northpeak-surface"
              )}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
