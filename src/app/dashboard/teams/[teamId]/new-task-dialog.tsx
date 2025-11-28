"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, ChevronsUpDown, Check } from "lucide-react"
import { createTask } from "../actions"
import { toast } from "sonner"
import { TaskPriority, TaskStatus } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface NewTaskDialogProps {
    teamId: string
    organizationId: string
    members: {
        id: string
        name: string | null
        image: string | null
    }[]
}

export function NewTaskDialog({ teamId, organizationId, members }: NewTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM" as TaskPriority,
        dueDate: "",
        assigneeIds: [] as string[]
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            await createTask({
                title: formData.title,
                description: formData.description,
                status: "NOT_STARTED",
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                teamId,
                organizationId,
                assigneeIds: formData.assigneeIds
            })

            toast.success("Task created successfully")
            setOpen(false)
            setFormData({
                title: "",
                description: "",
                priority: "MEDIUM",
                dueDate: "",
                assigneeIds: []
            })
        } catch (error) {
            toast.error("Failed to create task")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to the board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Task Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Update Homepage Design"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add details about the task..."
                                className="h-20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="URGENT">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Assignees</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="justify-between w-full font-normal">
                                        {formData.assigneeIds.length > 0
                                            ? `${formData.assigneeIds.length} selected`
                                            : "Select assignees"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                    <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                                        {members.map((member) => {
                                            const isSelected = formData.assigneeIds.includes(member.id)
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setFormData(prev => {
                                                            const ids = prev.assigneeIds.includes(member.id)
                                                                ? prev.assigneeIds.filter(id => id !== member.id)
                                                                : [...prev.assigneeIds, member.id]
                                                            return { ...prev, assigneeIds: ids }
                                                        })
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "h-4 w-4 border rounded flex items-center justify-center transition-colors",
                                                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                                    )}>
                                                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                    </div>
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={member.image || undefined} />
                                                        <AvatarFallback>{member.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm truncate flex-1">{member.name}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.title.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
