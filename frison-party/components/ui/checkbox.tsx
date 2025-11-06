import { cn } from "@/lib/utils"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as React from "react"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "h-4 w-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500 disabled:opacity-50 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

