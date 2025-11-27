"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInAction, sendMagicLinkAction } from "./actions"

export default function SignInPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showMagicLink, setShowMagicLink] = useState(false)
    const [magicLinkSent, setMagicLinkSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const result = await signInAction({
            email: formData.email,
            password: formData.password,
        })

        if (result.success) {
            router.push("/dashboard")
        } else {
            setError(result.error || "Invalid email or password")
            setIsLoading(false)
        }
    }

    const handleMagicLink = async () => {
        if (!formData.email) {
            setError("Please enter your email")
            return
        }

        setError("")
        setIsLoading(true)

        const result = await sendMagicLinkAction(formData.email)

        if (result.success) {
            setMagicLinkSent(true)
        } else {
            setError(result.error || "Failed to send magic link")
        }

        setIsLoading(false)
    }

    if (magicLinkSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F2F1EF] px-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm text-center space-y-4">
                        <h2 className="text-2xl font-bold text-black font-heading">Check your email</h2>
                        <p className="text-[#999999]">
                            We've sent a magic link to <strong>{formData.email}</strong>
                        </p>
                        <p className="text-sm text-[#999999]">
                            Click the link in the email to sign in.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setMagicLinkSent(false)}
                            className="w-full"
                        >
                            Back to sign in
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F2F1EF] px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-black font-heading">
                        Welcome Back
                    </h1>
                    <p className="text-[#999999]">
                        Sign in to your account
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
                    {!showMagicLink ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter your password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-[#E5E5E5]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-[#999999]">Or</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowMagicLink(true)}
                            >
                                Sign in with magic link
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="magic-email">Email</Label>
                                <Input
                                    id="magic-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={handleMagicLink}
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send Magic Link"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowMagicLink(false)}
                            >
                                Back to password sign in
                            </Button>
                        </div>
                    )}

                    <div className="mt-4 text-center text-sm text-[#999999]">
                        Don't have an account?{" "}
                        <Link href="/auth/signin" className="text-black font-medium hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
