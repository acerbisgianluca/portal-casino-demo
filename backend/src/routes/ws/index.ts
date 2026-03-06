import type WebSocket from 'ws'
import WebSocketRouter from './router.js'
import { handleGetLoginUrl } from './get-login-url.ts'
import { handleBuyChips } from './buy-chips.ts'
import { handleStartGame } from './start-game.ts'
import type { WebSocketMessage, BuyChipsMessage, StartGameMessage } from './types.ts'

const router = new WebSocketRouter()

router.register('get-login-url', async (ws) => {
    await handleGetLoginUrl(ws)
})

router.register('buy-chips', async (ws, data) => {
    await handleBuyChips(ws, data as BuyChipsMessage)
})

router.register('start-game', async (ws, data) => {
    await handleStartGame(ws, data as StartGameMessage)
})

export function handleWebsocketConnection(ws: WebSocket) {
    console.log('New client connected')

    ws.on('message', async (message) => {
        const data = JSON.parse(message.toString()) as WebSocketMessage
        await router.handle(data, ws)
    })

    ws.on('close', () => {
        console.log('Client disconnected')
    })
}
