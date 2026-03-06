import type WebSocket from 'ws'

export type WebSocketRouterCallback = (
    ws: WebSocket,
    event: WebSocketMessage,
) => Promise<void>

export type GetLoginUrlMessage = {
    type: 'get-login-url'
    payload: {}
}

export type LoginUrlMessage = {
    type: 'login-url'
    payload: {
        loginUrl: string
    }
}

export type LoginApprovedMessage = {
    type: 'login-approved'
    payload: {
        token: string
        pubkey: string
    }
}

export type LoginDeclinedMessage = {
    type: 'login-declined'
    payload: {}
}

export type BuyChipsMessage = {
    type: 'buy-chips'
    payload: {
        pubkey: string
        amount: number
    }
}

export type ErrorMessage = {
    type: 'error'
    payload: {
        message: string
    }
}

export type RouletteBet = {
    type: 'number' | 'red-black' | 'even-odd'
    value: number | 'red' | 'black' | 'even' | 'odd'
    amount: number
}

export type StartGameMessage = {
    type: 'start-game'
    payload: {
        pubkey: string
        bets: RouletteBet[]
    }
}

export type StartGameResponseMessage = {
    type: 'start-game-response'
    payload: {
        outcome: number
        color: 'red' | 'black' | 'green'
        bets: {
            bet: RouletteBet
            won: boolean
            payout: number
        }[]
        totalPayout: number
    }
}

export type WebSocketMessage = GetLoginUrlMessage | BuyChipsMessage | StartGameMessage
