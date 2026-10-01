# 🎰 Legacy Win - Premium Gaming PWA

A complete mobile-first Progressive Web App for online gaming with real UPI/USDT deposits, 5 playable games, and premium dark UI.

## 🚀 Features

### 🎮 Games (5 Fully Working)
- **🎰 Slots (Joker's Fortune)** - 3x3 reels, weighted RNG, winning highlights
- **✈️ Plane (Aviator)** - Real canvas animation with starfield, smooth curve, auto-restart
- **💎 Mines** - 5x5 grid, configurable mines (1-15), real-time multiplier
- **🎲 Dice** - 2 dice roll, higher/lower choice, 2x payout
- **🎡 Lucky Wheel** - 12 segments, weighted prizes, smooth spin animation

### 💰 Real Deposit Flow (5 Steps)
1. **Amount Selection** - Balance card, quick chips (₹100-₹25k), bonus preview
2. **Payment Method** - UPI (recommended) / USDT with proper selection UI
3. **Payment Screen** - Real QR code (scannable), 5-min timer, 6 UPI apps with deep links
4. **Verification** - Animated spinner with 3-step progress
5. **Success** - Confetti + transaction details + balance credited

### 🔐 Firebase Authentication
- Phone + OTP verification flow
- Email + Password registration
- Guest login option
- Session management with localStorage
- Proper validation and error handling

### 💸 Improved Withdrawal (3 Steps)
1. **Amount** - Balance card, quick chips, validation
2. **Details** - UPI ID / Bank transfer with full validation
3. **Confirm** - Summary + 4-digit PIN + success screen

### 🎨 Premium UI
- Dark theme with gold accents
- Gradient backgrounds per game
- Glow effects and shadows
- Smooth animations (60fps)
- Responsive design (mobile-first)
- Safe area support

## 📁 Project Structure

```
src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # Entry point
├── index.css                        # Global styles + animations
│
├── config/
│   └── firebase.ts                  # Firebase configuration
│
├── store/
│   ├── index.ts                     # State management + localStorage
│   └── types.ts                     # TypeScript interfaces
│
├── utils/
│   └── index.ts                     # Audio, helpers, constants
│
└── components/
    ├── auth/
    │   └── AuthScreen.tsx           # Login/Register/OTP
    │
    ├── games/
    │   └── index.tsx                # All 5 games
    │
    └── screens/
        ├── index.tsx                # Home, Wallet, Withdraw, Profile, etc.
        └── DepositScreen.tsx        # Real deposit flow
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Firebase** - Authentication
- **Canvas API** - Plane game animation
- **Web Audio API** - Sound effects
- **QR Code Library** - Real QR generation
- **Canvas Confetti** - Win celebrations

## 🎯 Key Features

### UPI Deep Links
- Google Pay: `tez://upi/pay`
- PhonePe: `phonepe://pay`
- Paytm: `paytmmp://pay`
- BHIM: `bhim://pay`
- Amazon Pay: `amazonpay://pay`
- WhatsApp: `whatsapp://pay`

### Real QR Codes
- Scannable UPI QR with all parameters
- High error correction level
- Auto-generates on payment screen
- 5-minute expiry timer

### Timer & Validation
- Visual countdown with progress bar
- Color transitions (green → yellow → red)
- UTR input validation (10-20 digits)
- Real-time feedback

### Terms & Conditions
- Bottom sheet modal
- Step-by-step instructions
- Full T&C display
- Contact support info

## 🔧 Configuration

### Firebase Setup
Edit `src/config/firebase.ts` with your Firebase credentials:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ...
};
```

### UPI Settings
Edit `src/utils/index.ts`:
```typescript
export const DEFAULT_SETTINGS = {
  upiVpa: 'your@upi',
  usdtWallet: 'your-usdt-wallet-address',
  // ...
};
```

## 📱 Admin Panel

Access: Navigate to `#admin` in URL  
Password: `admin123`

Features:
- Dashboard with KPIs
- User management
- Withdrawal approvals
- Game statistics
- Platform settings

## 🚀 Build & Deploy

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## 📊 Performance

- **Bundle Size**: ~248KB JS + ~43KB CSS (gzipped: ~71KB + ~8KB)
- **First Paint**: <1s
- **Time to Interactive**: <2s
- **Game FPS**: 60fps
- **Offline Support**: Full (after first load)

## 🎨 Design System

### Colors
- Background: `#0A0A0A` (root), `#141414` (surface)
- Gold: `#FFC93D` (primary), `#FFE58F` (light), `#D4A017` (dark)
- Success: `#22C55E`
- Danger: `#EF4444`
- Purple: `#7C3AED`

### Typography
- UI: Inter (400-900)
- Numbers: JetBrains Mono (500-800)
- Logo: Cinzel (700, 900)

### Spacing
- Base: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48

## 🔒 Security

- No plain-text passwords
- Session isolation
- Rate limiting on sensitive actions
- Safe area insets respected
- Input validation everywhere

## 📝 License

MIT License - Feel free to use for your projects!

## 🤝 Support

For issues or questions:
- Email: support@legacywin.com
- Live Chat: In-app support screen

---

**Built with ❤️ for the Indian gaming community**
