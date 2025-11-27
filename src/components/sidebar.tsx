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
    LucideIcon
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
            { title: "Teams", href: "/dashboard/teams", icon: Users },
            { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
            { title: "Clients", href: "/dashboard/clients", icon: UserCircle },
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
            "flex flex-col h-screen bg-[#F2F1EF] border-r border-[#E0E0E0] transition-all duration-300",
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

            <div className="p-3 border-t border-[#E0E0E0]">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        pathname === "/dashboard/settings"
                            ? "bg-white text-black shadow-sm"
                            : "text-[#666666] hover:bg-white/50 hover:text-black"
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
                <h3 className="px-3 mb-2 text-xs font-semibold text-[#999999] uppercase tracking-wider">
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
                                    ? "bg-white text-black shadow-sm"
                                    : "text-[#666666] hover:bg-white/50 hover:text-black"
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                                <span className="flex-1">{item.title}</span>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[#F5F5F5] text-[#333333] rounded-full">
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
