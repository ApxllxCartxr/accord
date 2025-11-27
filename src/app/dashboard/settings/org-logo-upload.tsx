"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { uploadOrgLogo } from "./actions"

interface OrgLogoUploadProps {
    orgId: string
    currentLogo: string | null
}

export function OrgLogoUpload({ orgId, currentLogo }: OrgLogoUploadProps) {
    const [logo, setLogo] = useState<string | null>(currentLogo)
    const [isUploading, setIsUploading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setMessage({ type: "error", text: "Please select an image file" })
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: "error", text: "Image must be less than 2MB" })
            return
        }

        setIsUploading(true)
        setMessage(null)

        try {
            // Convert to base64 for simple storage
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64String = reader.result as string

                const result = await uploadOrgLogo(orgId, base64String)

                if (result.success) {
                    setLogo(base64String)
                    setMessage({ type: "success", text: "Logo uploaded successfully!" })
                } else {
                    setMessage({ type: "error", text: result.error || "Failed to upload logo" })
                }

                setIsUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            setMessage({ type: "error", text: "Failed to upload logo" })
            setIsUploading(false)
        }
    }

    const handleRemoveLogo = async () => {
        setIsUploading(true)
        setMessage(null)

        const result = await uploadOrgLogo(orgId, null)

        if (result.success) {
            setLogo(null)
            setMessage({ type: "success", text: "Logo removed successfully!" })
        } else {
            setMessage({ type: "error", text: result.error || "Failed to remove logo" })
        }

        setIsUploading(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                    {logo ? (
                        <div className="relative">
                            <Image
                                src={logo}
                                alt="Organization logo"
                                width={100}
                                height={100}
                                className="rounded-lg border border-[#E5E5E5]"
                            />
                            <button
                                onClick={handleRemoveLogo}
                                disabled={isUploading}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                aria-label="Remove logo"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-[100px] h-[100px] rounded-lg border-2 border-dashed border-[#E5E5E5] flex items-center justify-center bg-white">
                            <Upload className="h-8 w-8 text-[#999999]" />
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Uploading..." : logo ? "Change Logo" : "Upload Logo"}
                    </Button>
                    <p className="text-xs text-[#999999]">
                        Recommended: Square image, at least 200x200px, max 2MB
                    </p>
                </div>
            </div>

            {message && (
                <div className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </div>
            )}
        </div>
    )
}
