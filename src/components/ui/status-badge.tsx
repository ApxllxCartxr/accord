import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
    AlertTriangle,
    Loader2,
    Send,
    History,
    CheckCircle2,
    XCircle,
    Clock,
    Circle
} from "lucide-react"

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
    {
        variants: {
            status: {
                default: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
                pending: "bg-orange-50 text-orange-600 ring-orange-500/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20",
                in_progress: "bg-blue-50 text-blue-600 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
                submitted: "bg-purple-50 text-purple-600 ring-purple-500/10 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/20",
                in_review: "bg-yellow-50 text-yellow-600 ring-yellow-500/10 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20",
                success: "bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20",
                failed: "bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
                expired: "bg-zinc-50 text-zinc-600 ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20",
                // Mappings for specific app statuses
                active: "bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20",
                completed: "bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20",
                on_hold: "bg-orange-50 text-orange-600 ring-orange-500/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20",
                archived: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
                won: "bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20",
                lost: "bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
                lead: "bg-blue-50 text-blue-600 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
                draft: "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
                sent: "bg-blue-50 text-blue-600 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
                signed: "bg-green-50 text-green-600 ring-green-500/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20",
                rejected: "bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
                low: "bg-blue-50 text-blue-600 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20",
                medium: "bg-yellow-50 text-yellow-600 ring-yellow-500/10 dark:bg-yellow-400/10 dark:text-yellow-400 dark:ring-yellow-400/20",
                high: "bg-orange-50 text-orange-600 ring-orange-500/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20",
                urgent: "bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
            },
        },
        defaultVariants: {
            status: "default",
        },
    }
)

const statusIcons = {
    default: Circle,
    pending: AlertTriangle,
    in_progress: Loader2,
    submitted: Send,
    in_review: History,
    success: CheckCircle2,
    failed: XCircle,
    expired: Clock,
    active: Loader2,
    completed: CheckCircle2,
    on_hold: AlertTriangle,
    archived: History,
    won: CheckCircle2,
    lost: XCircle,
    lead: Circle,
    draft: Circle,
    sent: Send,
    signed: CheckCircle2,
    rejected: XCircle,
    low: Circle,
    medium: Circle,
    high: AlertTriangle,
    urgent: AlertTriangle,
}

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement> {
    status: string
}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
    // Normalize status string to match keys (lowercase, replace spaces with underscores)
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_")

    // Check if the normalized status exists in our icons map (which matches variant keys)
    const variant = Object.keys(statusIcons).includes(normalizedStatus)
        ? normalizedStatus
        : "default"

    const Icon = statusIcons[variant as keyof typeof statusIcons] || Circle

    return (
        <div className={cn(statusBadgeVariants({ status: variant as any }), className)} {...props}>
            <Icon className="h-3 w-3" />
            <span className="capitalize">{status.replace(/_/g, " ").toLowerCase()}</span>
        </div>
    )
}

export { StatusBadge, statusBadgeVariants }
