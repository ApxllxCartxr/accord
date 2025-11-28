"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateContract, deleteContract } from "../actions"
import { toast } from "sonner"
import { Loader2, Trash2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ContractDetailsProps {
    contract: any // Using any for now due to type issues pending prisma generate
}

export function ContractDetails({ contract }: ContractDetailsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: contract.name,
        value: contract.value.toString(),
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
        content: contract.content || "",
        signerName: contract.signerName || "",
        signerPhone: contract.signerPhone || "",
        signerEmail: contract.signerEmail || ""
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            await updateContract(contract.id, {
                name: formData.name,
                value: parseFloat(formData.value) || 0,
                startDate: formData.startDate ? new Date(formData.startDate) : undefined,
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                content: formData.content,
                signerName: formData.signerName,
                signerPhone: formData.signerPhone,
                signerEmail: formData.signerEmail
            })
            toast.success("Contract updated successfully")
        } catch (error) {
            toast.error("Failed to update contract")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this contract?")) return

        try {
            await deleteContract(contract.id)
            toast.success("Contract deleted")
            router.push("/dashboard/contracts")
        } catch (error) {
            toast.error("Failed to delete contract")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/contracts">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{contract.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <span>{contract.client.name}</span>
                            <span>•</span>
                            <Badge variant="outline">{contract.status}</Badge>
                        </div>
                    </div>
                </div>
                <Button variant="destructive" size="icon" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contract Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Contract Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Content / Terms</Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="min-h-[300px] font-mono text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Value & Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Value (₹)</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
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
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Signer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="signerName">Name</Label>
                                    <Input
                                        id="signerName"
                                        value={formData.signerName}
                                        onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                                        placeholder="Signer Name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signerEmail">Email</Label>
                                    <Input
                                        id="signerEmail"
                                        type="email"
                                        value={formData.signerEmail}
                                        onChange={(e) => setFormData({ ...formData, signerEmail: e.target.value })}
                                        placeholder="signer@example.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signerPhone">Phone</Label>
                                    <Input
                                        id="signerPhone"
                                        type="tel"
                                        value={formData.signerPhone}
                                        onChange={(e) => setFormData({ ...formData, signerPhone: e.target.value })}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
