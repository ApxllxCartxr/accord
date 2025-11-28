"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function resolveBreadcrumbLabel(segment: string) {
    const session = await auth()
    if (!session?.user?.email) return segment

    // Check if segment looks like a CUID or UUID
    if (segment.length > 20) {
        // Try to find a client with this ID
        const client = await prisma.client.findUnique({
            where: { id: segment },
            select: { name: true }
        })
        if (client) return client.name
    }

    return segment
}
