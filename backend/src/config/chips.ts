export type Chip = {
    title: string
    priceInMillisats: number
    type: 'single' | 'multi'
}

export const CHIP: Chip = {
    title: 'One',
    priceInMillisats: 1000,
    type: 'multi',
}
