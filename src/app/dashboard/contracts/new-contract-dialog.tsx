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
import { Plus, Loader2 } from "lucide-react"
import { createContract } from "./actions"
import { toast } from "sonner"
import { ClientWithDetails } from "@/types"

interface NewContractDialogProps {
    clients: any[] // Using any for now to avoid strict type issues with partial client data
    organizationId: string
    defaultClientId?: string
}

export function NewContractDialog({ clients, organizationId, defaultClientId }: NewContractDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        value: "",
        startDate: "",
        endDate: "",
        content: "",
        clientId: defaultClientId || "",
        signerName: "",
        signerPhone: "",
        signerEmail: ""
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            await createContract({
                name: formData.name,
                value: parseFloat(formData.value) || 0,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                content: formData.content,
                clientId: formData.clientId,
                organizationId: organizationId,
                signerName: formData.signerName,
                signerPhone: formData.signerPhone,
                signerEmail: formData.signerEmail
            })

            toast.success("Contract created successfully")
            setOpen(false)
            setFormData({
                name: "",
                value: "",
                startDate: "",
                endDate: "",
                content: "",
                clientId: defaultClientId || "",
                signerName: "",
                signerPhone: "",
                signerEmail: ""
            })
        } catch (error) {
            toast.error("Failed to create contract")
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
                    New Contract
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Contract</DialogTitle>
                        <DialogDescription>
                            Create a new contract for a client. You can add details and send it for review.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client">Client</Label>
                            <Select
                                value={formData.clientId}
                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                disabled={!!defaultClientId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Contract Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Web Development Agreement"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value (₹)</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">Content / Terms</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Paste contract terms or content here..."
                                className="h-32"
                            />
                        </div>

                        <div className="space-y-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-muted-foreground">Signer Details</h4>
                            <div className="grid gap-2">
                                <Label htmlFor="signerName">Signer Name</Label>
                                <Input
                                    id="signerName"
                                    value={formData.signerName}
                                    onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="signerEmail">Signer Email</Label>
                                    <Input
                                        id="signerEmail"
                                        type="email"
                                        value={formData.signerEmail}
                                        onChange={(e) => setFormData({ ...formData, signerEmail: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signerPhone">Signer Phone</Label>
                                    <Input
                                        id="signerPhone"
                                        type="tel"
                                        value={formData.signerPhone}
                                        onChange={(e) => setFormData({ ...formData, signerPhone: e.target.value })}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="create" disabled={loading || !formData.clientId}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Contract
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
