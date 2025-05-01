"use client";

import TanstackProvider from "./TanstackProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <TanstackProvider>{children}</TanstackProvider>;
};
