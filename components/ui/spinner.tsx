import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block rounded-full border-current border-r-transparent animate-spin',
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }
