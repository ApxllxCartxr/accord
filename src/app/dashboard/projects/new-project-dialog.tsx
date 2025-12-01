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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createProject } from "./actions"
import { getClients } from "../clients/actions"
import { getContracts } from "../contracts/actions"
import { toast } from "sonner"
import { ProjectStatus } from "@prisma/client"

interface NewProjectDialogProps {
    organizationId: string
}

export function NewProjectDialog({ organizationId }: NewProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<{ id: string; name: string }[]>([])
    const [contracts, setContracts] = useState<{ id: string; name: string; client: { id: string } }[]>([])

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "ACTIVE" as ProjectStatus,
        clientId: "none",
        contractId: "none"
    })

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const [fetchedClients, fetchedContracts] = await Promise.all([
                    getClients(organizationId),
                    getContracts(organizationId)
                ])
                setClients(fetchedClients)
                setContracts(fetchedContracts)
            }
            fetchData()
        }
    }, [open, organizationId])

    // Auto-select client when contract is selected
    useEffect(() => {
        if (formData.contractId !== "none") {
            const selectedContract = contracts.find(c => c.id === formData.contractId)
            if (selectedContract) {
                setFormData(prev => ({ ...prev, clientId: selectedContract.client.id }))
            }
        }
    }, [formData.contractId, contracts])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            await createProject({
                name: formData.name,
                description: formData.description,
                status: formData.status,
                clientId: formData.clientId === "none" ? undefined : formData.clientId,
                contractId: formData.contractId === "none" ? undefined : formData.contractId,
                organizationId
            })

            toast.success("Project created successfully")
            setOpen(false)
            setFormData({
                name: "",
                description: "",
                status: "ACTIVE",
                clientId: "none",
                contractId: "none"
            })
        } catch (error) {
            toast.error("Failed to create project")
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
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Create a new project to track tasks and progress.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Website Redesign"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Project goals and details..."
                                className="h-20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="contract">Linked Contract (Optional)</Label>
                                <Select
                                    value={formData.contractId}
                                    onValueChange={(value) => setFormData({ ...formData, contractId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select contract" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {contracts.map((contract) => (
                                            <SelectItem key={contract.id} value={contract.id}>
                                                {contract.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="client">Client (Optional)</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                    disabled={formData.contractId !== "none"} // Disable if contract is selected (auto-filled)
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="create" disabled={loading || !formData.name.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
