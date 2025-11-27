"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { z } from "zod"

const createOrgSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
})

export async function createOrganization(prevState: unknown, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        return { message: "Not authenticated" }
    }

    const validatedFields = createOrgSchema.safeParse({
        name: formData.get("name"),
        slug: formData.get("slug"),
    })

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors }
    }

    const { name, slug } = validatedFields.data

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) throw new Error("User not found")

        await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name,
                    slug,
                },
            })

            await tx.organizationUser.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: "OWNER",
                },
            })
        })

    } catch (error) {
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
            return { message: "Organization slug already exists" }
        }
        return { message: "Failed to create organization" }
    }

    redirect("/dashboard")
}
