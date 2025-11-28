"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ClientWithDetails } from "@/types"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Building2, User } from "lucide-react"

interface ClientCardProps {
    client: ClientWithDetails
}

export function ClientCard({ client }: ClientCardProps) {
    return (
        <Link href={`/dashboard/clients/${client.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={client.image || undefined} alt={client.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base font-semibold line-clamp-1">{client.name}</CardTitle>
                            {client.tagline && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{client.tagline}</p>
                            )}
                        </div>
                    </div>
                    <Badge variant={
                        client.status === 'WON' ? 'default' :
                            client.status === 'LOST' ? 'destructive' :
                                'secondary'
                    }>
                        {client.status.toLowerCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Value</span>
                            <span className="font-semibold">₹{client.value.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{client.owner?.name || "Unassigned"}</span>
                            </div>
                            <span>{formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
