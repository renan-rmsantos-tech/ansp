"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  testId?: string;
  size?: "sm" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  testId,
  size = "sm",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = testId ? `${testId}-title` : "modal-title";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const sizeClass =
    size === "lg"
      ? "h-[min(85vh,52rem)] w-[min(92vw,56rem)]"
      : "w-full max-w-sm";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`admin-modal fixed inset-0 m-auto max-h-[calc(100vh-2rem)] overflow-hidden rounded-lg border border-border bg-surface p-0 text-fg shadow-none backdrop:bg-[oklch(22%_0.06_250/0.32)] ${sizeClass}`}
      data-testid={testId}
      aria-labelledby={titleId}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3">
          <h2
            id={titleId}
            className="min-w-0 truncate text-sm font-semibold text-fg"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-bg hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label="Fechar"
            data-testid={testId ? `${testId}-close` : undefined}
          >
            Fechar
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </dialog>
  );
}
