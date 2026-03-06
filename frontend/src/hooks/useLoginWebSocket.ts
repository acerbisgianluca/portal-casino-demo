import { useEffect, useRef, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

type ServerMessage =
    | { type: 'login-url'; payload: { loginUrl: string } }
    | { type: 'login-approved'; payload: { token: string; pubkey: string } }
    | { type: 'login-declined'; payload: Record<string, never> }

export type LoginStatus = 'connecting' | 'waiting' | 'approved' | 'declined'

interface LoginWebSocketResult {
    loginUrl: string | null
    status: LoginStatus
    session: { token: string; pubkey: string } | null
}

export function useLoginWebSocket(): LoginWebSocketResult {
    const [loginUrl, setLoginUrl] = useState<string | null>(null)
    const [status, setStatus] = useState<LoginStatus>('connecting')
    const [session, setSession] = useState<{ token: string; pubkey: string } | null>(null)
    const sentRef = useRef(false)

    const { sendJsonMessage, readyState } = useWebSocket(
        process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET!,
        {
            onMessage: (event) => {
                const msg = JSON.parse(event.data as string) as ServerMessage
                if (msg.type === 'login-url') {
                    setLoginUrl(msg.payload.loginUrl)
                } else if (msg.type === 'login-approved') {
                    setSession(msg.payload)
                    setStatus('approved')
                } else if (msg.type === 'login-declined') {
                    setStatus('declined')
                }
            },
            share: true,
        },
    )

    useEffect(() => {
        if (readyState === ReadyState.OPEN && !sentRef.current) {
            sentRef.current = true
            sendJsonMessage({ type: 'get-login-url', payload: {} })
        }
    }, [readyState, sendJsonMessage])

    return { loginUrl, status, session }
}
