"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* ================= TYPES ================= */

type ToastType = "success" | "error" | "progress";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  progress?: number;
};

type ToastContextType = {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;

  // 👇 PROGRESS TOAST
  showProgress: (id: number, msg: string, percent: number) => void;
  hideToast: (id: number) => void;
};

/* ================= CONTEXT ================= */

const ToastContext = createContext<ToastContextType | null>(null);

/* ================= PROVIDER ================= */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ===== BASIC TOAST ===== */

  function show(message: string, type: ToastType) {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      { id, message, type },
    ]);

    // auto hide success / error
    if (type !== "progress") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    }
  }

  /* ===== PROGRESS TOAST ===== */

  function showProgress(
    id: number,
    message: string,
    percent: number
  ) {
    setToasts((prev) => {
      const exists = prev.find((t) => t.id === id);

      if (exists) {
        return prev.map((t) =>
          t.id === id
            ? {
                ...t,
                message,
                type: "progress",
                progress: percent,
              }
            : t
        );
      }

      return [
        ...prev,
        {
          id,
          message,
          type: "progress",
          progress: percent,
        },
      ];
    });
  }

  function hideToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  /* ================= RENDER ================= */

  return (
    <ToastContext.Provider
      value={{
        showSuccess: (msg) => show(msg, "success"),
        showError: (msg) => show(msg, "error"),
        showProgress,
        hideToast,
      }}
    >
      {children}

      {/* ===== TOAST UI ===== */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              min-w-[280px]
              max-w-[360px]
              rounded-2xl
              px-5 py-4
              shadow-[0_10px_30px_rgba(0,0,0,0.15)]
              border-2
              font-medium
              text-[15px]
              tracking-wide
              animate-toast-drop
              ${
                toast.type === "success"
                  ? "bg-[#F7C59F] border-black text-black"
                  : toast.type === "error"
                  ? "bg-[#F28482] border-black text-black"
                  : "bg-[#BEE7E8] border-black text-black"
              }
            `}
          >
            <div className="flex flex-col gap-2">
              <div>{toast.message}</div>

              {/* PROGRESS BAR */}
              {toast.type === "progress" && (
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${toast.progress ?? 0}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
