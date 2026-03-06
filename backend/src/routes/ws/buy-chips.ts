import type WebSocket from 'ws'
import { PortalDeamon } from '../../services/portal-deamon.ts'
import type { ErrorMessage, BuyChipsMessage } from './types.ts'
import { CHIP } from '../../config/chips.ts'
import { Currency } from 'portal-sdk'
import { env } from '../../config/env.ts'
import { addBalance } from '../../services/balance.ts'

export const handleBuyChips = async (
    ws: WebSocket,
    data: BuyChipsMessage,
): Promise<void> => {
    const {
        payload: { amount, pubkey },
    } = data

    const totalMillisats = CHIP.priceInMillisats * amount

    const client = await PortalDeamon.getClient()
    const jwt = await client.issueJwt(pubkey, 24)
    await client.requestSinglePayment(
        pubkey,
        [],
        {
            amount: totalMillisats,
            currency: Currency.Millisats,
            description: 'Casino chips purchase',
            auth_token: jwt,
        },
        async (status) => {
            console.log('Payment status:', status.status)
            if (status.status === 'user_approved') {
                const client = await PortalDeamon.getClient()
                const token = await client.mintCashu(
                    env.CASHU_URL,
                    env.CASHU_TOKEN,
                    CHIP.type,
                    amount,
                    '',
                )
                await client.sendCashuDirect(pubkey, [], token)
                await addBalance(pubkey, amount)

                ws.send(JSON.stringify({
                    type: 'buy-chips-response',
                    payload: {
                        status: 'paid',
                    }
                }))
            } else if (!['paid', 'user_success'].includes(status.status)) {
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        payload: { message: 'Payment failed or declined' },
                    } satisfies ErrorMessage),
                )
            }
        },
    )
}
