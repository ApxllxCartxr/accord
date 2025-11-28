import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const session = await auth()
    const { token } = await params

    const invite = await prisma.organizationInvite.findUnique({
        where: { token },
        include: { organization: true, inviter: true }
    })

    if (!invite) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F2F1EF] px-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
                    <h2 className="text-2xl font-bold text-red-600 mb-2 font-heading">Invalid Invitation</h2>
                    <p className="text-[#999999] mb-4">
                        This invitation link is invalid or has expired.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (invite.expires < new Date()) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F2F1EF] px-4">
                <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
                    <h2 className="text-2xl font-bold text-red-600 mb-2 font-heading">Invitation Expired</h2>
                    <p className="text-[#999999] mb-4">
                        This invitation link has expired. Please ask for a new one.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // If user is logged in, process the invite
    if (session?.user?.email) {
        // Add user to org
        await prisma.$transaction(async (tx) => {
            // Check if already a member
            const existingMember = await tx.organizationUser.findUnique({
                where: {
                    userId_organizationId: {
                        userId: session.user?.id!,
                        organizationId: invite.organizationId
                    }
                }
            })

            if (!existingMember) {
                await tx.organizationUser.create({
                    data: {
                        userId: session.user?.id!,
                        organizationId: invite.organizationId,
                        role: invite.role
                    }
                })
            }

            // Delete invite
            await tx.organizationInvite.delete({
                where: { id: invite.id }
            })
        })

        redirect("/dashboard")
    }

    // Redirect to sign-up with invite token
    redirect(`/auth/signup?invite=${token}`)
}
