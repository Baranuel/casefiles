"use client";

import { CaseStoreProvider } from "./CaseStoreProvider";
import TanstackProvider from "./TanstackProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TanstackProvider>
      <CaseStoreProvider>{children}</CaseStoreProvider>
    </TanstackProvider>
  );
};
