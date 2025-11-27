"use client"

import { Building2, ChevronsLeft } from "lucide-react"
import Image from "next/image"

interface OrgSwitcherProps {
    orgName: string
    orgPlan?: string
    orgLogo?: string | null
    onToggleCollapse: () => void
    isCollapsed: boolean
}

export function OrgSwitcher({ orgName, orgPlan = "Free Plan", orgLogo, onToggleCollapse, isCollapsed }: OrgSwitcherProps) {
    if (isCollapsed) {
        return (
            <div className="p-3 flex justify-center">
                <button
                    onClick={onToggleCollapse}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    aria-label="Expand sidebar"
                >
                    {orgLogo ? (
                        <Image src={orgLogo} alt={orgName} width={24} height={24} className="rounded" />
                    ) : (
                        <Building2 className="h-6 w-6 text-[#666666]" />
                    )}
                </button>
            </div>
        )
    }

    return (
        <div className="p-3">
            <div className="bg-white rounded-full px-3 py-2 flex items-center gap-3 shadow-sm border border-[#E5E5E5]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {orgLogo ? (
                        <Image src={orgLogo} alt={orgName} width={32} height={32} className="rounded-full" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black flex-shrink-0">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black truncate">
                            {orgName}
                        </p>
                        <p className="text-xs text-[#999999] truncate">
                            {orgPlan}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onToggleCollapse}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    aria-label="Collapse sidebar"
                >
                    <ChevronsLeft className="h-4 w-4 text-[#666666]" />
                </button>
            </div>
        </div>
    )
}
