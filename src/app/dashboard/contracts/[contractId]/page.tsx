import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getContract } from "../actions"
import { ContractDetails } from "./contract-details"
import { notFound } from "next/navigation"

export default async function ContractPage({ params }: { params: Promise<{ contractId: string }> }) {
    const session = await auth()
    if (!session?.user?.email) redirect("/auth/signin")

    const { contractId } = await params
    const contract = await getContract(contractId)

    if (!contract) {
        notFound()
    }

    return <ContractDetails contract={contract} />
}
