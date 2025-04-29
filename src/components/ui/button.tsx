import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 hover:bg-primary-700 text-white",
        secondary: "bg-primary-100 hover:bg-primary-200 text-primary-800",
        ghost: "hover:bg-primary-50 text-primary-600",
        destructive: "bg-red-600 hover:bg-red-700 text-white",
        outline: "border border-primary-200 hover:bg-primary-50 text-primary-600",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
      },
      isLoading: {
        true: "opacity-70 pointer-events-none",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      isLoading: false,
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
