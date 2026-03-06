'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Center, Container, Flex, Loader, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { QRCodeSVG } from 'qrcode.react'
import { useLoginWebSocket } from '@/hooks/useLoginWebSocket'
import { useAuth } from '@/contexts/auth'

export default function LoginPage() {
    const router = useRouter()
    const { setSessionToken, isAuthenticated, isLoading } = useAuth()
    const { loginUrl, status, session } = useLoginWebSocket()
    const [declinedOpened, { open: openDeclined, close: closeDeclined }] = useDisclosure(false)

    // Already logged in — skip the login screen
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/game')
        }
    }, [isLoading, isAuthenticated, router])

    useEffect(() => {
        if (status === 'approved' && session) {
            sessionStorage.setItem('token', session.token)
            sessionStorage.setItem('pubkey', session.pubkey)
            setSessionToken(session.token)
            router.push('/game')
        }
    }, [status, session, router, setSessionToken])

    useEffect(() => {
        if (status === 'declined') {
            openDeclined()
        }
    }, [status, openDeclined])

    return (
        <>
            <Container size="sm" py={{ base: 40, md: 80 }}>
                <Flex direction="column" gap="lg" align="center">
                    <div>
                        <Title order={1} ta="center" mb="xs">
                            Casino de Portal
                        </Title>
                        <Text ta="center" c="dimmed" size="lg">
                            Scan to login with Portal App
                        </Text>
                    </div>

                    <Card shadow="md" padding="xl" radius="md" withBorder>
                        <Center style={{ minHeight: 256 }}>
                            {loginUrl ? (
                                <QRCodeSVG value={loginUrl} size={256} />
                            ) : (
                                <Loader size="xl" />
                            )}
                        </Center>

                        <Text ta="center" mt="lg" size="sm" c="dimmed">
                            Use the Portal App to scan this QR code and securely log in to your account.
                        </Text>
                    </Card>
                </Flex>
            </Container>

            <Modal
                opened={declinedOpened}
                onClose={closeDeclined}
                title="Login Declined"
                centered
            >
                <Stack>
                    <Text>The login request was declined. Please try again.</Text>
                    <Button onClick={closeDeclined} fullWidth>
                        Close
                    </Button>
                </Stack>
            </Modal>
        </>
    )
}
