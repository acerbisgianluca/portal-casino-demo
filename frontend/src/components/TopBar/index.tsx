'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Group, Loader, Modal, NumberInput, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuth } from '@/contexts/auth'
import { useGame } from '@/contexts/game'

export default function TopBar() {
    const router = useRouter()
    const { clearSessionToken } = useAuth()
    const { buyChips, buyChipsStatus, buyChipsError, resetBuyChips, profile, refreshProfile } = useGame()
    const [topUpAmount, setTopUpAmount] = useState<number | string>(10)
    const [opened, { open, close }] = useDisclosure(false)

    useEffect(() => {
        if (buyChipsStatus === 'success') {
            close()
            resetBuyChips()
            refreshProfile()
        }
    }, [buyChipsStatus])

    const handleOpenTopUp = () => {
        resetBuyChips()
        setTopUpAmount(10)
        open()
    }

    const handleClose = () => {
        resetBuyChips()
        close()
    }

    const handleBuy = () => {
        const amount = typeof topUpAmount === 'number' ? topUpAmount : parseInt(topUpAmount as string)
        if (amount > 0) buyChips(amount)
    }

    const handleLogout = () => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('pubkey')
        clearSessionToken()
        router.push('/')
    }

    return (
        <>
            <Group
                justify="space-between"
                px="lg"
                py="sm"
                style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            >
                <Text fw={700} size="lg">
                    Casino de Portal
                </Text>

                <Group gap="md">
                    {profile ? (
                        <>
                            <Text size="sm" c="dimmed">
                                {profile.display_name || profile.name}
                            </Text>
                            <Text fw={600} size="sm">
                                {profile.balance} chips
                            </Text>
                            <Button size="xs" onClick={handleOpenTopUp}>
                                Top Up
                            </Button>
                        </>
                    ) : (
                        <Loader size="xs" />
                    )}
                    <Button size="xs" variant="subtle" color="red" onClick={handleLogout}>
                        Logout
                    </Button>
                </Group>
            </Group>

            <Modal opened={opened} onClose={handleClose} title="Top Up" centered>
                <Stack>
                    <NumberInput
                        label="Number of chips to buy"
                        description="Each chip costs 1000 millisats"
                        value={topUpAmount}
                        onChange={setTopUpAmount}
                        min={1}
                        step={10}
                    />
                    {buyChipsError && (
                        <Text c="red" size="sm">
                            {buyChipsError}
                        </Text>
                    )}
                    <Button onClick={handleBuy} loading={buyChipsStatus === 'loading'} fullWidth>
                        Buy Chips
                    </Button>
                </Stack>
            </Modal>
        </>
    )
}
