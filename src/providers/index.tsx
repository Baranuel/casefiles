"use client";

import { ConfirmProvider } from "./ConfirmProvider";
import TanstackProvider from "./TanstackProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TanstackProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </TanstackProvider>
  );
};
