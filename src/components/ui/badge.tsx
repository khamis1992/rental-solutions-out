
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        active: "border-transparent bg-emerald-500 text-white",
        pending_payment: "border-transparent bg-amber-500 text-white",
        pending_deposit: "border-transparent bg-amber-600 text-white",
        closed: "border-transparent bg-rose-500 text-white",
        success: "border-transparent bg-[#10B981] text-white", // Exact green from image
        warning: "border-transparent bg-[#F59E0B] text-white", // Exact amber from image
        rented: "border-transparent bg-[#3B82F6] text-white", // Exact blue from image
        reserve: "border-transparent bg-[#8B5CF6] text-white", // Exact purple from image
        maintenance: "border-transparent bg-[#F59E0B] text-white", // Exact amber from image
        police_station: "border-transparent bg-[#8B5CF6] text-white", // Exact purple from image
        accident: "border-transparent bg-[#EF4444] text-white", // Exact red from image
        stolen: "border-transparent bg-[#1F2937] text-white", // Exact black from image
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

