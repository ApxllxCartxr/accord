"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    UserCircle,
    DollarSign,
    Building2,
    Settings,
    LucideIcon,
    FileText,
    CheckSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { OrgSwitcher } from "./org-switcher"
import { useState } from "react"

interface NavItem {
    title: string
    href: string
    icon: LucideIcon
    badge?: number
}

interface NavSection {
    title: string
    items: NavItem[]
}

interface SidebarProps {
    orgName: string
    orgPlan?: string
    orgLogo?: string | null
}

export function Sidebar({ orgName, orgPlan, orgLogo }: SidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const dashboardSection: NavSection = {
        title: "DASHBOARD",
        items: [
            { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
            { title: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
            { title: "Teams", href: "/dashboard/teams", icon: Users },
            { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
            { title: "Clients", href: "/dashboard/clients", icon: UserCircle },
            { title: "Contracts", href: "/dashboard/contracts", icon: FileText },
            { title: "Expenses", href: "/dashboard/expenses", icon: DollarSign },
        ]
    }

    const toolsSection: NavSection = {
        title: "TOOLS",
        items: [
            { title: "Organization", href: "/dashboard/tools/organization", icon: Building2 },
        ]
    }

    return (
        <aside className={cn(
            "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <OrgSwitcher
                orgName={orgName}
                orgPlan={orgPlan}
                orgLogo={orgLogo}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                isCollapsed={isCollapsed}
            />

            <nav className="flex-1 overflow-y-auto p-3 space-y-6">
                <NavSection section={dashboardSection} pathname={pathname} isCollapsed={isCollapsed} />
                <NavSection section={toolsSection} pathname={pathname} isCollapsed={isCollapsed} />
            </nav>

            <div className="p-3 border-t border-sidebar-border">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        pathname === "/dashboard/settings"
                            ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </div>
        </aside>
    )
}

function NavSection({ section, pathname, isCollapsed }: { section: NavSection, pathname: string, isCollapsed: boolean }) {
    return (
        <div>
            {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                </h3>
            )}
            <div className="space-y-1">
                {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="flex-1">{item.title}</span>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
