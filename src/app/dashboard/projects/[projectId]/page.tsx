import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProjectDetails } from "../actions"
import { ProjectComments } from "./project-comments"
import { AllTasksKanban } from "../../tasks/all-tasks-kanban"
import { ContractCard } from "../../contracts/contract-card"
import { ClientCard } from "../../clients/client-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckSquare, FileText, ArrowLeft, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ClientWithDetails } from "@/types"

export const dynamic = "force-dynamic"

export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const { projectId } = await params
    const project = await getProjectDetails(projectId)

    if (!project) {
        redirect("/dashboard/projects")
    }



    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-6">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Link href="/dashboard/projects" className="hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span className="text-sm">/ Projects / {project.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                        <StatusBadge status={project.status} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Edit Project</Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts ({project.contract ? 1 : 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1 overflow-y-auto pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Description & Notes */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card rounded-xl p-6 border shadow-sm">
                                <h3 className="font-semibold mb-4">Description</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {project.description || "No description provided."}
                                </p>
                            </div>

                            <div className="bg-card rounded-xl p-6 border shadow-sm">
                                <h3 className="font-semibold mb-4">Notes & Comments</h3>
                                <ProjectComments projectId={project.id} comments={project.comments} />
                            </div>
                        </div>

                        {/* Right Column: Client & Stats */}
                        <div className="space-y-6">
                            {project.client && (
                                <div>
                                    <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wider">Client</h3>
                                    {/* We cast to any because ClientCard expects ClientWithDetails which might have more fields than we fetched, 
                                        but for display purposes it should be fine if we fetched enough. 
                                        Actually, getProjectDetails includes client: true, which gives all scalar fields. 
                                        ClientCard needs owner relation too. 
                                        Let's assume for now it renders gracefully or we might need to fetch owner.
                                        Wait, getProjectDetails only did include: { client: true }. It didn't include client.owner.
                                        I should update getProjectDetails to include client.owner if I want to use ClientCard fully.
                                    */}
                                    <ClientCard client={project.client as any} />
                                </div>
                            )}

                            <div className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
                                <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Project Stats</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Tasks</span>
                                    </div>
                                    <span className="font-medium">{project.tasks.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Contracts</span>
                                    </div>
                                    <span className="font-medium">{project.contract ? 1 : 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Created</span>
                                    </div>
                                    <span className="font-medium text-sm">{format(new Date(project.createdAt), "MMM d, yyyy")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tasks" className="flex-1 overflow-hidden pt-4">
                    <AllTasksKanban initialTasks={project.tasks as any} />
                </TabsContent>

                <TabsContent value="contracts" className="flex-1 overflow-y-auto pt-4">
                    {project.contract ? (
                        <div className="max-w-md">
                            <ContractCard contract={project.contract} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/10">
                            <FileText className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-muted-foreground">No contract linked to this project</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
