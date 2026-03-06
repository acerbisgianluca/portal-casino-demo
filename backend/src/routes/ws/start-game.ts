import type WebSocket from 'ws'
import { PortalDeamon } from '../../services/portal-deamon.ts'
import type {
    ErrorMessage,
    StartGameMessage,
    StartGameResponseMessage,
    RouletteBet,
} from './types.ts'
import { env } from '../../config/env.ts'
import { CHIP } from '../../config/chips.ts'
import { deductBalance, addBalance } from '../../services/balance.ts'

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

const getColor = (n: number): 'red' | 'black' | 'green' => {
    if (n === 0) return 'green'
    return RED_NUMBERS.has(n) ? 'red' : 'black'
}

const validateBet = (bet: RouletteBet): string | null => {
    if (bet.amount <= 0) return 'Bet amount must be greater than 0'
    if (bet.type === 'number') {
        const n = bet.value as number
        if (!Number.isInteger(n) || n < 0 || n > 36)
            return `Invalid number bet value: ${bet.value} (must be 0–36)`
    } else if (bet.type === 'red-black') {
        if (bet.value !== 'red' && bet.value !== 'black')
            return `Invalid red-black value: ${bet.value}`
    } else if (bet.type === 'even-odd') {
        if (bet.value !== 'even' && bet.value !== 'odd')
            return `Invalid even-odd value: ${bet.value}`
    } else {
        return `Unknown bet type: ${(bet as RouletteBet).type}`
    }
    return null
}

const evaluateBet = (
    bet: RouletteBet,
    outcome: number,
    color: 'red' | 'black' | 'green',
): { bet: RouletteBet; won: boolean; payout: number } => {
    let won = false

    if (bet.type === 'number') {
        won = bet.value === outcome
        return { bet, won, payout: won ? bet.amount * 36 : 0 }
    }

    if (bet.type === 'red-black') {
        won = color === bet.value
        return { bet, won, payout: won ? bet.amount * 2 : 0 }
    }

    // even-odd: 0 is neither, so it always loses
    if (outcome > 0) {
        const isEven = outcome % 2 === 0
        won = (bet.value === 'even' && isEven) || (bet.value === 'odd' && !isEven)
    }
    return { bet, won, payout: won ? bet.amount * 2 : 0 }
}

export const handleStartGame = async (
    ws: WebSocket,
    data: StartGameMessage,
): Promise<void> => {
    const { payload: { pubkey, bets } } = data

    for (const bet of bets) {
        const error = validateBet(bet)
        if (error) {
            return ws.send(
                JSON.stringify({
                    type: 'error',
                    payload: { message: error },
                } satisfies ErrorMessage),
            )
        }
    }

    const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)

    const client = await PortalDeamon.getClient()
    const result = await client.requestCashu(pubkey, [], env.CASHU_URL, CHIP.type, totalBet)
    if (result.status !== 'success') {
        return ws.send(
            JSON.stringify({
                type: 'error',
                payload: { message: 'Insufficient funds or payment declined' },
            } satisfies ErrorMessage),
        )
    }

    await client.burnCashu(env.CASHU_URL, CHIP.type, result.token)
    await deductBalance(pubkey, totalBet)

    const outcome = Math.floor(Math.random() * 37)
    const color = getColor(outcome)

    const betResults = bets.map((bet) => evaluateBet(bet, outcome, color))
    const totalPayout = betResults.reduce((sum, r) => sum + r.payout, 0)

    if (totalPayout > 0) {
        const token = await client.mintCashu(
            env.CASHU_URL,
            env.CASHU_TOKEN,
            CHIP.type,
            totalPayout,
            '',
        )
        await client.sendCashuDirect(pubkey, [], token)
        await addBalance(pubkey, totalPayout)
    }

    ws.send(
        JSON.stringify({
            type: 'start-game-response',
            payload: {
                outcome,
                color,
                bets: betResults,
                totalPayout,
            },
        } satisfies StartGameResponseMessage),
    )
}
