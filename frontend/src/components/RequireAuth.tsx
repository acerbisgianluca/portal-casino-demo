'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Center, Loader } from '@mantine/core'
import { useAuth } from '@/contexts/auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return <Center h="100vh"><Loader /></Center>
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
