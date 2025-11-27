import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InviteMemberDialog } from "./invite-member-dialog"
import { RoleSelector } from "./role-selector"

export default async function MembersPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: {
                include: {
                    organization: {
                        include: {
                            members: {
                                include: {
                                    user: true
                                }
                            },
                            invites: true
                        }
                    }
                }
            }
        }
    })

    const org = user?.memberships[0]?.organization
    if (!org) redirect("/onboarding")

    const currentUserRole = user.memberships[0].role
    const canInvite = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                {canInvite && <InviteMemberDialog orgId={org.id} />}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                    <CardDescription>
                        People currently in your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {org.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between space-x-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""} />
                                        <AvatarFallback>
                                            {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {member.user.name || "Unknown"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RoleSelector
                                        membershipId={member.id}
                                        currentRole={member.role}
                                        orgId={org.id}
                                        canEdit={canInvite && member.role !== "OWNER"}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {canInvite && org.invites.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invites</CardTitle>
                        <CardDescription>
                            People invited to join your organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {org.invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center justify-between space-x-4"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {invite.email[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">
                                                {invite.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Expires {invite.expires.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        {invite.role.replace("_", " ")}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
