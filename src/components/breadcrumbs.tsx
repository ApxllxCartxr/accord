"use client"

import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { resolveBreadcrumbLabel } from "@/app/dashboard/actions"

export function Breadcrumbs() {
    const pathname = usePathname()
    const [labels, setLabels] = useState<Record<string, string>>({})

    const segments = pathname.split("/").filter(Boolean)

    useEffect(() => {
        async function resolveLabels() {
            const newLabels: Record<string, string> = {}
            for (const segment of segments) {
                if (!labels[segment]) {
                    // If it looks like an ID, try to resolve it
                    if (segment.length > 20) {
                        const name = await resolveBreadcrumbLabel(segment)
                        newLabels[segment] = name
                    } else {
                        newLabels[segment] = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
                    }
                }
            }
            if (Object.keys(newLabels).length > 0) {
                setLabels(prev => ({ ...prev, ...newLabels }))
            }
        }
        resolveLabels()
    }, [pathname])

    // Create breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        return { label, href, isLast: index === segments.length - 1 }
    })

    return (
        <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                    {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    {crumb.isLast ? (
                        <span className="font-medium text-foreground">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </Fragment>
            ))}
        </div>
    )
}
