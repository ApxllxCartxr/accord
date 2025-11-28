import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProjects } from "./actions"
import { NewProjectDialog } from "./new-project-dialog"
import { ProjectCard } from "./project-card"
import { FolderKanban } from "lucide-react"

import { prisma } from "@/lib/prisma"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            memberships: {
                select: {
                    organizationId: true
                }
            }
        }
    })

    const orgId = user?.memberships[0]?.organizationId
    if (!orgId) redirect("/onboarding")

    const projects = await getProjects(orgId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your projects and track progress.
                    </p>
                </div>
                <NewProjectDialog organizationId={orgId} />
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No projects found</h3>
                    <p className="text-muted-foreground mb-4 text-center max-w-sm">
                        Get started by creating your first project to track tasks and contracts.
                    </p>
                    <NewProjectDialog organizationId={orgId} />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    )
}
