import * as z from 'zod'

const schema = z.object({
    AUTH_TOKEN: z.string().min(1, 'AUTH_TOKEN is required'),
    PORTAL_DAEMON_WS: z.url(),
    CASHU_URL: z.string().min(1, 'CASHU_URL is required'),
    CASHU_TOKEN: z.string().min(1, 'CASHU_TOKEN is required'),
})

export const env = schema.parse(process.env)
