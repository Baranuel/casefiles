import { cn } from "@/utils/cn";
import { ReactNode } from "react";

export const SectionHeader = ({
  children,
  className,
}: {
  children: string | ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={cn("text-4xl md:text-5xl font-black mb-8", className)}>
      {children}
    </h2>
  );
};
