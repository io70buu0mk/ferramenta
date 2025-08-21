import React, { createContext, useContext, useState, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-white text-base font-semibold min-w-[220px] animate-fade-in-up transition-all
              ${toast.type === "success" ? "bg-green-500" : ""}
              ${toast.type === "error" ? "bg-red-500" : ""}
              ${toast.type === "info" ? "bg-amber-500" : ""}
              ${toast.type === "warning" ? "bg-yellow-500" : ""}
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Animazione fade-in-up
// Aggiungi in global.css o tailwind.config.js:
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; }
