"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, type: ToastType) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider
      value={{
        showSuccess: (msg) => show(msg, "success"),
        showError: (msg) => show(msg, "error"),
      }}
    >
      {children}

      {/* TOAST UI */}
      <div className="fixed top-5 right-5 z-[9999] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm shadow-lg text-white
              ${
                toast.type === "success"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
