import { getClientDetails } from "../actions"
import { notFound } from "next/navigation"
import { ClientInfo } from "./client-info"
import { ClientTimeline } from "./client-timeline"
import { ActiveContracts } from "./active-contracts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params
    const client = await getClientDetails(clientId)
    if (!client) {
        notFound()
    }

    return (
        <div className="flex flex-col h-full gap-2 p-0 overflow-hidden">
            <div className="flex flex-col gap-2 shrink-0">
                <Link href="/dashboard/clients" className="w-fit">
                    <Button variant="ghost" size="sm" className="pl-0 h-auto py-1 hover:bg-transparent hover:text-primary text-muted-foreground">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back to Clients
                    </Button>
                </Link>

                <div className="flex items-center gap-3">
                    {client.image && (
                        <img src={client.image} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-white p-1 ring-1 ring-border" />
                    )}
                    <div>
                        <h1 className="text-xl font-bold tracking-tight leading-none">{client.name}</h1>
                        <p className="text-xs text-muted-foreground mt-1">{client.tagline || "No tagline"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
                <div className="lg:col-span-2 flex flex-col gap-2 min-h-0 overflow-hidden h-full">
                    <div className="shrink-0">
                        <ClientInfo client={client} />
                    </div>
                    <ActiveContracts clientId={client.id} />
                </div>
                <div className="min-h-0 flex flex-col h-full">
                    <ClientTimeline history={client.history} />
                </div>
            </div>
        </div>
    )
}
