import { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const showToast = useCallback((type, message, options) => {
    const toastOptions = {
      duration: 4000,
      style: {
        borderRadius: "12px",
        background: "#1e293b",
        color: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      },
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, { ...toastOptions, style: { ...toastOptions.style, background: "#7f1d1d" } });
        break;
      case "info":
        toast(message, { ...toastOptions, icon: "ℹ️" });
        break;
      case "warning":
        toast(message, { ...toastOptions, icon: "⚠️", style: { ...toastOptions.style, background: "#713f12" } });
        break;
      default:
        toast(message, toastOptions);
    }
  }, []);

  const contextValue = {
    success: (message, opts) => showToast("success", message, opts),
    error: (message, opts) => showToast("error", message, opts),
    info: (message, opts) => showToast("info", message, opts),
    warning: (message, opts) => showToast("warning", message, opts),
    showToast,
  };

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}