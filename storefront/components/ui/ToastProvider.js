"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  const addToast = (toast) => {
    const id = crypto.randomUUID();
    const next = { id, title: toast.title, description: toast.description, tone: toast.tone || "neutral" };
    setToasts((prev) => [...prev, next]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = useMemo(() => ({ addToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastCard({ toast }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    neutral: "border-slate-200 bg-white text-slate-800"
  };
  const tone = tones[toast.tone] || tones.neutral;

  return (
    <div className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 shadow ${tone}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2 w-2 rounded-full bg-current" />
        <div className="space-y-1">
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
        </div>
      </div>
    </div>
  );
}
