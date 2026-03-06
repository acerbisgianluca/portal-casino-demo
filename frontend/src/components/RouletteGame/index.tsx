'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Badge, Button, Card, Container, Grid, Group,
    Modal, Stack, Text, Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import dynamic from 'next/dynamic'
import { useGame, type RouletteBet } from '@/contexts/game'
import BettingPanel from './BettingPanel'

const Wheel = dynamic(() => import('./Wheel'), { ssr: false })

const DEG_PER_SEGMENT = 360 / 37

// Compute cumulative rotation delta so the pointer (top = 270° SVG from 3-o'clock)
// lands on the center of sector `outcome`, accounting for where the wheel currently sits.
function rotationDeltaForOutcome(outcome: number, prevTarget: number): number {
    const segmentCenter = (outcome + 0.5) * DEG_PER_SEGMENT
    const neededAngle = ((270 - segmentCenter) % 360 + 360) % 360
    const prevAngle   = ((prevTarget % 360) + 360) % 360
    let delta = ((neededAngle - prevAngle) % 360 + 360) % 360
    if (delta < 0.001) delta += 360   // already aligned — still move a full extra turn
    return 5 * 360 + delta
}

export default function RouletteGame() {
    const { startGame, startGameStatus, startGameResult, startGameError, resetStartGame, refreshProfile } = useGame()

    const [isSpinning, setIsSpinning] = useState(false)
    const [targetRotation, setTargetRotation] = useState(0)
    // key used to unmount/remount BettingPanel so its local bets list resets
    const [roundKey, setRoundKey] = useState(0)
    const [payoutOpened, { open: openPayout, close: closePayout }] = useDisclosure(false)

    // Track prevTargetRotation in a ref to avoid stale closure issues
    const targetRotationRef = useRef(0)

    // When the server responds with the outcome, kick off the wheel animation
    useEffect(() => {
        if (startGameStatus === 'success' && startGameResult) {
            const delta = rotationDeltaForOutcome(startGameResult.outcome, targetRotationRef.current)
            const newTarget = targetRotationRef.current + delta
            targetRotationRef.current = newTarget
            setTargetRotation(newTarget)
            setIsSpinning(true)
        }
    }, [startGameStatus, startGameResult])

    const handleSpinComplete = () => {
        setIsSpinning(false)
        openPayout()
    }

    const handleClosePayout = () => {
        closePayout()
        resetStartGame()
        refreshProfile()
        setRoundKey(k => k + 1)
    }

    const handleSpin = (bets: RouletteBet[]) => {
        startGame(bets)
    }

    const isDisabled = startGameStatus === 'loading' || isSpinning

    const result = startGameResult

    return (
        <Container size="lg" py={{ base: 20, md: 40 }}>
            <Stack gap="xl">
                <div>
                    <Title order={1} mb="xs">Roulette</Title>
                    <Text c="dimmed">Place your bets and spin the wheel</Text>
                </div>

                <Grid gutter={{ base: 'md', md: 'xl' }}>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Card shadow="md" padding="xl" radius="md" withBorder>
                            <Stack gap="lg" align="center">
                                <Wheel
                                    targetRotation={targetRotation}
                                    isSpinning={isSpinning}
                                    onSpinComplete={handleSpinComplete}
                                />

                                {startGameError && !isSpinning && (
                                    <Text c="red" size="sm" ta="center">
                                        {startGameError}
                                    </Text>
                                )}
                            </Stack>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card shadow="md" padding="xl" radius="md" withBorder h="100%">
                            <BettingPanel
                                key={roundKey}
                                isDisabled={isDisabled}
                                onSpin={handleSpin}
                            />
                        </Card>
                    </Grid.Col>
                </Grid>
            </Stack>

            <Modal
                opened={payoutOpened}
                onClose={handleClosePayout}
                title="Round Result"
                centered
                size="sm"
            >
                {result && (
                    <Stack gap="md">
                        {/* Outcome */}
                        <Group justify="center" gap="md">
                            <div>
                                <Text size="xs" c="dimmed" ta="center">Number</Text>
                                <Badge size="xl" variant="light">{result.outcome}</Badge>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed" ta="center">Color</Text>
                                <Badge
                                    size="xl"
                                    color={result.color === 'red' ? 'red' : result.color === 'black' ? 'dark' : 'green'}
                                >
                                    {result.color.toUpperCase()}
                                </Badge>
                            </div>
                        </Group>

                        {/* Per-bet breakdown */}
                        <Stack gap={4}>
                            {result.bets.map((r, i) => {
                                const label =
                                    r.bet.type === 'number'
                                        ? `#${r.bet.value}`
                                        : String(r.bet.value).charAt(0).toUpperCase() + String(r.bet.value).slice(1)
                                const netProfit = r.payout - r.bet.amount
                                return (
                                    <Group key={i} justify="space-between">
                                        <Text size="sm">{label} (×{r.bet.amount})</Text>
                                        <Text size="sm" fw={600} c={r.won ? 'green' : 'red'}>
                                            {r.won ? `+${netProfit}` : `-${r.bet.amount}`}
                                        </Text>
                                    </Group>
                                )
                            })}
                        </Stack>

                        {/* Total */}
                        {(() => {
                            const totalBet = result.bets.reduce((s, r) => s + r.bet.amount, 0)
                            const netTotal = result.totalPayout - totalBet
                            return (
                                <Text
                                    fw={700}
                                    size="lg"
                                    ta="center"
                                    c={netTotal > 0 ? 'green' : netTotal < 0 ? 'red' : 'dimmed'}
                                >
                                    {netTotal > 0
                                        ? `You won ${netTotal} chips!`
                                        : netTotal < 0
                                            ? `You lost ${Math.abs(netTotal)} chips`
                                            : 'Break even'}
                                </Text>
                            )
                        })()}

                        <Button onClick={handleClosePayout} fullWidth>
                            Continue
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Container>
    )
}
