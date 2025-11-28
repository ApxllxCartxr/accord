"use client"

import { useState } from "react"
import { updateClientDetails } from "../actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Check, X, Globe, MapPin, DollarSign } from "lucide-react"
import { toast } from "sonner"

import { ClientWithDetails } from "@/types"

export function ClientInfo({ client }: { client: ClientWithDetails }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        location: client.location || "",
        website: client.website || "",
        tagline: client.tagline || "",
        value: client.value || 0,
        notes: client.notes || "",
        email: client.email || "",
        phone: client.phone || ""
    })

    async function handleSave() {
        try {
            await updateClientDetails(client.id, formData)
            setIsEditing(false)
            toast.success("Client details updated")
        } catch (error) {
            toast.error("Failed to update details")
        }
    }

    return (
        <Card className="antialiased">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 py-1">
                <CardTitle className="text-md font-medium">Client Details</CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                        if (isEditing) handleSave()
                        else setIsEditing(true)
                    }}
                >
                    {isEditing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0">
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Value (₹)</Label>
                        {isEditing ? (
                            <Input
                                type="number"
                                className="h-8 text-sm"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                            />
                        ) : (
                            <div className="flex items-center text-base font-medium h-8">
                                ₹{client.value.toLocaleString()}
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Owner</Label>
                        <div className="flex items-center gap-2 h-8">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={client.owner?.image || ""} />
                                <AvatarFallback className="text-[8px]">{client.owner?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">{client.owner?.name}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Tagline</Label>
                        {isEditing ? (
                            <Input
                                className="h-8 text-sm"
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            />
                        ) : (
                            <div className="text-sm truncate h-8 flex items-center">{client.tagline || <span className="text-muted-foreground italic text-sm">No tagline</span>}</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> Website
                        </Label>
                        {isEditing ? (
                            <Input
                                className="h-8 text-sm"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        ) : (
                            <div className="text-sm truncate h-8 flex items-center">
                                {client.website ? (
                                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 truncate">
                                        {client.image && <img src={client.image} alt="favicon" className="h-4 w-4 shrink-0" />}
                                        <span className="truncate">{client.website}</span>
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground italic text-sm">No website</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> Location
                        </Label>
                        {isEditing ? (
                            <Input
                                className="h-8 text-sm"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="City, Country"
                            />
                        ) : (
                            <div className="text-sm truncate h-8 flex items-center">{client.location || <span className="text-muted-foreground italic text-sm">No location</span>}</div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                        {isEditing ? (
                            <Input
                                className="h-8 text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@company.com"
                            />
                        ) : (
                            <div className="text-sm truncate h-8 flex items-center">{client.email || <span className="text-muted-foreground italic text-sm">No email</span>}</div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                        {isEditing ? (
                            <Input
                                className="h-8 text-sm"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        ) : (
                            <div className="text-sm truncate h-8 flex items-center">{client.phone || <span className="text-muted-foreground italic text-sm">No phone</span>}</div>
                        )}
                    </div>
                </div>


                <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                    {isEditing ? (
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[80px] text-sm"
                        />
                    ) : (
                        <div className="text-sm whitespace-pre-wrap max-h-[100px] overflow-y-auto">{client.notes || <span className="text-muted-foreground italic text-sm">No notes</span>}</div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
