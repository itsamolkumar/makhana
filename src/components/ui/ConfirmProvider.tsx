"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type DialogTone = "default" | "danger" | "success";

type DialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: DialogTone;
};

type DialogState = DialogOptions & {
  mode: "confirm" | "alert";
  resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const toneMap: Record<
  DialogTone,
  { badge: string; button: string; icon: string; title: string }
> = {
  default: {
    badge: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    button: "bg-[var(--color-primary)] text-white",
    icon: "!",
    title: "Ready to continue",
  },
  danger: {
    badge: "bg-red-100 text-red-700",
    button: "bg-red-600 text-white",
    icon: "!",
    title: "Please confirm",
  },
  success: {
    badge: "bg-emerald-100 text-emerald-700",
    button: "bg-emerald-600 text-white",
    icon: "i",
    title: "Heads up",
  },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        mode: "confirm",
        resolve,
        confirmText: "Confirm",
        cancelText: "Cancel",
        tone: "default",
        ...options,
      });
    });
  }, []);

  const alert = useCallback((options: DialogOptions) => {
    return new Promise<void>((resolve) => {
      setDialog({
        mode: "alert",
        resolve: () => resolve(),
        confirmText: "Okay",
        tone: "success",
        ...options,
      });
    });
  }, []);

  const closeDialog = (accepted: boolean) => {
    if (!dialog) return;
    dialog.resolve(accepted);
    setDialog(null);
  };

  const value = useMemo(() => ({ confirm, alert }), [alert, confirm]);
  const tone = dialog ? toneMap[dialog.tone || "default"] : toneMap.default;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-[var(--color-bg)] shadow-2xl">
            <div className="bg-gradient-to-br from-white via-white to-[#f3ecdf] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${tone.badge}`}
                >
                  {tone.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                    {tone.title}
                  </p>
                  <h3 className="text-xl font-semibold text-[var(--heading-color)]">
                    {dialog.title}
                  </h3>
                </div>
              </div>

              {dialog.description ? (
                <p className="text-sm leading-6 text-gray-600">
                  {dialog.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {dialog.mode === "confirm" ? (
                  <button
                    type="button"
                    onClick={() => closeDialog(false)}
                    className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {dialog.cancelText}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => closeDialog(true)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90 ${tone.button}`}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }

  return context;
}
