"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { randomBytes } from "crypto"
import nodemailer from "nodemailer"

const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(["ADMIN", "TEAM_LEAD", "MEMBER"]),
    orgId: z.string(),
})

export async function inviteMember(prevState: unknown, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { message: "Not authenticated" }

    const validatedFields = inviteSchema.safeParse({
        email: formData.get("email"),
        role: formData.get("role"),
        orgId: formData.get("orgId"),
    })

    if (!validatedFields.success) {
        return { message: "Invalid input" }
    }

    const { email, role, orgId } = validatedFields.data

    try {
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { memberships: true }
        })

        const membership = currentUser?.memberships.find(m => m.organizationId === orgId)
        if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
            return { message: "Unauthorized" }
        }

        // Check if user is already a member
        const existingMember = await prisma.organizationUser.findFirst({
            where: {
                organizationId: orgId,
                user: { email }
            }
        })

        if (existingMember) {
            return { message: "User is already a member" }
        }

        // Check for existing invite
        const existingInvite = await prisma.organizationInvite.findUnique({
            where: {
                organizationId_email: {
                    organizationId: orgId,
                    email
                }
            }
        })

        if (existingInvite) {
            // Update existing invite
            await prisma.organizationInvite.update({
                where: { id: existingInvite.id },
                data: {
                    role,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    token: randomBytes(32).toString("hex")
                }
            })
        } else {
            // Create new invite
            const token = randomBytes(32).toString("hex")
            await prisma.organizationInvite.create({
                data: {
                    email,
                    role,
                    organizationId: orgId,
                    inviterId: currentUser.id,
                    token,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            })

            // Send email
            // Send email
            const transport = nodemailer.createTransport(process.env.EMAIL_SERVER || {
                host: "localhost",
                port: 1025,
                secure: false,
                auth: null,
            } as any)
            const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${token}`

            await transport.sendMail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `You've been invited to join an organization on Accord CRM`,
                html: `
                    <p>You have been invited to join the organization as a <strong>${role.replace("_", " ")}</strong>.</p>
                    <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
                `
            })
        }

        revalidatePath("/dashboard/settings/members")
        return { message: "Invitation sent successfully", success: true }

    } catch (error) {
        console.error(error)
        return { message: "Failed to send invitation" }
    }
}

const updateRoleSchema = z.object({
    membershipId: z.string(),
    newRole: z.enum(["ADMIN", "TEAM_LEAD", "MEMBER"]),
    orgId: z.string(),
})

export async function updateMemberRole(prevState: unknown, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) return { message: "Not authenticated" }

    const validatedFields = updateRoleSchema.safeParse({
        membershipId: formData.get("membershipId"),
        newRole: formData.get("newRole"),
        orgId: formData.get("orgId"),
    })

    if (!validatedFields.success) {
        return { message: "Invalid input" }
    }

    const { membershipId, newRole, orgId } = validatedFields.data

    try {
        await prisma.$transaction(async (tx) => {
            // Get current user's membership
            const currentUser = await tx.user.findUnique({
                where: { email: session.user.email },
                include: { memberships: true }
            })

            if (!currentUser) {
                throw new Error("User not found")
            }

            const currentUserMembership = currentUser.memberships.find(m => m.organizationId === orgId)

            // Check if current user has permission (must be OWNER or ADMIN)
            if (!currentUserMembership || (currentUserMembership.role !== "OWNER" && currentUserMembership.role !== "ADMIN")) {
                throw new Error("Unauthorized")
            }

            // Get the membership being updated
            const targetMembership = await tx.organizationUser.findUnique({
                where: { id: membershipId },
                include: { user: true }
            })

            if (!targetMembership || targetMembership.organizationId !== orgId) {
                throw new Error("Membership not found")
            }

            // Prevent demoting an OWNER unless the current user is also an OWNER
            if (targetMembership.role === "OWNER" && currentUserMembership.role !== "OWNER") {
                throw new Error("Only owners can change owner roles")
            }

            // Update the role
            await tx.organizationUser.update({
                where: { id: membershipId },
                data: { role: newRole }
            })
        })

        revalidatePath("/dashboard/settings/members")
        return { message: "Role updated successfully", success: true }

    } catch (error) {
        console.error(error)
        if (error instanceof Error) {
            return { message: error.message }
        }
        return { message: "Failed to update role" }
    }
}

