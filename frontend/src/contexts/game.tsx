'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { getMe, type UserProfile } from '@/services/api'

export type BuyChipsStatus = 'idle' | 'loading' | 'success' | 'error'
export type StartGameStatus = 'idle' | 'loading' | 'success' | 'error'

export interface RouletteBet {
    type: 'number' | 'red-black' | 'even-odd'
    value: number | 'red' | 'black' | 'even' | 'odd'
    amount: number
}

export interface StartGameResult {
    outcome: number
    color: 'red' | 'black' | 'green'
    bets: { bet: RouletteBet; won: boolean; payout: number }[]
    totalPayout: number
}

interface GameContextValue {
    buyChips: (amount: number) => void
    buyChipsStatus: BuyChipsStatus
    buyChipsError: string | null
    resetBuyChips: () => void

    startGame: (bets: RouletteBet[]) => void
    startGameStatus: StartGameStatus
    startGameResult: StartGameResult | null
    startGameError: string | null
    resetStartGame: () => void

    profile: UserProfile | null
    refreshProfile: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

type IncomingMessage =
    | { type: 'buy-chips-response'; payload: { status: string } }
    | { type: 'start-game-response'; payload: StartGameResult }
    | { type: 'error'; payload: { message: string } }
    | { type: string }

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [buyChipsStatus, setBuyChipsStatus] = useState<BuyChipsStatus>('idle')
    const [buyChipsError, setBuyChipsError] = useState<string | null>(null)
    const buyChipsStatusRef = useRef<BuyChipsStatus>('idle')

    const [startGameStatus, setStartGameStatus] = useState<StartGameStatus>('idle')
    const [startGameResult, setStartGameResult] = useState<StartGameResult | null>(null)
    const [startGameError, setStartGameError] = useState<string | null>(null)
    const startGameStatusRef = useRef<StartGameStatus>('idle')

    const [profile, setProfile] = useState<UserProfile | null>(null)

    const { sendJsonMessage } = useWebSocket(process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET!, {
        share: true,
        onMessage: (event) => {
            const msg = JSON.parse(event.data as string) as IncomingMessage

            if (msg.type === 'buy-chips-response') {
                buyChipsStatusRef.current = 'success'
                setBuyChipsStatus('success')
            } else if (msg.type === 'start-game-response') {
                const result = (msg as { type: 'start-game-response'; payload: StartGameResult }).payload
                startGameStatusRef.current = 'success'
                setStartGameResult(result)
                setStartGameStatus('success')
            } else if (msg.type === 'error') {
                const message = (msg as { type: 'error'; payload: { message: string } }).payload.message
                if (buyChipsStatusRef.current === 'loading') {
                    buyChipsStatusRef.current = 'error'
                    setBuyChipsError(message)
                    setBuyChipsStatus('error')
                } else if (startGameStatusRef.current === 'loading') {
                    startGameStatusRef.current = 'error'
                    setStartGameError(message)
                    setStartGameStatus('error')
                }
            }
        },
    })

    const refreshProfile = () => {
        getMe()
            .then(setProfile)
            .catch(() => {})
    }

    useEffect(() => {
        refreshProfile()
    }, [])

    const buyChips = (amount: number) => {
        const pubkey = sessionStorage.getItem('pubkey')
        if (!pubkey) return
        buyChipsStatusRef.current = 'loading'
        setBuyChipsStatus('loading')
        setBuyChipsError(null)
        sendJsonMessage({ type: 'buy-chips', payload: { pubkey, amount } })
    }

    const resetBuyChips = () => {
        buyChipsStatusRef.current = 'idle'
        setBuyChipsStatus('idle')
        setBuyChipsError(null)
    }

    const startGame = (bets: RouletteBet[]) => {
        const pubkey = sessionStorage.getItem('pubkey')
        if (!pubkey) return
        startGameStatusRef.current = 'loading'
        setStartGameStatus('loading')
        setStartGameResult(null)
        setStartGameError(null)
        sendJsonMessage({ type: 'start-game', payload: { pubkey, bets } })
    }

    const resetStartGame = () => {
        startGameStatusRef.current = 'idle'
        setStartGameStatus('idle')
        setStartGameResult(null)
        setStartGameError(null)
    }

    return (
        <GameContext.Provider
            value={{
                buyChips, buyChipsStatus, buyChipsError, resetBuyChips,
                startGame, startGameStatus, startGameResult, startGameError, resetStartGame,
                profile, refreshProfile,
            }}
        >
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const ctx = useContext(GameContext)
    if (!ctx) throw new Error('useGame must be used within GameProvider')
    return ctx
}
