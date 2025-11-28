import { Sidebar } from "@/components/sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: { include: { organization: true } } },
    })

    if (!user?.memberships || user.memberships.length === 0) {
        redirect("/onboarding")
    }

    const org = user.memberships[0].organization

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar orgName={org.name} orgPlan="Free Plan" orgLogo={org.logo} />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar with breadcrumbs - same height as OrgSwitcher */}
                <div className="h-[65px] bg-background flex items-center px-6 border-b border-border">
                    <Breadcrumbs />
                </div>

                {/* Main content area with gap */}
                <div className="flex-1 overflow-hidden p-2">
                    <div className="h-full bg-[var(--content-background)] rounded-lg border border-border p-4 overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
