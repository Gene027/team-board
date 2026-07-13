"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { cn } from "@/lib/utils";

const MENU_GAP = 8;
const MENU_VIEWPORT_PADDING = 16;
const MENU_MAX_HEIGHT = 256;
const MENU_MIN_HEIGHT = 112;

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function Select({
  label,
  options,
  value,
  placeholder = "Select option",
  error,
  disabled = false,
  onChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"bottom" | "top">("bottom");
  const [menuMaxHeight, setMenuMaxHeight] = useState(MENU_MAX_HEIGHT);
  const selectId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateMenuLayout = () => {
      const triggerElement = triggerRef.current;

      if (!triggerElement) {
        return;
      }

      const triggerRect = triggerElement.getBoundingClientRect();
      const spaceBelow =
        window.innerHeight -
        triggerRect.bottom -
        MENU_GAP -
        MENU_VIEWPORT_PADDING;
      const spaceAbove = triggerRect.top - MENU_GAP - MENU_VIEWPORT_PADDING;
      const shouldOpenUp = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;
      const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;

      setMenuPlacement(shouldOpenUp ? "top" : "bottom");
      setMenuMaxHeight(
        Math.max(
          MENU_MIN_HEIGHT,
          Math.min(MENU_MAX_HEIGHT, Math.floor(availableSpace)),
        ),
      );
    };

    updateMenuLayout();
    window.addEventListener("resize", updateMenuLayout);
    window.addEventListener("scroll", updateMenuLayout, true);

    return () => {
      window.removeEventListener("resize", updateMenuLayout);
      window.removeEventListener("scroll", updateMenuLayout, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative block space-y-2" ref={containerRef}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button
        aria-controls={selectId}
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          isOpen && "border-slate-400 ring-4 ring-slate-100",
        )}
        disabled={disabled}
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-bold",
              selectedOption ? "text-slate-950" : "text-slate-400",
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          {selectedOption?.description ? (
            <span className="block truncate text-xs font-medium text-slate-400">
              {selectedOption.description}
            </span>
          ) : null}
        </span>
        {isOpen ? (
          <FiChevronUp className="size-5 shrink-0 text-slate-500" />
        ) : (
          <FiChevronDown className="size-5 shrink-0 text-slate-500" />
        )}
      </button>

      {isOpen ? (
        <div
          className={cn(
            "absolute left-0 right-0 z-[70] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/10",
            menuPlacement === "top"
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]",
          )}
          id={selectId}
          role="listbox"
          style={{ maxHeight: menuMaxHeight }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition",
                  isSelected
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                )}
                key={option.value}
                role="option"
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold">{option.label}</span>
                  {option.description ? (
                    <span
                      className={cn(
                        "block truncate text-xs font-medium",
                        isSelected ? "text-slate-300" : "text-slate-400",
                      )}
                    >
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {isSelected ? <FiCheck className="size-4 shrink-0" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <span className="block text-sm font-medium text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
