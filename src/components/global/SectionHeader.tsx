import { ReactNode } from "react";

export const SectionHeader = ({ children }: { children: string | ReactNode }) => {
  return <h1 className="text-4xl lg:text-5xl font-black mb-6">{children}</h1>;
};
