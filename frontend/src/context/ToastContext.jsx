import { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const showToast = useCallback((type, message, options) => {
    const toastOptions = {
      duration: 4000,
      style: {
        borderRadius: "16px",
        background: "#e0e5ec",
        color: "#2d3748",
        fontWeight: 600,
        fontSize: "0.875rem",
        padding: "12px 18px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "8px 8px 16px #bcc5d4, -8px -8px 16px #ffffff",
      },
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, {
          ...toastOptions,
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        });
        break;
      case "error":
        toast.error(message, {
          ...toastOptions,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        });
        break;
      case "info":
        toast(message, {
          ...toastOptions,
          icon: "ℹ️",
        });
        break;
      case "warning":
        toast(message, {
          ...toastOptions,
          icon: "⚠️",
        });
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