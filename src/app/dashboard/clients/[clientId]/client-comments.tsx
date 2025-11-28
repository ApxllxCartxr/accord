"use client"

import { useState } from "react"
import { addClientComment } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Send } from "lucide-react"
import { toast } from "sonner"

export function ClientComments({ clientId, comments }: { clientId: string, comments: any[] }) {
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        try {
            await addClientComment(clientId, newComment)
            setNewComment("")
            toast.success("Comment added")
        } catch (error) {
            toast.error("Failed to add comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={comment.user.image} />
                                <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.user.name}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm italic py-8">
                            No comments yet. Start the conversation!
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t">
                    <div className="flex gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type your comment..."
                            className="min-h-[80px] resize-none"
                        />
                        <Button type="submit" size="icon" disabled={isSubmitting || !newComment.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
