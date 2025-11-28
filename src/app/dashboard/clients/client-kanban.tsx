"use client"

import { useState, useEffect } from "react"
import { Client } from "@prisma/client"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core"
import { updateClientStatus } from "./actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import { ClientWithDetails, ClientStatus } from "@/types"

interface ClientKanbanProps {
    initialClients: ClientWithDetails[]
}

const COLUMNS: { id: ClientStatus; title: string; color: string }[] = [
    { id: "LEAD", title: "Lead", color: "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50" },
    { id: "CONTACTED", title: "Contacted", color: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/50" },
    { id: "QUALIFIED", title: "Qualified", color: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50" },
    { id: "PROPOSAL_MADE", title: "Proposal made", color: "bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-800/50" },
    { id: "WON", title: "Won", color: "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/50" },
    { id: "LOST", title: "Lost", color: "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50" },
    { id: "FRIDGE", title: "Fridge", color: "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/50" },
]

export function ClientKanban({ initialClients }: ClientKanbanProps) {
    const [clients, setClients] = useState(initialClients)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const clientId = active.id as string
            const newStatus = over.id as ClientStatus

            // Optimistic update
            setClients((prev) =>
                prev.map((client) =>
                    client.id === clientId ? { ...client, status: newStatus } : client
                )
            )

            try {
                await updateClientStatus(clientId, newStatus)
            } catch (error) {
                console.error("Failed to update status", error)
                // Revert on error
                setClients(initialClients)
            }
        }
        setActiveId(null)
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    const activeClient = clients.find(c => c.id === activeId)

    if (!mounted) return null

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="grid grid-cols-7 h-[calc(100vh-200px)] w-full border-t border-border-subtle">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        clients={clients.filter((c) => c.status === column.id)}
                        color={column.color}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeClient ? <ClientCard client={activeClient} /> : null}
            </DragOverlay>
        </DndContext>
    )
}

function KanbanColumn({ id, title, clients, color }: { id: ClientStatus; title: string; clients: ClientWithDetails[], color: string }) {
    const { setNodeRef } = useDroppable({ id })
    const totalValue = clients.reduce((sum, client) => sum + client.value, 0)

    return (
        <div ref={setNodeRef} className="flex flex-col min-w-0 border-r border-border-subtle last:border-r-0 h-full">
            <div className="p-3 text-center border-b border-border-subtle border-dashed bg-muted/20 shrink-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">₹{totalValue.toLocaleString()}</p>
            </div>
            <div className="flex-1 space-y-2 p-2 overflow-y-auto scrollbar-hide">
                {clients.map((client) => (
                    <DraggableClientCard key={client.id} client={client} color={color} />
                ))}
            </div>
        </div>
    )
}

function DraggableClientCard({ client, color }: { client: ClientWithDetails, color: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: client.id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <ClientCard client={client} color={color} />
        </div>
    )
}

function ClientCard({ client, color }: { client: ClientWithDetails, color?: string }) {
    return (
        <Link href={`/dashboard/clients/${client.id}`} className="block h-full">
            <div className={`p-4 rounded-xl shadow-sm border ${color || "bg-card border-border-subtle"} cursor-grab active:cursor-grabbing hover:shadow-md transition-all flex flex-col h-full`}>
                {/* Creator Name */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                        {client.owner?.image ? (
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={client.owner.image} />
                                <AvatarFallback className="text-[8px]">{client.owner.name?.[0]}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary">
                                {client.owner?.name?.[0] || "?"}
                            </div>
                        )}
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">{client.owner?.name}</span>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground shrink-0" onClick={(e) => {
                        e.preventDefault()
                        // Add menu logic here later
                    }}>
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>

                {/* Company Name & Logo */}
                <div className="flex items-center gap-2 mb-1">
                    {client.image && (
                        <img src={client.image} alt="Logo" className="h-6 w-6 rounded object-contain" />
                    )}
                    <h4 className="font-bold text-base text-foreground truncate">{client.name}</h4>
                </div>

                {/* Tagline */}
                {client.tagline && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{client.tagline}</p>
                )}

                {/* Value */}
                <div className="font-mono text-sm font-semibold text-foreground mb-3 mt-auto">
                    ₹ {client.value.toLocaleString()}
                </div>

                {/* Footer: Date */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 text-xs text-muted-foreground font-medium">
                    {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
        </Link>
    )
}
