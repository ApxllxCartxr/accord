import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderKanban, TrendingUp, Plus, UserPlus, ListTodo, DollarSign, Briefcase, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: {
                include: {
                    organization: {
                        include: {
                            projects: {
                                where: { status: "ACTIVE" }
                            }
                        }
                    }
                }
            },
            tasks: {
                where: { status: { not: "COMPLETED" } },
                orderBy: { dueDate: "asc" },
                take: 5,
                include: {
                    project: true
                }
            },
            ledTeams: {
                include: {
                    tasks: {
                        where: { status: { not: "COMPLETED" } }
                    }
                }
            },
            ownedClients: {
                where: { status: { notIn: ["LOST", "FRIDGE"] } },
                orderBy: { updatedAt: "desc" },
                take: 5
            }
        }
    })

    if (!user) redirect("/auth/signin")

    const org = user.memberships[0]?.organization
    if (!org) redirect("/onboarding")

    const role = user.memberships[0].role

    // Calculate Stats
    const myPendingTasks = user.tasks.length
    const myClients = user.ownedClients.length

    // Calculate Revenue (Value of WON clients owned by user)
    // We need to fetch all owned clients for total revenue, not just the top 5
    const allOwnedClients = await prisma.client.findMany({
        where: {
            ownerId: user.id,
            status: "WON"
        },
        select: { value: true }
    })
    const myRevenue = allOwnedClients.reduce((sum, client) => sum + client.value, 0)

    // Team/Org Stat
    let fourthStat = {
        title: "Active Projects",
        value: org.projects.length,
        icon: FolderKanban,
        description: "Organization wide",
        color: "text-[#f9710b]",
        bgColor: "bg-[#f9710b]/10",
        borderColor: "border-[#f9710b]/20"
    }

    if (role === "TEAM_LEAD" && user.ledTeams.length > 0) {
        const teamPendingTasks = user.ledTeams.reduce((sum, team) => sum + team.tasks.length, 0)
        fourthStat = {
            title: "Team Tasks",
            value: teamPendingTasks,
            icon: Users,
            description: "Pending across your teams",
            color: "text-[#f9710b]",
            bgColor: "bg-[#f9710b]/10",
            borderColor: "border-[#f9710b]/20"
        }
    }

    const stats = [
        {
            title: "My Pending Tasks",
            value: myPendingTasks,
            icon: ListTodo,
            description: "Tasks assigned to you",
            color: "text-[#4ea2ff]",
            bgColor: "bg-[#4ea2ff]/10",
            borderColor: "border-[#4ea2ff]/20"
        },
        {
            title: "My Active Clients",
            value: myClients,
            icon: Briefcase,
            description: "Clients you manage",
            color: "text-[#7c6afc]",
            bgColor: "bg-[#7c6afc]/10",
            borderColor: "border-[#7c6afc]/20"
        },
        {
            title: "My Revenue",
            value: `₹${myRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: "From won deals",
            color: "text-[#55db9c]",
            bgColor: "bg-[#55db9c]/10",
            borderColor: "border-[#55db9c]/20"
        },
        fourthStat
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                        Welcome back, {user.name?.split(" ")[0] || "there"}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's an overview of your work today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/projects">View Projects</Link>
                    </Button>
                    <Button variant="create" asChild>
                        <Link href="/dashboard/tasks">
                            <Plus className="mr-2 h-4 w-4" />
                            New Task
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.title} className={`rounded-xl p-5 border ${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md shadow-[0px_1px_0px_0px_rgba(255,255,255,0.5)_inset,0px_4px_8px_0px_rgba(0,0,0,0.05)] dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.05)_inset,0px_4px_8px_0px_rgba(0,0,0,0.4)]`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold mb-1 font-number ${stat.color}`}>{stat.value}</div>
                        <p className="text-sm text-muted-foreground/80 font-medium">
                            {stat.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* My Tasks - Left Column (4/7) */}
                <Card className="md:col-span-4 border-border-subtle">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/tasks">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {user.tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
                                <p>You're all caught up!</p>
                                <p className="text-sm">No pending tasks assigned to you.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.tasks.map((task) => (
                                    <div key={task.id} className="flex items-start justify-between p-3 rounded-lg border border-border-subtle hover:bg-muted/30 transition-colors group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${task.priority === 'URGENT' ? 'bg-red-500' :
                                                    task.priority === 'HIGH' ? 'bg-orange-500' :
                                                        task.priority === 'MEDIUM' ? 'bg-yellow-500' :
                                                            'bg-blue-500'
                                                    }`} />
                                                <span className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {task.project && (
                                                    <span className="flex items-center gap-1">
                                                        <FolderKanban className="h-3 w-3" />
                                                        {task.project.name}
                                                    </span>
                                                )}
                                                {task.dueDate && (
                                                    <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : ""}`}>
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <StatusBadge status={task.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Clients - Right Column (3/7) */}
                <Card className="md:col-span-3 border-border-subtle">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">My Clients</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/dashboard/clients">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {user.ownedClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <UserPlus className="h-10 w-10 mb-3 opacity-20" />
                                <p>No clients yet.</p>
                                <Button variant="link" size="sm" asChild className="mt-2">
                                    <Link href="/dashboard/clients">Add your first client</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.ownedClients.map((client) => (
                                    <div key={client.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{client.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Updated {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-sm font-medium">₹{client.value.toLocaleString()}</p>
                                            <StatusBadge status={client.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link
                    href="/dashboard/projects"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-card hover:bg-accent/50 hover:shadow-md transition-all group shadow-[0px_1px_0px_0px_rgba(255,255,255,0.5)_inset,0px_4px_8px_0px_rgba(0,0,0,0.05)] dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.05)_inset,0px_4px_8px_0px_rgba(0,0,0,0.4)]"
                >
                    <div className="p-3 bg-[#4ea2ff]/10 text-[#4ea2ff] rounded-lg group-hover:scale-110 transition-transform">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-semibold text-foreground block">Create Project</span>
                        <span className="text-xs text-muted-foreground">Start a new initiative</span>
                    </div>
                </Link>
                <Link
                    href="/dashboard/tools/organization"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-card hover:bg-accent/50 hover:shadow-md transition-all group shadow-[0px_1px_0px_0px_rgba(255,255,255,0.5)_inset,0px_4px_8px_0px_rgba(0,0,0,0.05)] dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.05)_inset,0px_4px_8px_0px_rgba(0,0,0,0.4)]"
                >
                    <div className="p-3 bg-[#7c6afc]/10 text-[#7c6afc] rounded-lg group-hover:scale-110 transition-transform">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-semibold text-foreground block">Invite Member</span>
                        <span className="text-xs text-muted-foreground">Grow your team</span>
                    </div>
                </Link>
                <Link
                    href="/dashboard/tasks"
                    className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-card hover:bg-accent/50 hover:shadow-md transition-all group shadow-[0px_1px_0px_0px_rgba(255,255,255,0.5)_inset,0px_4px_8px_0px_rgba(0,0,0,0.05)] dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.05)_inset,0px_4px_8px_0px_rgba(0,0,0,0.4)]"
                >
                    <div className="p-3 bg-[#55db9c]/10 text-[#55db9c] rounded-lg group-hover:scale-110 transition-transform">
                        <Plus className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="font-semibold text-foreground block">Create Task</span>
                        <span className="text-xs text-muted-foreground">Add a new task</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
