import { type Handler } from 'express'

import { PortalDeamon } from '../services/portal-deamon.js'
import type { EnhancedRequest } from '../types.ts'

export const auth: Handler = async (req, res, next) => {
    const authToken = req.headers['authorization'] as string
    const pubKey = req.headers['x-pubkey'] as string

    if (!authToken || !pubKey) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        const portalDeamon = await PortalDeamon.getClient()
        const isValid = await portalDeamon.verifyJwt(
            pubKey,
            authToken.replace('Bearer ', ''),
        )

        if (!isValid?.target_key) {
            return res.status(401).json({ error: 'Invalid token' })
        }

        ;(req as EnhancedRequest).user = {
            pubKey,
        }

        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
