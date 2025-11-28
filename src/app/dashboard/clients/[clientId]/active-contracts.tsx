
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, ExternalLink } from "lucide-react"
import { getClientContracts } from "../../contracts/actions"
import { NewContractDialog } from "../../contracts/new-contract-dialog"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function ActiveContracts({ clientId }: { clientId: string }) {
    const contracts = await getClientContracts(clientId)
    const session = await auth()

    // We need organizationId for the dialog
    const membership = await prisma.organizationUser.findFirst({
        where: { userId: session?.user?.id },
        select: { organizationId: true }
    })

    // Mock client object for the dialog since we already know the client
    // In a real app we might want to pass the full client object or adjust the dialog props
    const clientMock = [{ id: clientId, name: "Current Client" }]

    return (
        <Card className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 shrink-0">
                <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                <NewContractDialog
                    clients={clientMock}
                    organizationId={membership?.organizationId || ""}
                    defaultClientId={clientId}
                />
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0 overflow-y-auto flex-1">
                {contracts.length > 0 ? (
                    <div className="space-y-2">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="flex items-center justify-between p-2 rounded-md border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{contract.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>₹{contract.value.toLocaleString()}</span>
                                            <span>•</span>
                                            <span className={`capitalize ${contract.status === 'SIGNED' ? 'text-green-600' :
                                                contract.status === 'SENT' ? 'text-blue-600' : ''
                                                }`}>{contract.status.toLowerCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 min-h-[100px]">
                        <FileText className="h-8 w-8 opacity-20" />
                        <p>No active contracts</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
