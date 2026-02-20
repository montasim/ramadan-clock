import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "primary" | "sehri" | "iftar"
}

const variantStyles = {
  default: "bg-accent",
  primary: "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
  sehri: "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
  iftar: "bg-gradient-to-r from-violet-500/20 to-cyan-500/20",
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md", variantStyles[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
