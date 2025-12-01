import { getContracts } from "./actions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, DollarSign, Mail, MoreVertical, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { NewContractDialog } from "./new-contract-dialog"
import { getClients } from "../clients/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ContractCard } from "./contract-card"

export default async function ContractsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/sign-in")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: true
        }
    })

    if (!user) redirect("/auth/signin")

    const membership = user.memberships[0]

    if (!membership) redirect("/onboarding")

    const contracts = await getContracts(membership.organizationId)
    const clients = await getClients(membership.organizationId)

    return (
        <div className="flex flex-col h-full gap-6 p-6 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contracts</h1>
                    <p className="text-muted-foreground">Manage your client contracts and agreements.</p>
                </div>
                <NewContractDialog clients={clients} organizationId={membership.organizationId} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-6">
                {contracts.map((contract) => (
                    <ContractCard key={contract.id} contract={contract} />
                ))}
                {contracts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                        <FileText className="h-10 w-10 mb-3 opacity-20" />
                        <p>No contracts found</p>
                        <p className="text-sm">Create your first contract to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}
