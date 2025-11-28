import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllTasks } from "../teams/actions"
import { AllTasksKanban } from "./all-tasks-kanban"

import { prisma } from "@/lib/prisma"

export default async function AllTasksPage() {
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

    const tasks = await getAllTasks(orgId)

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
                    <p className="text-muted-foreground">Overview of all tasks across all teams.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <AllTasksKanban initialTasks={tasks} />
            </div>
        </div>
    )
}
