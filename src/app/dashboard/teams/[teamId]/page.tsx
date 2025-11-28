import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getTeamDetails } from "../actions"
import { TeamKanban } from "./team-kanban"
import { NewTaskDialog } from "./new-task-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamTasksTable } from "./team-tasks-table"

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const { teamId } = await params
    const team = await getTeamDetails(teamId)

    if (!team) {
        notFound()
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <Tabs defaultValue="board" className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-2">
                                {team.members.map((member) => (
                                    <Avatar key={member.user.id} className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={member.user.image || undefined} />
                                        <AvatarFallback>{member.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">
                                {team.members.length} members
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TabsList>
                            <TabsTrigger value="board">Board</TabsTrigger>
                            <TabsTrigger value="table">Table</TabsTrigger>
                        </TabsList>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                        <NewTaskDialog
                            teamId={team.id}
                            organizationId={team.organizationId}
                            members={team.members.map(m => m.user)}
                        />
                    </div>
                </div>

                <TabsContent value="board" className="flex-1 min-h-0 mt-0">
                    <TeamKanban initialTasks={team.tasks} teamId={team.id} />
                </TabsContent>
                <TabsContent value="table" className="flex-1 min-h-0 mt-0 overflow-auto">
                    <TeamTasksTable tasks={team.tasks} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
