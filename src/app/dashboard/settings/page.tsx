import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UserProfileForm } from "./user-profile-form"
import { SetPasswordForm } from "./set-password-form"
import { OrgLogoUpload } from "./org-logo-upload"

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
                <h1 className="text-3xl font-bold tracking-tight text-black">Settings</h1>
                <p className="text-[#999999] mt-1">
                    Manage your account and organization settings
                </p>
            </div>

            {/* User Profile Section */}
            <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5]">
                <h2 className="text-lg font-semibold text-black mb-2">Profile</h2>
                <p className="text-sm text-[#999999] mb-6">Update your personal information</p>
                <UserProfileForm userName={user.name} userEmail={user.email} />
            </div>

            {/* Set Password Section - Only for users without password */}
            {!user.password && (
                <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5]">
                    <h2 className="text-lg font-semibold text-black mb-2">Set Password</h2>
                    <p className="text-sm text-[#999999] mb-6">
                        Create a password to enable password-based sign-in
                    </p>
                    <SetPasswordForm />
                </div>
            )}

            {/* Organization Logo Section - Only for Owners/Admins */}
            {isOwnerOrAdmin && (
                <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5]">
                    <h2 className="text-lg font-semibold text-black mb-2">Organization Logo</h2>
                    <p className="text-sm text-[#999999] mb-6">Upload your company logo</p>
                    <OrgLogoUpload orgId={org.id} currentLogo={org.logo} />
                </div>
            )}
        </div>
    )
}
