"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Send, Loader2 } from "lucide-react"
import { addProjectComment } from "../actions"
import { toast } from "sonner"

interface Comment {
    id: string
    content: string
    createdAt: Date
    user: {
        name: string | null
        image: string | null
    }
}

interface ProjectCommentsProps {
    projectId: string
    comments: Comment[]
}

export function ProjectComments({ projectId, comments: initialComments }: ProjectCommentsProps) {
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!newComment.trim()) return

        setLoading(true)
        try {
            const comment = await addProjectComment(projectId, newComment)
            // Optimistic update or wait for revalidation? 
            // Since we revalidatePath in action, the page will refresh.
            // But for better UX, we can append it locally if the action returns the full object.
            // The action returns the comment but without the user relation expanded.
            // So we rely on revalidation for now, or we can mock the user part.

            // Let's just clear the input and let Next.js handle the refresh via revalidatePath
            setNewComment("")
            toast.success("Note added")
        } catch (error) {
            toast.error("Failed to add note")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <Textarea
                    placeholder="Add a note or comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !newComment.trim()}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Add Note
                </Button>
            </div>

            <div className="space-y-6 mt-8">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No notes yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={comment.user.image || undefined} />
                                <AvatarFallback>{comment.user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{comment.user.name}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
