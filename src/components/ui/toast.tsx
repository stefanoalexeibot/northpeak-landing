"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const Icon = toast.type === "success" ? CheckCircle : toast.type === "error" ? AlertCircle : Info;
  const color = toast.type === "success" ? "text-northpeak-green" : toast.type === "error" ? "text-red-400" : "text-blue-400";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-northpeak-surface bg-northpeak-card p-4 shadow-lg",
        "animate-in slide-in-from-right-full fade-in duration-300"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", color)} />
      <p className="text-sm text-northpeak-text flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-northpeak-text-dim hover:text-northpeak-text">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
