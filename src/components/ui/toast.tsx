"use client";

import { useCallback, createContext } from "react";
import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

/**
 * useToast — Now backed by Sonner for all contexts.
 * Works both inside and outside of ToastProvider.
 */
export function useToast() {

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      // Always use Sonner — better UX
      switch (type) {
        case "success":
          sonnerToast.success(message);
          break;
        case "error":
          sonnerToast.error(message);
          break;
        case "info":
          sonnerToast.info(message);
          break;
        default:
          sonnerToast(message);
      }
    },
    []
  );

  return { addToast };
}

/**
 * ToastProvider — Kept for backward compat, now a thin wrapper.
 * The actual rendering is done by Sonner's <Toaster /> in admin-layout-client.tsx
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
    </ToastContext.Provider>
  );
}
