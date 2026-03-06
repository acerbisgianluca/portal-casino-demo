import { PortalSDK } from 'portal-sdk'

import { env } from '../config/env.js'

export class PortalDeamon {
    private static instance: PortalDeamon | null = null

    private readonly client: PortalSDK

    private constructor() {
        this.client = new PortalSDK({
            serverUrl: env.PORTAL_DAEMON_WS,
            connectTimeout: 10000,
        })
    }

    public static async getClient(): Promise<PortalSDK> {
        if (!PortalDeamon.instance) {
            PortalDeamon.instance = new PortalDeamon()
            await PortalDeamon.instance.init()
        }

        return PortalDeamon.instance.client
    }

    async init() {
        await this.client.connect()
        await this.client.authenticate(env.AUTH_TOKEN)
        console.log('PortalDeamon client initialized')
    }
}
