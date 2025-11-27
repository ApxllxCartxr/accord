import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
    const isOnOnboarding = req.nextUrl.pathname.startsWith("/onboarding")
    const isOnAuth = req.nextUrl.pathname.startsWith("/auth")

    if (isOnDashboard || isOnOnboarding) {
        if (isLoggedIn) return
        return Response.redirect(new URL("/auth/signin", req.nextUrl))
    }

    if (isOnAuth) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", req.nextUrl))
        }
        return
    }
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
