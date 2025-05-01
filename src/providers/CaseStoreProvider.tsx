// src/providers/counter-store-provider.tsx
"use client";

import {
  CaseStore,
  createCaseStore,
} from "@/features/case-board/stores/case-store";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type CaseStoreApi = ReturnType<typeof createCaseStore>;

export const CounterStoreContext = createContext<CaseStoreApi | undefined>(
  undefined
);

export interface CounterStoreProviderProps {
  children: ReactNode;
}

export const CaseStoreProvider = ({ children }: CounterStoreProviderProps) => {
  const storeRef = useRef<CaseStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createCaseStore();
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  );
};

export const useCaseStore = <T,>(selector: (store: CaseStore) => T): T => {
  const counterStoreContext = useContext(CounterStoreContext);

  if (!counterStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`);
  }

  return useStore(counterStoreContext, selector);
};
