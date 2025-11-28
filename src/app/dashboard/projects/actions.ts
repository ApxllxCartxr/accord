"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getProjects(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.project.findMany({
        where: { organizationId: orgId },
        include: {
            client: {
                select: {
                    name: true,
                    image: true
                }
            },
            contract: {
                select: {
                    name: true
                }
            },
            _count: {
                select: {
                    tasks: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function createProject(data: {
    name: string
    description?: string
    status: ProjectStatus
    clientId?: string
    contractId?: string
    organizationId: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const project = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            status: data.status,
            clientId: data.clientId,
            contractId: data.contractId,
            organizationId: data.organizationId
        }
    })

    revalidatePath("/dashboard/projects")
    return project
}

export async function getProjectDetails(projectId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")
    // Fetch project details with all relations
    return await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            client: {
                include: {
                    owner: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            contract: {
                include: {
                    client: {
                        select: {
                            name: true,
                            image: true
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
                    },
                    team: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            comments: {
                include: {
                    user: {
                        select: {
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

export async function updateProject(projectId: string, data: {
    name?: string
    description?: string
    status?: ProjectStatus
    clientId?: string
    contractId?: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const project = await prisma.project.update({
        where: { id: projectId },
        data
    })

    revalidatePath("/dashboard/projects")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return project
}

export async function deleteProject(projectId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    await prisma.project.delete({
        where: { id: projectId }
    })

    revalidatePath("/dashboard/projects")
}

export async function addProjectComment(projectId: string, content: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const comment = await prisma.projectComment.create({
        data: {
            content,
            projectId,
            userId: session.user.id!
        }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return comment
}
