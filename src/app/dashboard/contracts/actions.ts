"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ContractStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"

import { recalculateClientValue } from "../clients/actions"

export async function createContract(data: {
    name: string
    value: number
    startDate?: Date
    endDate?: Date
    content?: string
    clientId: string
    organizationId: string
    projectId?: string
    signerName?: string
    signerPhone?: string
    signerEmail?: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    // Verify user belongs to organization
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            memberships: {
                where: { organizationId: data.organizationId }
            }
        }
    })

    if (!user || !user.memberships[0]) throw new Error("Unauthorized")

    const contract = await prisma.contract.create({
        data: {
            name: data.name,
            value: data.value,
            startDate: data.startDate,
            endDate: data.endDate,
            content: data.content,
            clientId: data.clientId,
            organizationId: data.organizationId,
            status: "DRAFT",
            signerName: data.signerName,
            signerPhone: data.signerPhone,
            signerEmail: data.signerEmail
        }
    })

    if (data.projectId) {
        await prisma.project.update({
            where: { id: data.projectId },
            data: { contractId: contract.id }
        })
    }

    await recalculateClientValue(data.clientId)

    revalidatePath("/dashboard/contracts")
    revalidatePath(`/dashboard/clients/${data.clientId}`)
    return contract
}

export async function getContracts(orgId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.contract.findMany({
        where: { organizationId: orgId },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            },
            projects: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getContract(contractId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    phone: true
                }
            },
            projects: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
}

export async function getClientContracts(clientId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    return await prisma.contract.findMany({
        where: { clientId },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function updateContractStatus(contractId: string, status: ContractStatus) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    await prisma.contract.update({
        where: { id: contractId },
        data: { status }
    })

    revalidatePath("/dashboard/contracts")
}

export async function updateContract(contractId: string, data: {
    name?: string
    value?: number
    startDate?: Date
    endDate?: Date
    content?: string
    signerName?: string
    signerPhone?: string
    signerEmail?: string
}) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const contract = await prisma.contract.update({
        where: { id: contractId },
        data
    })

    if (data.value !== undefined) {
        await recalculateClientValue(contract.clientId)
    }

    revalidatePath("/dashboard/contracts")
    revalidatePath(`/dashboard/contracts/${contractId}`)
}

export async function deleteContract(contractId: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const contract = await prisma.contract.delete({
        where: { id: contractId }
    })

    await recalculateClientValue(contract.clientId)

    revalidatePath("/dashboard/contracts")
}

export async function sendContractEmail(contractId: string, email: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
            client: true,
            organization: true
        }
    })

    if (!contract) throw new Error("Contract not found")

    // Configure transporter (using Mailpit for dev or env vars for prod)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || "localhost",
        port: Number(process.env.EMAIL_SERVER_PORT) || 1025,
        secure: false,
        auth: process.env.EMAIL_SERVER_USER ? {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        } : undefined,
    })

    const mailOptions = {
        from: `"${contract.organization.name}" <noreply@accordcrm.com>`,
        to: email,
        subject: `Contract: ${contract.name}`,
        text: `
Hello,

Please review the attached contract from ${contract.organization.name}.

Contract Details:
Name: ${contract.name}
Value: ₹${contract.value.toLocaleString()}
Start Date: ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'}
End Date: ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}

Content:
${contract.content || "No content provided."}

Best regards,
${session.user.name}
        `,
        html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Contract for Review</h2>
    <p>Hello,</p>
    <p>Please review the attached contract from <strong>${contract.organization.name}</strong>.</p>
    
    <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${contract.name}</h3>
        <p><strong>Value:</strong> ₹${contract.value.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'} - ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}</p>
        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 15px 0;">
        <div style="white-space: pre-wrap;">${contract.content || "No content provided."}</div>
    </div>

    <p>Best regards,<br>${session.user.name}</p>
</div>
        `
    }

    await transporter.sendMail(mailOptions)

    // Update status to SENT if it was DRAFT
    if (contract.status === "DRAFT") {
        await updateContractStatus(contractId, "SENT")
    }

    return { success: true }
}
