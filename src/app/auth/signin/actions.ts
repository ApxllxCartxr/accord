"use server"

import { signIn } from "@/auth"
import { redirect } from "next/navigation"

interface SignInData {
    email: string
    password: string
}

export async function signInAction(data: SignInData) {
    try {
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        if (result?.error) {
            return { success: false, error: "Invalid email or password" }
        }

        return { success: true }
    } catch (error) {
        console.error("Sign in error:", error)
        return { success: false, error: "Failed to sign in" }
    }
}

export async function sendMagicLinkAction(email: string) {
    try {
        await signIn("email", {
            email,
            redirect: false,
        })

        return { success: true }
    } catch (error) {
        console.error("Magic link error:", error)
        return { success: false, error: "Failed to send magic link" }
    }
}
