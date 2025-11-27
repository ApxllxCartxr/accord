import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CreateOrgForm } from "./create-org-form"

export default async function OnboardingPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect("/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: true },
    })

    if (user?.memberships && user.memberships.length > 0) {
        redirect("/dashboard")
    }

    // Check for pending invites
    const pendingInvite = await prisma.organizationInvite.findFirst({
        where: {
            email: session.user.email,
            expires: { gt: new Date() }
        }
    })

    if (pendingInvite) {
        redirect(`/invite/${pendingInvite.token}`)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-6 p-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Welcome to Accord</h1>
                    <p className="text-muted-foreground">Create your organization to get started.</p>
                </div>
                <CreateOrgForm />
            </div>
        </div>
    )
}
