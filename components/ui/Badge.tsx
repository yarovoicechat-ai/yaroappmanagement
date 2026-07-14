import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-dosti-600 text-slate-50 hover:bg-dosti-600/80",
                secondary:
                    "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-800/80",
                destructive:
                    "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50",
                success:
                    "border-transparent bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/50",
                outline: "text-slate-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
