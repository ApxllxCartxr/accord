"use client"

import { useState, useEffect } from "react"
import { Task, TaskStatus, TaskPriority } from "@prisma/client"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core"
import { updateTaskStatus } from "../actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Paperclip, MoreHorizontal, Crosshair, Target, CheckCircle2, Zap } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Extended Task type to include assignees
type TaskWithAssignees = Task & {
    assignees: {
        id: string
        name: string | null
        image: string | null
    }[]
}

interface TeamKanbanProps {
    initialTasks: TaskWithAssignees[]
    teamId: string
}

const COLUMNS: { id: TaskStatus; title: string; color: string; icon: React.ElementType }[] = [
    { id: "NOT_STARTED", title: "Not Started", color: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300", icon: Crosshair },
    { id: "PENDING", title: "Pending", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300", icon: Target },
    { id: "COMPLETED", title: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
    { id: "UNDER_REVIEW", title: "Under Review", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Zap },
]

export function TeamKanban({ initialTasks, teamId }: TeamKanbanProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const taskId = active.id as string
            const newStatus = over.id as TaskStatus

            // Optimistic update
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            )

            try {
                await updateTaskStatus(taskId, newStatus)
            } catch (error) {
                console.error("Failed to update status", error)
                // Revert on error - simplified for now, ideally fetch fresh data
            }
        }
        setActiveId(null)
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    const activeTask = tasks.find(t => t.id === activeId)

    if (!mounted) return null

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        tasks={tasks.filter((t) => t.status === column.id)}
                        count={tasks.filter((t) => t.status === column.id).length}
                        color={column.color}
                        icon={column.icon}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    )
}

function KanbanColumn({ id, title, tasks, count, color, icon: Icon }: { id: TaskStatus; title: string; tasks: TaskWithAssignees[], count: number, color: string, icon: React.ElementType }) {
    const { setNodeRef } = useDroppable({ id })

    return (
        <div ref={setNodeRef} className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", color)}>
                    <Icon className="h-4 w-4" />
                    <span>{title}</span>
                    <span className="ml-1 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full text-xs">
                        {count}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pb-2">
                {tasks.map((task) => (
                    <DraggableTaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}

function DraggableTaskCard({ task }: { task: TaskWithAssignees }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <TaskCard task={task} />
        </div>
    )
}

function TaskCard({ task }: { task: TaskWithAssignees }) {


    return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {/* Placeholder for link icon/id if we had one */}
                    <span className="text-xs font-medium text-muted-foreground">TASK-{task.id.slice(-4).toUpperCase()}</span>
                    <StatusBadge status={task.priority} className="text-[10px] px-1.5 py-0.5 h-auto" />
                </div>
            </div>

            <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-3 mb-4">
                {task.dueDate && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ring-1 ring-inset",
                        new Date(task.dueDate) < new Date()
                            ? "bg-red-50 text-red-600 ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                            : "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                    )}>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex -space-x-2">
                    {task.assignees.length > 0 ? (
                        task.assignees.map((assignee) => (
                            <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                                <AvatarImage src={assignee.image || undefined} />
                                <AvatarFallback className="text-[8px]">
                                    {assignee.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground">?</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1 text-xs">
                        <MessageSquare className="h-3 w-3" />
                        <span>0</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-[10px]">{format(new Date(task.createdAt), "MMM d, yyyy")}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
