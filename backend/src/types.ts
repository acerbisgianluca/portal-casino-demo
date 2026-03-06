import { type Request } from 'express'

export type EnhancedRequest = Request & {
    user: {
        pubKey: string
    }
}
