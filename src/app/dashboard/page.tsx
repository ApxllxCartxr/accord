import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FolderKanban, CheckCircle2, TrendingUp, Plus, UserPlus, ListTodo } from "lucide-react"
import Link from "next/link"

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
                            members: {
                                include: {
                                    user: true
                                }
                            },
                            projects: true,
                            tasks: true,
                        }
                    }
                }
            }
        }
    })

    const org = user?.memberships[0]?.organization
    if (!org) redirect("/onboarding")

    // Calculate stats
    const totalMembers = org.members.length
    const activeProjects = org.projects.filter(p => p.status === "ACTIVE").length
    const totalTasks = org.tasks.length
    const completedTasks = org.tasks.filter(t => t.status === "DONE").length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const stats = [
        {
            title: "Total Members",
            value: totalMembers,
            icon: Users,
            description: "Active team members",
            color: "text-[#FF6B4A]"
        },
        {
            title: "Active Projects",
            value: activeProjects,
            icon: FolderKanban,
            description: "Currently in progress",
            color: "text-[#4CAF50]"
        },
        {
            title: "Total Tasks",
            value: totalTasks,
            icon: ListTodo,
            description: `${completedTasks} completed`,
            color: "text-[#9B59B6]"
        },
        {
            title: "Completion Rate",
            value: `${completionRate}%`,
            icon: TrendingUp,
            description: "Overall progress",
            color: "text-[#FF6B4A]"
        },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">
                    Welcome back, {user.name || session.user.name}!
                </h1>
                <p className="text-[#999999] mt-1">
                    Here's what's happening with {org.name} today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-[#F5F5F5] rounded-xl p-5 border border-[#E5E5E5]">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-2.5 bg-black rounded-lg">
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <button className="text-sm text-[#666666] hover:text-black transition-colors flex items-center gap-1">
                                View Details
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-3xl font-bold text-black mb-1 font-number">{stat.value}</div>
                        <p className="text-sm text-[#666666]">
                            {stat.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-semibold text-black mb-2">Quick Actions</h3>
                <p className="text-sm text-[#999999] mb-6">Get started with common tasks</p>

                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/dashboard/projects"
                        className="flex flex-col items-start p-4 rounded-xl border border-[#E5E5E5] hover:bg-white hover:shadow-sm transition-all group bg-[#F5F5F5]"
                    >
                        <div className="p-2 bg-black rounded-lg mb-3 transition-colors">
                            <FolderKanban className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-black mb-1">Create Project</span>
                        <span className="text-sm text-[#999999]">Start a new project</span>
                    </Link>
                    <Link
                        href="/dashboard/tools/organization"
                        className="flex flex-col items-start p-4 rounded-xl border border-[#E5E5E5] hover:bg-white hover:shadow-sm transition-all group bg-[#F5F5F5]"
                    >
                        <div className="p-2 bg-black rounded-lg mb-3 transition-colors">
                            <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-black mb-1">Invite Member</span>
                        <span className="text-sm text-[#999999]">Add team members</span>
                    </Link>
                    <Link
                        href="/dashboard/tasks"
                        className="flex flex-col items-start p-4 rounded-xl border border-[#E5E5E5] hover:bg-white hover:shadow-sm transition-all group bg-[#F5F5F5]"
                    >
                        <div className="p-2 bg-black rounded-lg mb-3 transition-colors">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-black mb-1">Create Task</span>
                        <span className="text-sm text-[#999999]">Add a new task</span>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-semibold text-black mb-2">Recent Activity</h3>
                <p className="text-sm text-[#999999] mb-6">Latest updates from your organization</p>

                {org.members.length === 0 ? (
                    <p className="text-sm text-[#999999] text-center py-8">
                        No recent activity. Start by inviting team members!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {org.members.slice(0, 5).map((member) => (
                            <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                    <Users className="h-5 w-5 text-[#999999]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-black">
                                        {member.user.name || member.user.email} joined the organization
                                    </p>
                                    <p className="text-xs text-[#999999]">
                                        {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
