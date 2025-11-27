"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

interface SignUpData {
    name: string
    email: string
    password: string
    inviteToken?: string
}

export async function signUpAction(data: SignUpData) {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { success: false, error: "Email already registered" }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            }
        })

        // If there's an invite token, accept the invite
        if (data.inviteToken) {
            const invite = await prisma.organizationInvite.findUnique({
                where: { token: data.inviteToken },
                include: { organization: true }
            })

            if (invite && invite.expires > new Date()) {
                // Add user to organization
                await prisma.organizationUser.create({
                    data: {
                        userId: user.id,
                        organizationId: invite.organizationId,
                        role: invite.role,
                    }
                })

                // Delete the invite
                await prisma.organizationInvite.delete({
                    where: { id: invite.id }
                })

                // Sign in the user
                await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                })

                return { success: true, redirectTo: "/dashboard" }
            }
        }

        // Sign in the user
        await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        // Redirect to onboarding for new users without invite
        return { success: true, redirectTo: "/onboarding" }
    } catch (error) {
        console.error("Sign up error:", error)
        return { success: false, error: "Failed to create account" }
    }
}
