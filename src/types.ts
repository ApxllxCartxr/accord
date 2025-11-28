import { Client, ClientComment, ClientHistory, ClientStatus, User } from "@prisma/client"

export interface ClientWithDetails extends Client {
    owner: {
        id: string
        name: string | null
        image: string | null
        email: string
    } | null
    comments?: (ClientComment & {
        user: {
            id: string
            name: string | null
            image: string | null
        }
    })[]
    history?: (ClientHistory & {
        user: {
            id: string
            name: string | null
            image: string | null
        }
    })[]
}

export { ClientStatus }
