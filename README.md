# 🎰 Portal Casino Demo

A full-stack casino application built with Next.js and Express, showcasing Lightning Network payments and Portal SDK integration. Features a real-time roulette game with Cashu token-based chip purchases.

## ✨ Features

- **🔐 Portal Authentication** - Secure login using Portal SDK
- **⚡ Lightning Payments** - Purchase casino chips with Bitcoin Lightning Network
- **🎲 Roulette Game** - Real-time casino roulette with multiple bet types
- **🪙 Cashu Integration** - Chip system powered by Cashu tokens
- **🔄 WebSocket Communication** - Real-time game state and instant updates
- **💰 Balance Management** - Track your chip balance and winnings

## 🎮 How to Play

1. **Login** - Connect using your Portal wallet
2. **Buy Chips** - Purchase casino chips via Lightning Network payment
3. **Place Bets** - Choose from:
   - Number bets (0-36) - 36x payout
   - Red/Black - 2x payout
   - Even/Odd - 2x payout
4. **Spin** - Watch the wheel and see if you win!

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Mantine UI** - Component library for modern UI
- **TypeScript** - Type-safe development
- **Framer Motion** - Smooth animations
- **React WebSocket** - Real-time communication
- **Portal SDK** - Wallet integration

### Backend
- **Express.js 5** - Web server framework
- **Express-WS** - WebSocket support
- **Portal SDK** - Lightning payment integration
- **LowDB** - Lightweight JSON database
- **TypeScript** - Type-safe API development
- **Zod** - Runtime validation

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or higher
- Portal daemon running
- Cashu mint URL
- Portal authentication token

### Environment Setup

#### Backend Configuration

Create `backend/.env`:

```env
PORTAL_DAEMON_WS=ws://localhost:4000
AUTH_TOKEN=your_portal_auth_token
CASHU_URL=https://your-cashu-mint-url
CASHU_TOKEN=your_cashu_token
```

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

#### Start Backend (Port 8000)

```bash
cd backend
npm run dev
```

#### Start Frontend (Port 3000)

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start playing!

## 📁 Project Structure

```
portal-casino-demo/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── app.ts           # Express app setup
│   │   ├── index.ts         # Server entry point
│   │   ├── config/          # Configuration files
│   │   ├── middlewares/     # Auth middleware
│   │   ├── routes/          # API & WebSocket routes
│   │   │   └── ws/          # WebSocket handlers
│   │   │       ├── buy-chips.ts
│   │   │       ├── start-game.ts
│   │   │       └── get-login-url.ts
│   │   └── services/        # Business logic
│   │       ├── portal-deamon.ts
│   │       └── balance.ts
│   └── db.json              # Local database
│
└── frontend/                # Next.js application
    └── src/
        ├── app/             # App Router pages
        │   ├── page.tsx     # Login page
        │   └── game/        # Roulette game page
        ├── components/      # React components
        │   ├── LoginPage/
        │   ├── RouletteGame/
        │   └── TopBar/
        ├── contexts/        # React contexts
        └── hooks/           # Custom React hooks
```

## 🎯 API Reference

### WebSocket Events

#### Client → Server

- `get-login-url` - Request Portal login URL
- `buy-chips` - Purchase casino chips
- `start-game` - Start roulette game with bets

#### Server → Client

- `login-url-response` - Portal login URL
- `buy-chips-response` - Chip purchase confirmation
- `start-game-response` - Game results with outcome
- `error` - Error messages

## 🔧 Development

### Build for Production

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm start
```

### Code Formatting

```bash
# Format backend code
cd backend
npm run prettify:fix
```

## 🎲 Game Mechanics

### Roulette Rules

- **Numbers**: 0-36 (0 is green, 1-36 are red or black)
- **Bet Types**:
  - Straight (Number): Bet on a specific number - 36:1 payout
  - Red/Black: Bet on color - 2:1 payout (0 is green, always loses)
  - Even/Odd: Bet on parity - 2:1 payout (0 always loses)

### Chip System

- Chips are backed by Cashu tokens
- Purchase chips with Lightning Network payments
- Winnings paid out instantly
- Balance tracked in real-time

## 🌟 Portal SDK Integration

This demo showcases several Portal SDK features:

- **Authentication** - Secure user login flow
- **Lightning Payments** - Request and process payments
- **Cashu Operations** - Mint, burn, and transfer tokens
- **JWT Issuance** - Secure user sessions

## 📝 License

ISC

## 🤝 Contributing

This is a demonstration project. Feel free to fork and experiment!

## ⚠️ Disclaimer

This is a demo application for educational purposes. Not intended for real gambling operations. Use responsibly!
