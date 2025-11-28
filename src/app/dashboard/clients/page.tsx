import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getClients } from "./actions"
import { ClientKanban } from "./client-kanban"
import { ClientTable } from "./client-table"
import { NewClientDialog } from "./new-client-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { ClientExportButton } from "./client-export-button"
import { ClientCard } from "./client-card"

export default async function ClientsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { memberships: true }
    })

    if (!user?.memberships || user.memberships.length === 0) {
        redirect("/onboarding")
    }

    const orgId = user.memberships[0].organizationId
    const clients = await getClients(orgId)

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your leads and customer relationships
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ClientExportButton data={clients} />
                    <NewClientDialog organizationId={orgId} currentUserId={user.id} />
                </div>
            </div>

            <Tabs defaultValue="kanban" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="kanban" className="flex h-full items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Grid
                        </TabsTrigger>
                        <TabsTrigger value="table" className="flex items-center gap-2">
                            <TableIcon className="h-4 w-4" />
                            Table
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="kanban" className="flex-1 mt-0">
                    <ClientKanban initialClients={clients} />
                </TabsContent>
                <TabsContent value="grid" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {clients.map((client) => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="table" className="mt-0">
                    <ClientTable data={clients} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
