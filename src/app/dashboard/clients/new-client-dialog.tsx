"use client"

import { useState, useEffect } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient, getOrgMembers } from "./actions"
import { ClientStatus } from "@prisma/client"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface NewClientDialogProps {
    organizationId: string
    currentUserId: string
}

export function NewClientDialog({ organizationId, currentUserId }: NewClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [members, setMembers] = useState<{ id: string, user: { id: string, name: string | null, email: string } }[]>([])
    const router = useRouter()

    useEffect(() => {
        if (open) {
            getOrgMembers(organizationId).then(setMembers)
        }
    }, [open, organizationId])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const name = formData.get("name") as string
        const tagline = formData.get("tagline") as string
        const value = parseFloat(formData.get("value") as string) || 0
        const status = formData.get("status") as ClientStatus
        const ownerId = formData.get("ownerId") as string

        try {
            await createClient({
                name,
                tagline,
                value,
                status,
                ownerId,
                organizationId,
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="create">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                        Create a new client record for your organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" name="name" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tagline" className="text-right">
                                Tagline
                            </Label>
                            <Input id="tagline" name="tagline" className="col-span-3" placeholder="e.g. Software Development" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right">
                                Value (₹)
                            </Label>
                            <Input id="value" name="value" type="number" step="0.01" className="col-span-3" defaultValue="0" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select name="status" defaultValue={ClientStatus.LEAD}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(ClientStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ownerId" className="text-right">
                                Owner
                            </Label>
                            <Select name="ownerId" defaultValue={currentUserId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select owner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.user.email} value={member.user.id || ""}>
                                            {member.user.name || member.user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant="create" disabled={loading}>
                            {loading ? "Creating..." : "Create Client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
