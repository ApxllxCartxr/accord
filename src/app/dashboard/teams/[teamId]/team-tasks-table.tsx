"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Task, TaskPriority, TaskStatus } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type TaskWithAssignees = Task & {
    assignees: {
        id: string
        name: string | null
        image: string | null
    }[]
}

interface TeamTasksTableProps {
    tasks: TaskWithAssignees[]
}

export function TeamTasksTable({ tasks }: TeamTasksTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignees</TableHead>
                        <TableHead>Due Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={task.priority === "URGENT" ? "destructive" : "secondary"}>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex -space-x-2">
                                        {task.assignees.map((assignee) => (
                                            <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                                                <AvatarImage src={assignee.image || undefined} />
                                                <AvatarFallback className="text-[8px]">
                                                    {assignee.name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
