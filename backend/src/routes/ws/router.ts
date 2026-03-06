import WebSocket from 'ws'
import type { WebSocketRouterCallback, WebSocketMessage } from './types.ts'

export default class WebSocketRouter {
    private readonly routes: Map<string, WebSocketRouterCallback>

    constructor() {
        this.routes = new Map()
    }

    public register(route: string, callback: WebSocketRouterCallback) {
        this.routes.set(route, callback)
    }

    public async handle(data: WebSocketMessage, ws: WebSocket) {
        const handler = this.routes.get(data.type)
        if (handler) {
            await handler(ws, data)
        }
    }
}
