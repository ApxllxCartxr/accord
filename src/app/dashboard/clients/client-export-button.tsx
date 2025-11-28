"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToExcel } from "@/lib/export-utils"
import { Client } from "@prisma/client"

interface ClientExportButtonProps {
    data: any[]
}

export function ClientExportButton({ data }: ClientExportButtonProps) {
    return (
        <Button
            variant="outline"
            onClick={() => exportToExcel(data, "clients_export")}
            className="bg-background border-border-subtle"
        >
            <Download className="mr-2 h-4 w-4" />
            Export
        </Button>
    )
}
