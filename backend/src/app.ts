import express from 'express'
import expressWs from 'express-ws'
import { router, handleWebsocketConnection } from './routes/index.js'
import cors from 'cors'

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}

export const { app } = expressWs(express())
app.use(cors(corsOptions))

app.ws('/ws', (ws) => {
    handleWebsocketConnection(ws)
})

app.use('/api', router)

app.get('/', (_req, res) => {
    res.send('Service is running')
})
