import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Calendar, Mail, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteContract, sendContractEmail } from "./actions"

export function ContractCard({ contract }: { contract: any }) {
    const statusColors = {
        DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        SIGNED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    }

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold line-clamp-1" title={contract.name}>
                            {contract.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={contract.client.image} />
                                <AvatarFallback className="text-[10px]">{contract.client.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[150px]">{contract.client.name}</span>
                        </div>
                    </div>
                    <Badge variant="secondary" className={`${statusColors[contract.status as keyof typeof statusColors]} border-0`}>
                        {contract.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-mono text-foreground">₹{contract.value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'No date'}</span>
                    </div>
                </div>

                {contract.content && (
                    <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded border border-border/50">
                        {contract.content}
                    </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(contract.updatedAt), { addSuffix: true })}
                    </span>
                    <ContractActions contract={contract} />
                </div>
            </CardContent>
        </Card>
    )
}

function ContractActions({ contract }: { contract: any }) {
    return (
        <div className="flex items-center gap-1">
            <form action={async () => {
                "use server"
                await sendContractEmail(contract.id, "client@example.com")
            }}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Send Email">
                    <Mail className="h-4 w-4" />
                </Button>
            </form>
            <form action={async () => {
                "use server"
                await deleteContract(contract.id)
            }}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
