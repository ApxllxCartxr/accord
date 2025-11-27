"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateUserName(name: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: { name }
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/settings")

        return { success: true }
    } catch (error) {
        console.error("Error updating user name:", error)
        return { success: false, error: "Failed to update name" }
    }
}

export async function setUserPassword(password: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword }
        })

        revalidatePath("/dashboard/settings")

        return { success: true }
    } catch (error) {
        console.error("Error setting password:", error)
        return { success: false, error: "Failed to set password" }
    }
}

export async function uploadOrgLogo(orgId: string, logoData: string | null) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        // Verify user is owner or admin of the organization
        const membership = await prisma.organizationUser.findFirst({
            where: {
                user: { email: session.user.email },
                organizationId: orgId,
                role: { in: ["OWNER", "ADMIN"] }
            }
        })

        if (!membership) {
            return { success: false, error: "Not authorized" }
        }

        await prisma.organization.update({
            where: { id: orgId },
            data: { logo: logoData }
        })

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/settings")

        return { success: true }
    } catch (error) {
        console.error("Error uploading logo:", error)
        return { success: false, error: "Failed to upload logo" }
    }
}
