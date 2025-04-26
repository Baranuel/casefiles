import { cn } from "@/utils/cn";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionWrapper = ({ children, className }: SectionWrapperProps) => {
  return (
    <section 
      className={cn(
        "flex flex-col w-full min-h-[400px] md:min-h-[600px] px-4 lg:px-20 py-12 lg:py-24",
        "[&>div]:flex-1 [&>div]:h-full", // This applies flex-1 to all direct children
        className
      )}
    >
        {children}
    </section>
  );
};