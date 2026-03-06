'use client'

import { useState } from 'react'
import {
    Box, Button, Group,
    ScrollArea, SimpleGrid, Stack, Text,
} from '@mantine/core'
import type { RouletteBet } from '@/contexts/game'

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

const numBg = (n: number) =>
    n === 0 ? '#2d8659' : RED_NUMBERS.has(n) ? '#ee5a5a' : '#2c2c2c'

interface BettingPanelProps {
    isDisabled: boolean
    onSpin: (bets: RouletteBet[]) => void
}

const CHIP_DEFS = [
    { value: 1,  bg: '#e8e8e8', text: '#222', dash: 'rgba(100,100,100,0.5)' },
    { value: 2,  bg: '#cc3333', text: '#fff', dash: 'rgba(255,255,255,0.6)' },
    { value: 5,  bg: '#2255cc', text: '#fff', dash: 'rgba(255,255,255,0.6)' },
    { value: 10, bg: '#2d8659', text: '#fff', dash: 'rgba(255,255,255,0.6)' },
]

function SelectorChip({
    value, bg, text, dash, selected, disabled, onClick,
}: typeof CHIP_DEFS[0] & { selected: boolean; disabled: boolean; onClick: () => void }) {
    return (
        <div
            onClick={disabled ? undefined : onClick}
            style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: bg,
                border: `4px dashed ${dash}`,
                boxShadow: selected
                    ? `0 0 0 3px white, 0 0 14px ${bg}, 0 3px 8px rgba(0,0,0,0.5)`
                    : '0 3px 8px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transform: selected ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                opacity: disabled ? 0.5 : 1,
                userSelect: 'none',
            }}
        >
            <span style={{ fontWeight: 800, fontSize: 15, color: text, letterSpacing: '-0.5px', pointerEvents: 'none' }}>
                {value}
            </span>
        </div>
    )
}

function BetChip({ total, size }: { total: number; size: number }) {
    return (
        <div
            style={{
                position: 'absolute',
                top: -size / 3,
                right: -size / 3,
                width: size,
                height: size,
                borderRadius: '50%',
                background: '#f5d76e',
                border: '2px dashed rgba(160,120,0,0.7)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none',
            }}
        >
            <span style={{ fontWeight: 800, fontSize: size * 0.42, color: '#333', lineHeight: 1 }}>
                {total}
            </span>
        </div>
    )
}

type BetMap = Record<string, RouletteBet>
const betKey = (type: RouletteBet['type'], value: RouletteBet['value']) => `${type}:${value}`

export default function BettingPanel({ isDisabled, onSpin }: BettingPanelProps) {
    const [betAmount, setBetAmount] = useState<number>(1)
    const [bets, setBets] = useState<BetMap>({})

    const addBet = (type: RouletteBet['type'], value: RouletteBet['value']) => {
        const key = betKey(type, value)
        setBets(prev => ({
            ...prev,
            [key]: { type, value, amount: (prev[key]?.amount ?? 0) + betAmount },
        }))
    }

    const removeBet = (type: RouletteBet['type'], value: RouletteBet['value']) => {
        const key = betKey(type, value)
        setBets(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    const totalBet = Object.values(bets).reduce((s, b) => s + b.amount, 0)
    const hasBets = totalBet > 0

    const handleSpin = () => {
        if (!hasBets) return
        onSpin(Object.values(bets))
    }

    const getBetTotal = (type: RouletteBet['type'], value: RouletteBet['value']) =>
        bets[betKey(type, value)]?.amount ?? 0

    const outsideBets: { label: string; type: RouletteBet['type']; value: RouletteBet['value']; bg: string }[] = [
        { label: 'Red',   type: 'red-black', value: 'red',   bg: '#ee5a5a' },
        { label: 'Black', type: 'red-black', value: 'black', bg: '#2c2c2c' },
        { label: 'Even',  type: 'even-odd',  value: 'even',  bg: '#495057' },
        { label: 'Odd',   type: 'even-odd',  value: 'odd',   bg: '#495057' },
    ]

    return (
        <Stack gap="md" style={{ height: '100%' }}>
            {/* Chip selector */}
            <Box>
                <Text size="xs" c="dimmed" fw={600} mb={10} tt="uppercase" lts={0.5}>
                    Select Chip
                </Text>
                <Group justify="center" gap="lg">
                    {CHIP_DEFS.map(chip => (
                        <SelectorChip
                            key={chip.value}
                            {...chip}
                            selected={betAmount === chip.value}
                            disabled={isDisabled}
                            onClick={() => setBetAmount(chip.value)}
                        />
                    ))}
                </Group>
            </Box>

            {/* Outside bets */}
            <Box>
                <Text size="xs" c="dimmed" fw={600} mb={6} tt="uppercase" lts={0.5}>
                    Outside Bets
                </Text>
                <SimpleGrid cols={2} spacing="xs">
                    {outsideBets.map(({ label, type, value, bg }) => {
                        const total = getBetTotal(type, value)
                        return (
                            <div
                                key={label}
                                style={{ position: 'relative', display: 'block' }}
                                onContextMenu={e => { e.preventDefault(); removeBet(type, value) }}
                            >
                                <Button
                                    fullWidth
                                    size="sm"
                                    style={{ background: bg, color: '#fff', border: 'none' }}
                                    onClick={() => addBet(type, value)}
                                    disabled={isDisabled}
                                >
                                    {label}
                                </Button>
                                {total > 0 && <BetChip total={total} size={24} />}
                            </div>
                        )
                    })}
                </SimpleGrid>
            </Box>

            {/* Number grid */}
            <Box>
                <Text size="xs" c="dimmed" fw={600} mb={6} tt="uppercase" lts={0.5}>
                    Numbers
                </Text>
                <ScrollArea h={250} type="hover">
                    {/* 0 */}
                    <div
                        style={{ position: 'relative', marginBottom: 4 }}
                        onContextMenu={e => { e.preventDefault(); removeBet('number', 0) }}
                    >
                        <Button
                            fullWidth
                            size="xs"
                            style={{ background: '#2d8659', color: '#fff', border: 'none' }}
                            onClick={() => addBet('number', 0)}
                            disabled={isDisabled}
                        >
                            0
                        </Button>
                        {getBetTotal('number', 0) > 0 && <BetChip total={getBetTotal('number', 0)} size={20} />}
                    </div>
                    <SimpleGrid cols={6} spacing={3}>
                        {Array.from({ length: 36 }, (_, i) => i + 1).map(n => {
                            const total = getBetTotal('number', n)
                            return (
                                <div
                                    key={n}
                                    style={{ position: 'relative' }}
                                    onContextMenu={e => { e.preventDefault(); removeBet('number', n) }}
                                >
                                    <Button
                                        fullWidth
                                        size="xs"
                                        px={0}
                                        style={{
                                            background: numBg(n),
                                            color: '#fff',
                                            border: 'none',
                                            minWidth: 0,
                                            fontSize: 11,
                                        }}
                                        onClick={() => addBet('number', n)}
                                        disabled={isDisabled}
                                    >
                                        {n}
                                    </Button>
                                    {total > 0 && <BetChip total={total} size={18} />}
                                </div>
                            )
                        })}
                    </SimpleGrid>
                </ScrollArea>
            </Box>

            {/* Total + Spin */}
            {hasBets && (
                <Group justify="space-between" align="center">
                    <Text size="sm" fw={600}>Total: {totalBet} chips</Text>
                    <Text
                        size="xs"
                        c="dimmed"
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setBets({})}
                    >
                        Clear all
                    </Text>
                </Group>
            )}

            <Button
                size="lg"
                fullWidth
                mt="auto"
                onClick={handleSpin}
                disabled={isDisabled || !hasBets}
                loading={isDisabled}
            >
                {isDisabled ? 'Spinning...' : 'Spin'}
            </Button>
        </Stack>
    )
}
