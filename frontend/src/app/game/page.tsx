import { GameProvider } from '@/contexts/game'
import TopBar from '@/components/TopBar'
import RouletteGame from '@/components/RouletteGame'
import RequireAuth from '@/components/RequireAuth'

export default function GamePage() {
    return (
        <RequireAuth>
            <GameProvider>
                <TopBar />
                <RouletteGame />
            </GameProvider>
        </RequireAuth>
    )
}
