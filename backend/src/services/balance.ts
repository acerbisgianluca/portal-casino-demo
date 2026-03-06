import { JSONFilePreset } from 'lowdb/node'

type Schema = { balances: Record<string, number> }

const db = await JSONFilePreset<Schema>('db.json', { balances: {} })

export const getBalance = (pubkey: string): number =>
    db.data.balances[pubkey] ?? 0

export const addBalance = async (pubkey: string, amount: number): Promise<void> => {
    db.data.balances[pubkey] = (db.data.balances[pubkey] ?? 0) + amount
    await db.write()
}

export const deductBalance = async (pubkey: string, amount: number): Promise<void> => {
    db.data.balances[pubkey] = Math.max(0, (db.data.balances[pubkey] ?? 0) - amount)
    await db.write()
}
