import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserProfileForm } from "./user-profile-form"
import { SetPasswordForm } from "./set-password-form"
import { OrgLogoUpload } from "./org-logo-upload"
import { ThemeToggle } from "./theme-toggle"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: {
                include: {
                    organization: true
                }
            }
        },
    })

    if (!user?.memberships || user.memberships.length === 0) {
        redirect("/onboarding")
    }

    const org = user.memberships[0].organization
    const isOwnerOrAdmin = user.memberships[0].role === "OWNER" || user.memberships[0].role === "ADMIN"

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and organization settings
                </p>
            </div>

            {/* User Profile Section */}
            <div className="bg-card rounded-2xl p-6 border border-border-subtle">
                <h2 className="text-lg font-semibold text-card-foreground mb-2">Profile</h2>
                <p className="text-sm text-muted-foreground mb-6">Update your personal information</p>
                <UserProfileForm userName={user.name} userEmail={user.email} />
            </div>

            {/* Set Password Section - Only for users without password */}
            {!user.password && (
                <div className="bg-card rounded-2xl p-6 border border-border-subtle">
                    <h2 className="text-lg font-semibold text-card-foreground mb-2">Set Password</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Create a password to enable password-based sign-in
                    </p>
                    <SetPasswordForm />
                </div>
            )}

            {/* Organization Logo Section - Only for Owners/Admins */}
            {isOwnerOrAdmin && (
                <div className="bg-card rounded-2xl p-6 border border-border-subtle">
                    <h2 className="text-lg font-semibold text-card-foreground mb-2">Organization Logo</h2>
                    <p className="text-sm text-muted-foreground mb-6">Upload your company logo</p>
                    <OrgLogoUpload orgId={org.id} currentLogo={org.logo} />
                </div>
            )}

            {/* Appearance Section */}
            <div className="bg-card rounded-2xl p-6 border border-border-subtle">
                <h2 className="text-lg font-semibold text-card-foreground mb-2">Appearance</h2>
                <p className="text-sm text-muted-foreground mb-6">Customize the interface theme</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">Theme Preference</span>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    )
}
