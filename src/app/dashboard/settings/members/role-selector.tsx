"use client"

import { useState, useTransition } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateMemberRole } from "./actions"
import { Badge } from "@/components/ui/badge"

type Role = "OWNER" | "ADMIN" | "TEAM_LEAD" | "MEMBER"

interface RoleSelectorProps {
    membershipId: string
    currentRole: Role
    orgId: string
    canEdit: boolean
}

export function RoleSelector({ membershipId, currentRole, orgId, canEdit }: RoleSelectorProps) {
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<string | null>(null)

    if (!canEdit) {
        return (
            <Badge variant={currentRole === "OWNER" ? "default" : "secondary"}>
                {currentRole.replace("_", " ")}
            </Badge>
        )
    }

    async function handleRoleChange(newRole: string) {
        if (newRole === currentRole) return

        setMessage(null)
        startTransition(async () => {
            const formData = new FormData()
            formData.append("membershipId", membershipId)
            formData.append("newRole", newRole)
            formData.append("orgId", orgId)

            const result = await updateMemberRole(null, formData)
            if (result.success) {
                setMessage("✓")
                setTimeout(() => setMessage(null), 2000)
            } else {
                setMessage(result.message)
                setTimeout(() => setMessage(null), 3000)
            }
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentRole}
                onValueChange={handleRoleChange}
                disabled={isPending || currentRole === "OWNER"}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
            </Select>
            {message && (
                <span className={`text-xs ${message === "✓" ? "text-green-500" : "text-red-500"}`}>
                    {message}
                </span>
            )}
        </div>
    )
}
