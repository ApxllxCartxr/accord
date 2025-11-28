"use client"

import { Project, ProjectStatus } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FolderKanban, MoreHorizontal, Calendar, CheckSquare, FileText, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type ProjectWithDetails = Project & {
    client: {
        name: string
        image: string | null
    } | null
    contract: {
        name: string
    } | null
    _count: {
        tasks: number
    }
}

interface ProjectCardProps {
    project: ProjectWithDetails
}

export function ProjectCard({ project }: ProjectCardProps) {
    const statusColors = {
        ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        ON_HOLD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        ARCHIVED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    }

    return (
        <Card className="hover:shadow-md transition-all group">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("font-medium", statusColors[project.status])}>
                                {project.status.replace("_", " ")}
                            </Badge>
                            {project.contract && (
                                <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate max-w-[100px]">{project.contract.name}</span>
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            <Link href={`/dashboard/projects/${project.id}`}>
                                {project.name}
                            </Link>
                        </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {project.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="Tasks">
                            <CheckSquare className="h-4 w-4" />
                            <span>{project._count.tasks}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Last Updated">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(project.updatedAt), "MMM d")}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 border-t bg-muted/20 mt-2 flex items-center justify-between">
                {project.client ? (
                    <div className="flex items-center gap-2 pt-3">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={project.client.image || undefined} />
                            <AvatarFallback>{project.client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate max-w-[150px]">{project.client.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 pt-3 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-xs">No Client</span>
                    </div>
                )}
                <Button variant="ghost" size="sm" className="text-xs mt-3" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
