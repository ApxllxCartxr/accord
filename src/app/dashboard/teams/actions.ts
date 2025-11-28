"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus, TaskPriority } from "@prisma/client"
import { revalidatePath } from "next/cache"

// --- Teams ---

export async function getTeams(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.team.findMany({
        where: { organizationId: orgId },
        include: {
            _count: {
                select: { members: true, tasks: true }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                },
                take: 5 // Preview members
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createTeam(name: string, organizationId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const team = await prisma.team.create({
        data: {
            name,
            organizationId,
            leadId: session.user.id // Creator is lead by default
        }
    })

    // Add creator as member
    await prisma.teamMember.create({
        data: {
            teamId: team.id,
            userId: session.user.id!
        }
    })

    revalidatePath("/dashboard/teams")
    return team
}

export async function getTeamDetails(teamId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true
                        }
                    }
                }
            },
            tasks: {
                include: {
                    assignees: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })
}

// --- Tasks ---

export async function createTask(data: {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    dueDate?: Date
    teamId: string
    organizationId: string
    assigneeIds: string[]
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const task = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate,
            teamId: data.teamId,
            organizationId: data.organizationId,
            assignees: {
                connect: data.assigneeIds.map(id => ({ id }))
            }
        }
    })

    revalidatePath(`/dashboard/teams/${data.teamId}`)
    return task
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const task = await prisma.task.update({
        where: { id: taskId },
        data: { status }
    })

    if (task.teamId) {
        revalidatePath(`/dashboard/teams/${task.teamId}`)
    }
}

export async function updateTask(taskId: string, data: {
    title?: string
    description?: string
    priority?: TaskPriority
    dueDate?: Date
    assigneeIds?: string[]
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            dueDate: data.dueDate,
            assignees: data.assigneeIds ? {
                set: data.assigneeIds.map(id => ({ id }))
            } : undefined
        }
    })

    if (task.teamId) {
        revalidatePath(`/dashboard/teams/${task.teamId}`)
    }
}

export async function deleteTask(taskId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const task = await prisma.task.delete({
        where: { id: taskId }
    })

    if (task.teamId) {
        revalidatePath(`/dashboard/teams/${task.teamId}`)
    }
}

export async function getAllTasks(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.task.findMany({
        where: { organizationId: orgId },
        include: {
            assignees: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            },
            team: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}
