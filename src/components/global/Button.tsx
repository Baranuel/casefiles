import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white",
    secondary: "bg-primary-100 hover:bg-primary-200 text-primary-800",
    ghost: "hover:bg-primary-50 text-primary-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium",
        "rounded-lg transition-colors duration-200",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
};