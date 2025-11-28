import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getTeams } from "./actions"
import { NewTeamDialog } from "./new-team-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Users, CheckSquare } from "lucide-react"

export default async function TeamsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: true }
    })

    if (!user?.memberships || user.memberships.length === 0) {
        redirect("/onboarding")
    }

    const orgId = user.memberships[0].organizationId
    const teams = await getTeams(orgId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your teams and their tasks
                    </p>
                </div>
                <NewTeamDialog organizationId={orgId} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex -space-x-2">
                                        {team.members.map((member) => (
                                            <Avatar key={member.user.id} className="h-8 w-8 border-2 border-background">
                                                <AvatarImage src={member.user.image || undefined} />
                                                <AvatarFallback>{member.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {team._count.members > 5 && (
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                                                +{team._count.members - 5}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <CheckSquare className="h-4 w-4" />
                                        <span>{team._count.tasks} Tasks</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
