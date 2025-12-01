import type { NextAuthConfig } from "next-auth"
export default {
    session: { strategy: "jwt" },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.startsWith("https://"),
            },
        },
    },
    providers: [],
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        newUser: '/onboarding',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding")
            const isOnAuth = nextUrl.pathname.startsWith("/auth")

            if (isOnDashboard || isOnOnboarding) {
                if (isLoggedIn) return true
                return false // Redirect to login
            }

            if (isOnAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/dashboard", nextUrl))
                }
                return true
            }
            return true
        },
    },
} satisfies NextAuthConfig
