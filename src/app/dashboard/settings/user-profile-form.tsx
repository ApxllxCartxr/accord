"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserName } from "./actions"

interface UserProfileFormProps {
    userName: string | null
    userEmail: string
}

export function UserProfileForm({ userName, userEmail }: UserProfileFormProps) {
    const [name, setName] = useState(userName || "")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const result = await updateUserName(name)

        if (result.success) {
            setMessage({ type: "success", text: "Name updated successfully!" })
        } else {
            setMessage({ type: "error", text: result.error || "Failed to update name" })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="bg-white"
                />
            </div>

            {message && (
                <div className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </div>
            )}

            <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Updating..." : "Update Name"}
            </Button>
        </form>
    )
}
