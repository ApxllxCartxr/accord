"use client"

import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Fragment } from "react"

export function Breadcrumbs() {
    const pathname = usePathname()

    const segments = pathname.split("/").filter(Boolean)

    // Create breadcrumb items
    const breadcrumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        return { label, href, isLast: index === segments.length - 1 }
    })

    return (
        <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
                <Fragment key={crumb.href}>
                    {index > 0 && (
                        <ChevronRight className="h-4 w-4 text-[#999999]" />
                    )}
                    <span className={crumb.isLast
                        ? "font-medium text-[#333333]"
                        : "text-[#999999]"
                    }>
                        {crumb.label}
                    </span>
                </Fragment>
            ))}
        </div>
    )
}
