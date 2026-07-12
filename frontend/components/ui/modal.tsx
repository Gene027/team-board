"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
  className,
  bodyClassName,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 py-4 backdrop-blur-sm sm:items-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        type="button"
        onClick={onClose}
      />
      <section
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg animate-in flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6",
          className,
        )}
      >
        <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <Button
            aria-label="Close modal"
            className="size-9 shrink-0 p-0"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <FiX className="size-5" />
          </Button>
        </div>
        <div className={cn("min-h-0", bodyClassName)}>{children}</div>
      </section>
    </div>
  );
}
