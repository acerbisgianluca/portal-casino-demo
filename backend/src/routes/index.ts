import express from 'express'
import { auth } from '../middlewares/auth.js'
import { handler as meHandler } from './me/index.js'

export const router = express.Router()

router.get('/me', auth, meHandler)

export { handleWebsocketConnection } from './ws/index.js'
