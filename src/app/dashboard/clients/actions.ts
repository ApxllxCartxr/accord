"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getClients(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.client.findMany({
        where: { organizationId: orgId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function createClient(data: {
    name: string
    tagline?: string
    value: number
    status: ClientStatus
    ownerId?: string
    organizationId: string
    website?: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Verify user belongs to organization
    const membership = await prisma.organizationUser.findFirst({
        where: {
            userId: session.user.id,
            organizationId: data.organizationId
        }
    })

    if (!membership) throw new Error("Unauthorized")

    let image = undefined
    if (data.website) {
        try {
            const domain = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`).hostname
            image = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        } catch (e) {
            // Invalid URL, ignore
        }
    }

    let ownerId = data.ownerId
    if (!ownerId) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })
        if (user) {
            ownerId = user.id
        }
    }

    const client = await prisma.client.create({
        data: {
            name: data.name,
            tagline: data.tagline,
            value: data.value,
            status: data.status,
            organizationId: data.organizationId,
            ownerId: ownerId,
            website: data.website,
            image: image
        }
    })

    revalidatePath("/dashboard/clients")
    return client
}

export async function updateClientStatus(clientId: string, status: ClientStatus) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const currentClient = await prisma.client.findUnique({
        where: { id: clientId },
        select: { status: true }
    })

    if (!currentClient) throw new Error("Client not found")

    if (currentClient.status !== status) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) throw new Error("User not found")

        await prisma.$transaction([
            prisma.client.update({
                where: { id: clientId },
                data: { status }
            }),
            prisma.clientHistory.create({
                data: {
                    clientId,
                    userId: user.id,
                    fromStatus: currentClient.status,
                    toStatus: status,
                }
            })
        ])
    }

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${clientId}`)
}

export async function addClientComment(clientId: string, content: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) throw new Error("User not found")

    await prisma.clientComment.create({
        data: {
            clientId,
            content,
            userId: user.id
        }
    })

    revalidatePath(`/dashboard/clients/${clientId}`)
}

export async function addHistoryNote(historyId: string, note: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    await prisma.clientHistory.update({
        where: { id: historyId },
        data: { notes: note }
    })

    // We need to know the client ID to revalidate
    const history = await prisma.clientHistory.findUnique({
        where: { id: historyId },
        select: { clientId: true }
    })

    if (history) {
        revalidatePath(`/dashboard/clients/${history.clientId}`)
    }
}

export async function updateClientDetails(clientId: string, data: {
    location?: string
    website?: string
    tagline?: string
    value?: number
    notes?: string
    email?: string
    phone?: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    let image = undefined
    if (data.website) {
        try {
            const domain = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`).hostname
            image = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        } catch (e) {
            // Invalid URL, ignore
        }
    }

    await prisma.client.update({
        where: { id: clientId },
        data: {
            ...data,
            ...(image && { image })
        }
    })

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${clientId}`)
}

export async function getClientDetails(clientId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.client.findUnique({
        where: { id: clientId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            history: {
                include: {
                    user: {
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

export async function deleteClient(clientId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    await prisma.client.delete({
        where: { id: clientId }
    })

    revalidatePath("/dashboard/clients")
}

export async function getOrgMembers(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.organizationUser.findMany({
        where: { organizationId: orgId },
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
    })
}

export async function recalculateClientValue(clientId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const contracts = await prisma.contract.findMany({
        where: { clientId },
        select: { value: true }
    })

    const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0)

    await prisma.client.update({
        where: { id: clientId },
        data: { value: totalValue }
    })

    revalidatePath("/dashboard/clients")
    revalidatePath(`/dashboard/clients/${clientId}`)
}
