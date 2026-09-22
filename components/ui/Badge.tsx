import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-cyan-500/30 bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10",
                secondary:
                    "border-white/10 bg-slate-800/80 text-slate-300",
                destructive:
                    "border-rose-500/30 bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-500/10",
                success:
                    "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10",
                warning:
                    "border-amber-500/30 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10",
                outline:
                    "border-white/20 text-slate-200 bg-white/[0.03]",
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
