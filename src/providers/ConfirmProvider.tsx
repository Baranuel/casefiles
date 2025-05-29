"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmOptions = {
  title?: string;
  description?: string;
  okText?: string;
  cancelText?: string;
};

type ConfirmInstance = Required<ConfirmOptions> & {
  id: number;
  resolve: () => void;
  reject: (message?: string) => void;
};

interface ConfirmContextType {
  confirmModal: (options?: ConfirmOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [queue, setQueue] = useState<ConfirmInstance[]>([]);
  const nextId = useRef(1);

  const confirmModal = useCallback((opts: ConfirmOptions = {}) => {
    const id = nextId.current++;

    const instance: ConfirmInstance = {
      id,
      title: opts.title ?? "Are you sure?",
      description: opts.description ?? "",
      okText: opts.okText ?? "OK",
      cancelText: opts.cancelText ?? "Cancel",
      resolve: () => {},
      reject: () => {},
    };

    return new Promise<void>((resolve, reject) => {
      instance.resolve = resolve;
      instance.reject = reject;
      setQueue((q) => [...q, instance]);
    });
  }, []);

  const remove = useCallback((id: number) => {
    setQueue((q) => q.filter((inst) => inst.id !== id));
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirmModal }}>
      {children}
      {queue.map((inst) => (
        <ConfirmDialog
          key={inst.id}
          instance={inst}
          onExited={() => remove(inst.id)}
        />
      ))}
    </ConfirmContext.Provider>
  );
};

const ConfirmDialog: React.FC<{
  instance: ConfirmInstance;
  onExited: () => void;
}> = ({ instance, onExited }) => {
  const { title, description, okText, cancelText, resolve, reject } = instance;
  const [open, setOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCancel = () => {
    setOpen(false);
    reject("User cancelled");
  };

  const handleOk = () => {
    setOpen(false);
    resolve();
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onAnimEnd = () => {
      if (!open) onExited();
    };
    el.addEventListener("animationend", onAnimEnd);
    return () => el.removeEventListener("animationend", onAnimEnd);
  }, [open, onExited]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent ref={contentRef}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button className="bg-red-800 text-white hover:bg-red-900 cursor-pointer" onClick={handleOk}>{okText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
