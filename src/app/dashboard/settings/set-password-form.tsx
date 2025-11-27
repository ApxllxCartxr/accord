"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setUserPassword } from "./actions"

export function SetPasswordForm() {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" })
            setIsLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters" })
            setIsLoading(false)
            return
        }

        const result = await setUserPassword(formData.password)

        if (result.success) {
            setMessage({ type: "success", text: "Password set successfully! You can now sign in with your password." })
            setFormData({ password: "", confirmPassword: "" })
        } else {
            setMessage({ type: "error", text: result.error || "Failed to set password" })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 8 characters"
                    required
                    className="bg-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter your password"
                    required
                    className="bg-white"
                />
            </div>

            {message && (
                <div className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </div>
            )}

            <Button type="submit" disabled={isLoading || !formData.password.trim()}>
                {isLoading ? "Setting password..." : "Set Password"}
            </Button>
        </form>
    )
}
