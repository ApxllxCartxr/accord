"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, MessageSquare, StickyNote, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { addHistoryNote } from "../actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_COLORS: Record<string, string> = {
    LEAD: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-800/50",
    CONTACTED: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/50",
    QUALIFIED: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/50",
    PROPOSAL_MADE: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400 border-pink-100 dark:border-pink-800/50",
    WON: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100 dark:border-purple-800/50",
    LOST: "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-gray-100 dark:border-gray-700/50",
    FRIDGE: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100 dark:border-orange-800/50",
}

function getStatusColor(status: string) {
    return STATUS_COLORS[status] || "bg-muted text-muted-foreground"
}

import { ClientWithDetails } from "@/types"

export function ClientTimeline({ history }: { history: NonNullable<ClientWithDetails['history']> }) {
    return (
        <Card className="flex-1 min-h-0 flex flex-col h-full">
            <Tabs defaultValue="activity" className="flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                        <TabsList className="h-7">
                            <TabsTrigger value="activity" className="text-xs h-5 px-2">Activity</TabsTrigger>
                            <TabsTrigger value="projects" className="text-xs h-5 px-2">Projects</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                    <TabsContent value="activity" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col p-4 gap-4">
                                {history.map((event) => (
                                    <TimelineEvent key={event.id} event={event} />
                                ))}
                                {history.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs italic gap-2">
                                        <StickyNote className="h-8 w-8 opacity-20" />
                                        No activity recorded yet.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="projects" className="h-full m-0">
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2 p-8">
                            <FolderKanban className="h-8 w-8 opacity-20" />
                            <p>Projects module coming soon</p>
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    )
}

function TimelineEvent({ event }: { event: NonNullable<ClientWithDetails['history']>[number] }) {
    const [note, setNote] = useState(event.notes || "")
    const [isOpen, setIsOpen] = useState(false)

    async function handleSaveNote() {
        try {
            await addHistoryNote(event.id, note)
            setIsOpen(false)
            toast.success("Note added to history")
        } catch (error) {
            toast.error("Failed to add note")
        }
    }

    return (
        <div className="flex gap-4 relative pb-6 last:pb-0 group">
            {/* Vertical Line */}
            <div className="absolute left-4 top-10 bottom-0 w-px bg-border last:hidden" />

            <Avatar className="h-8 w-8 shrink-0 z-10 ring-4 ring-background">
                <AvatarImage src={event.user.image || undefined} />
                <AvatarFallback className="text-xs">{event.user.name?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 min-w-0 pt-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{event.user.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-3" align="end">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none text-xs">Note</h4>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="h-20 text-xs resize-none"
                                    placeholder="Add context to this change..."
                                />
                                <Button size="sm" onClick={handleSaveNote} className="w-full h-7 text-xs">
                                    Save
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.fromStatus)}`}>
                        {event.fromStatus.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={`capitalize px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.toStatus)}`}>
                        {event.toStatus.replace(/_/g, " ").toLowerCase()}
                    </span>
                </div>

                {event.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50 mt-2">
                        {event.notes}
                    </div>
                )}
            </div>
        </div>
    )
}
