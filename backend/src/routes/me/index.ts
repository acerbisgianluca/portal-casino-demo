import { type RequestHandler } from 'express'
import { PortalDeamon } from '../../services/portal-deamon.ts'
import type { EnhancedRequest } from '../../types.ts'
import { getBalance } from '../../services/balance.ts'

export const handler: RequestHandler = async (req, res) => {
    const user = (req as EnhancedRequest).user

    const portalDeamon = await PortalDeamon.getClient()
    const userProfile = await portalDeamon.fetchProfile(user.pubKey)

    if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' })
    }

    return res.status(200).json({
        id: userProfile.id,
        pubkey: userProfile.pubkey,
        about: userProfile.about,
        display_name: userProfile.display_name,
        name: userProfile.name,
        picture: userProfile.picture,
        balance: getBalance(user.pubKey),
    })
}
