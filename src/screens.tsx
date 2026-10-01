import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  loadState, saveState, createUser, updateBalance, addTransaction, addBet,
  getCurrentUser, getCurrentWallet, playSound, formatCurrency, formatTime, formatDate,
  type AppState, type User, type Wallet
} from './store';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

// ============ Splash Screen ============
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const statuses = ['Initializing...', 'Loading assets...', 'Connecting...', 'Ready!'];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < statuses.length) setStatus(statuses[i]);
      setProgress(Math.min(100, (i / statuses.length) * 100));
    }, 600);
    const timer = setTimeout(onDone, 2500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl mb-4 animate-float">👑</div>
        <h1 className="font-logo text-4xl font-black text-gold-gradient">LEGACY WIN</h1>
        <p className="text-[11px] text-[#FFC93D] tracking-[4px] mt-2 uppercase">Play • Win • Enjoy</p>
        <div className="w-48 h-1.5 bg-[#2A2A2A] rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FFE58F] to-[#FFC93D] rounded-full transition-all duration-500"
               style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-3">{status}</p>
        <p className="text-[10px] text-gray-600 mt-6">v1.0.0</p>
      </div>
    </div>
  );
}

// ============ Onboarding ============
function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { icon: '🎴', title: 'Play Exciting Games', desc: '5+ thrilling games with real rewards', features: ['Slots, Crash, Mines & more', 'Real-time outcomes', 'Fair play guaranteed'] },
    { icon: '⚡', title: 'Instant Withdrawals', desc: 'Get your winnings fast', features: ['UPI & USDT support', 'Min ₹110 withdrawal', '10-30 min processing'] },
    { icon: '🛡️', title: 'Safe & Secure', desc: 'Your data is protected', features: ['Encrypted transactions', 'Fair gaming certified', '24/7 support'] },
  ];

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-4">
        <button onClick={onComplete} className="text-gray-400 text-sm font-semibold">Skip</button>
        <span className="text-gray-500 text-xs">{slide + 1}/3</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-7xl mb-6 animate-float">{slides[slide].icon}</div>
        <h2 className="text-2xl font-black text-white text-center">{slides[slide].title}</h2>
        <p className="text-sm text-gray-400 mt-2 text-center">{slides[slide].desc}</p>
        <div className="mt-6 space-y-3">
          {slides[slide].features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[#22C55E] text-lg">✓</span>
              <span className="text-sm text-gray-300">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === slide ? 'bg-[#FFC93D] w-6' : 'bg-[#3A3A3A] w-2'}`} />
          ))}
        </div>
        <button onClick={() => slide < 2 ? setSlide(slide + 1) : onComplete()} className="btn-gold w-full">
          {slide < 2 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}

// ============ Auth Screen ============
function AuthScreen({ state, setState }: { state: AppState; setState: SetState }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('991894225');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter valid 10-digit phone'); return; }
    if (password.length < 6) { setError('Password min 6 characters'); return; }
    const user = Object.values(state.users).find(u => u.phone === phone && u.password === password);
    if (!user) { setError('Invalid credentials'); return; }
    playSound('click');
    setState(prev => ({ ...prev, session: user.uid }));
  };

  const handleRegister = () => {
    setError('');
    if (!name.trim()) { setError('Name required'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter valid 10-digit phone'); return; }
    if (password.length < 6) { setError('Password min 6 characters'); return; }
    if (!terms) { setError('Accept terms to continue'); return; }
    if (Object.values(state.users).some(u => u.phone === phone)) { setError('Phone already registered'); return; }
    playSound('fanfare');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setState(prev => createUser(prev, name, phone, password, false));
  };

  const handleGuest = () => {
    playSound('click');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setState(prev => createUser(prev, 'Guest User', '9999999999', 'guest123', true));
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col overflow-y-auto no-scrollbar">
      <div className="p-6 pt-12">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👑</div>
          <h1 className="font-logo text-2xl font-black text-gold-gradient">LEGACY WIN</h1>
        </div>
        <div className="flex bg-[#1A1A1A] rounded-xl p-1 mb-6">
          <button onClick={() => setTab('login')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'login' ? 'bg-[#7C3AED] text-white' : 'text-gray-400'}`}>
            Login
          </button>
          <button onClick={() => setTab('register')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'register' ? 'bg-[#7C3AED] text-white' : 'text-gray-400'}`}>
            Register
          </button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-xs">{error}</div>}

        {tab === 'login' ? (
          <div className="space-y-4">
            <h2 className="text-xl font-black">Welcome Back</h2>
            <p className="text-sm text-gray-400">Login to continue</p>
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
              className="input-field" maxLength={10} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" />
            <button onClick={handleLogin} className="btn-gold w-full">Login</button>
            <button onClick={handleGuest} className="btn-ghost w-full">Continue as Guest</button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-black">Create Account</h2>
            <p className="text-sm text-gray-400">Join & get ₹500 welcome bonus!</p>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input-field" />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
              className="input-field" maxLength={10} />
            <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" />
            <input type="text" placeholder="Invite Code" value={invite} onChange={e => setInvite(e.target.value)} className="input-field" />
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                className="w-4 h-4 accent-purple-600" />
              I am 18+ and accept Terms & Conditions
            </label>
            <button onClick={handleRegister} className="btn-gold w-full">Create Account</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Home Screen ============
function HomeScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 5000) + 8000);

  const categories = [
    { icon: '🔥', name: 'Popular' }, { icon: '🎰', name: 'Slots' },
    { icon: '✈️', name: 'Plane' }, { icon: '🎲', name: 'Dice' },
    { icon: '🎯', name: 'Wheel' }, { icon: '💎', name: 'Mines' },
    { icon: '📡', name: 'Live' }, { icon: '🎮', name: 'All' },
  ];

  const games = [
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '✈️', name: 'Aviator Plane', badge: '🔥HOT', color: 'from-blue-600 to-blue-900' },
    { id: 'mines', icon: '💎', name: 'Diamond Mines', badge: 'TOP', color: 'from-emerald-600 to-emerald-900' },
    { id: 'dice', icon: '🎲', name: 'Lucky Dice', badge: '', color: 'from-amber-600 to-amber-900' },
    { id: 'wheel', icon: '🎡', name: 'Lucky Wheel', badge: '🎁', color: 'from-pink-600 to-pink-900' },
  ];

  const winners = [
    { name: 'Raj***', amount: 15000, game: 'Slots' },
    { name: 'Pri***', amount: 85000, game: 'Plane' },
    { name: 'Amit***', amount: 25000, game: 'Mines' },
    { name: 'San***', amount: 50000, game: 'Wheel' },
    { name: 'Neh***', amount: 12000, game: 'Dice' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-2">
          <span className="text-lg">👑</span>
          <span className="font-logo text-sm font-black text-gold-gradient">LEGACY WIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('wallet')}
            className="bg-[#1A1A1A] border border-[#FFC93D]/30 rounded-full px-3 py-1.5 flex items-center gap-1.5 active:scale-95 transition-transform">
            <span className="text-xs">💰</span>
            <span className="text-xs font-bold text-[#FFC93D] font-mono-game">{formatCurrency(wallet?.balance || 0)}</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm">
            🔔
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-5">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-[#141414] rounded-2xl p-4 border border-purple-700/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC93D]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-xs text-purple-300">Welcome back,</p>
            <p className="text-lg font-black text-white">{user?.name || 'Player'} 👋</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-[#FFC93D]/20 text-[#FFC93D] px-2 py-0.5 rounded-full font-bold">VIP {user?.vipLevel || 1}</span>
              <span className="text-[10px] text-purple-300">Level {user?.vipLevel || 1}</span>
            </div>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-purple-700/20">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-dot-pulse" />
          <span className="text-xs text-purple-200 font-semibold">{onlineCount.toLocaleString()} players online</span>
          <span className="text-[10px] text-purple-300 ml-auto bg-red-500/20 px-2 py-0.5 rounded-full">🔴 LIVE</span>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-4 gap-2.5">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => navigate('games')}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#141414] border border-[#2A2A2A] active:scale-95 transition-transform hover:border-purple-500/50">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] text-gray-400 font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Featured Game - Plane */}
        <div onClick={() => navigate('crash')} className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-5 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 text-6xl animate-float">✈️</div>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">🔥 TRENDING</span>
            <h3 className="text-xl font-black text-white mt-2">Aviator Plane</h3>
            <p className="text-xs text-blue-200 mt-1">Watch the plane fly & cash out before it crashes!</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Max 100x</span>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">Live</span>
            </div>
          </div>
        </div>

        {/* Popular Games */}
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🔥 Popular Games</h3>
          <div className="grid grid-cols-3 gap-3">
            {games.map(g => (
              <button key={g.id} onClick={() => navigate(g.id)}
                className={`relative bg-gradient-to-b ${g.color} rounded-2xl p-3 aspect-[3/4] flex flex-col items-center justify-center active:scale-95 transition-transform overflow-hidden shadow-lg`}>
                {g.badge && (
                  <span className="absolute top-2 left-2 bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                    {g.badge}
                  </span>
                )}
                <span className="text-4xl mb-2">{g.icon}</span>
                <span className="text-[11px] font-bold text-white text-center leading-tight">{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Winning Ticker */}
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-dot-pulse" /> Recent Winners
          </h3>
          <div className="space-y-2">
            {winners.map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center text-sm border border-purple-500/30">👤</div>
                  <div>
                    <p className="text-xs font-bold text-white">{w.name}</p>
                    <p className="text-[10px] text-gray-500">won in {w.game}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#22C55E] font-mono-game">+{formatCurrency(w.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Winners Podium */}
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🏆 Top Winners Today</h3>
          <div className="flex items-end justify-center gap-3">
            {[1, 0, 2].map(idx => {
              const heights = ['h-28', 'h-20', 'h-16'];
              const tops = ['🥇', '🥈', '🥉'];
              const amounts = [25000, 15000, 8500];
              const names = ['Amit***', 'Raj***', 'Pri***'];
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#FFE58F] to-[#D4A017] flex items-center justify-center text-lg mb-1 border-2 border-[#FFC93D] shadow-lg shadow-[#FFC93D]/20">
                    👤
                  </div>
                  <span className="text-xs font-bold text-white">{names[idx]}</span>
                  <span className="text-[10px] text-[#FFC93D] font-mono-game font-bold">{formatCurrency(amounts[idx])}</span>
                  <div className={`${heights[idx]} w-16 mt-2 rounded-t-xl bg-gradient-to-b from-[#FFC93D]/20 to-[#FFC93D]/5 flex items-center justify-center border-t border-x border-[#FFC93D]/20`}>
                    <span className="text-2xl">{tops[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Wallet Screen ============
function WalletScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const menu = [
    { icon: '📊', label: 'Transaction History', action: () => navigate('history') },
    { icon: '🎁', label: 'Bonus & Offers', action: () => navigate('bonus') },
    { icon: '💳', label: 'Payment Methods', action: () => {} },
    { icon: '🎫', label: 'Redeem Coupon', action: () => navigate('bonus') },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Wallet</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-purple-gradient rounded-2xl p-5 text-center">
          <p className="text-xs text-purple-200 uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-black font-mono-game text-white mt-2">{formatCurrency(wallet?.balance || 0)}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => navigate('deposit')} className="flex-1 btn-gold text-xs py-3">Deposit</button>
            <button onClick={() => navigate('withdraw')} className="flex-1 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-xs py-3 active:scale-95 transition-transform">
              Withdraw
            </button>
          </div>
        </div>
        <div className="card">
          {menu.map((item, i) => (
            <button key={i} onClick={item.action}
              className="flex items-center justify-between w-full py-3.5 border-b border-[#2A2A2A] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </div>
              <span className="text-gray-500">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Deposit Screen (Real Flow with Deep Links) ============
function DepositScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'usdt'>('upi');
  const [step, setStep] = useState(1); // 1=amount, 2=method, 3=payment, 4=verifying, 5=success
  const [utr, setUtr] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timer, setTimer] = useState(300); // 5 min
  const [orderId, setOrderId] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const wallet = getCurrentWallet(state);
  const chips = [100, 300, 500, 1000, 2000, 5000, 10000, 25000];
  const timerRef = useRef<number>(0);

  const amt = parseInt(amount) || 0;

  // Generate QR code when entering payment step
  useEffect(() => {
    if (step === 3 && amt > 0) {
      const oid = 'LW' + Date.now().toString().slice(-10);
      setOrderId(oid);
      let data = '';
      if (method === 'upi') {
        // Real UPI URI with all parameters
        data = `upi://pay?pa=${encodeURIComponent(state.settings.upiVpa)}&pn=${encodeURIComponent('Legacy Win')}&am=${amt}&cu=INR&tn=${encodeURIComponent(oid)}&mc=0000`;
      } else {
        data = state.settings.usdtWallet;
      }
      import('qrcode').then(QRCode => {
        QRCode.toDataURL(data, { 
          width: 300, 
          margin: 2, 
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'H'
        })
          .then((url: string) => setQrDataUrl(url))
          .catch(() => setQrDataUrl(''));
      });
    }
  }, [step, method, amt, state.settings.upiVpa, state.settings.usdtWallet]);

  // Timer countdown
  useEffect(() => {
    if (step === 3) {
      setTimer(300);
      timerRef.current = window.setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [step]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    if (amt < state.settings.minDeposit) { 
      playSound('loss');
      alert(`Minimum deposit is ₹${state.settings.minDeposit}`);
      return; 
    }
    if (amt > state.settings.maxDeposit) { 
      playSound('loss');
      alert(`Maximum deposit is ₹${state.settings.maxDeposit.toLocaleString()}`);
      return; 
    }
    playSound('click');
    setStep(2);
  };

  const handleMethodContinue = () => {
    playSound('click');
    setStep(3);
  };

  // Real UPI deep links for all apps with Android Intent fallback
  const openUpiApp = (appId: string) => {
    const upiParams = `pa=${encodeURIComponent(state.settings.upiVpa)}&pn=${encodeURIComponent('Legacy Win')}&am=${amt}&cu=INR&tn=${encodeURIComponent(orderId)}&mc=0000`;
    const upiUri = `upi://pay?${upiParams}`;
    
    // Deep links for different UPI apps
    const deepLinks: Record<string, { scheme: string; package?: string }> = {
      'gpay': { 
        scheme: `tez://upi/pay?${upiParams}`,
        package: 'com.google.android.apps.nbu.paisa.user'
      },
      'phonepe': { 
        scheme: `phonepe://pay?${upiParams}`,
        package: 'com.phonepe.app'
      },
      'paytm': { 
        scheme: `paytmmp://pay?${upiParams}`,
        package: 'net.one97.paytm'
      },
      'bhim': { 
        scheme: `bhim://pay?${upiParams}`,
        package: 'in.org.npci.upiapp'
      },
      'amazon': { 
        scheme: `amazonpay://pay?${upiParams}`,
        package: 'com.amazon.mShop.android.shopping'
      },
      'whatsapp': { 
        scheme: `whatsapp://pay?${upiParams}`,
        package: 'com.whatsapp'
      },
      'default': { scheme: upiUri }
    };

    const app = deepLinks[appId] || deepLinks['default'];
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // For Android: Try intent URL first (more reliable)
    if (isAndroid && app.package) {
      const intentUrl = `intent://pay?${upiParams}#Intent;scheme=${app.scheme.split(':')[0]};package=${app.package};end`;
      
      // Try intent first
      const startTime = Date.now();
      window.location.href = intentUrl;
      
      // Fallback after 1.5s if app didn't open
      setTimeout(() => {
        if (Date.now() - startTime < 2000 && document.hasFocus()) {
          // Try deep link scheme
          window.location.href = app.scheme;
          
          // Final fallback: generic UPI
          setTimeout(() => {
            if (document.hasFocus()) {
              window.location.href = upiUri;
            }
          }, 1500);
        }
      }, 1500);
    } else {
      // For iOS/Desktop: Try scheme directly
      try {
        window.location.href = app.scheme;
        
        // Fallback to generic UPI
        setTimeout(() => {
          if (document.hasFocus()) {
            window.location.href = upiUri;
          }
        }, 2000);
      } catch (e) {
        window.location.href = upiUri;
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      playSound('click');
      alert(`${label} copied to clipboard!`);
    }).catch(() => {
      alert('Failed to copy. Please copy manually.');
    });
  };

  const handleSubmitUtr = () => {
    if (utr.length < 10) { 
      playSound('loss');
      alert('Please enter valid UTR number (minimum 10 digits)');
      return; 
    }
    if (utr.length > 20) {
      playSound('loss');
      alert('UTR number is too long');
      return;
    }
    playSound('click');
    setStep(4);

    // Simulate verification
    setTimeout(() => {
      setState(prev => {
        let ns = updateBalance(prev, prev.session!, amt);
        ns = addTransaction(ns, {
          uid: prev.session!,
          type: 'deposit',
          amount: amt,
          description: `Deposit via ${method.toUpperCase()} • UTR: ${utr}`,
          status: 'completed',
          meta: { utr, orderId, method },
        });
        return ns;
      });
      playSound('fanfare');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setStep(5);
    }, 2000);
  };

  // Step 1: Amount
  if (step === 1) {
    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
          <button onClick={() => navigate('wallet')} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Add Money</h1>
        </div>
        <div className="px-4 pt-3 space-y-4">
          {/* Balance Card */}
          <div className="bg-purple-gradient rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <p className="text-xs text-purple-200 uppercase tracking-wider relative z-10">Current Balance</p>
            <p className="text-3xl font-black font-mono-game text-white mt-2 relative z-10">{formatCurrency(wallet?.balance || 0)}</p>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#FFC93D]">₹</span>
            <input type="number" placeholder="Enter amount" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field pl-12 text-2xl font-mono-game font-bold text-center" />
          </div>

          {/* Quick Amount Chips */}
          <div className="grid grid-cols-4 gap-2">
            {chips.map(c => (
              <button key={c} onClick={() => setAmount(String(c))}
                className={`py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  amount === String(c) 
                    ? 'bg-gradient-to-b from-[#FFE58F] to-[#FFC93D] text-black shadow-lg shadow-[#FFC93D]/30' 
                    : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300'
                }`}>
                {c >= 1000 ? `₹${c/1000}k` : `₹${c}`}
              </button>
            ))}
          </div>

          {/* Bonus Info */}
          {amt >= 500 && (
            <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
              <span className="text-xl">🎁</span>
              <div>
                <p className="text-xs font-bold text-[#22C55E]">Bonus Unlocked!</p>
                <p className="text-[10px] text-green-400/70">Get extra ₹{Math.floor(amt * 0.05)} on this deposit</p>
              </div>
            </div>
          )}

          {/* Continue */}
          <button onClick={handleContinue} className="btn-gold w-full mt-2">
            Continue →
          </button>
          <p className="text-[10px] text-gray-500 text-center">Min ₹100 • Max ₹1,00,000</p>
        </div>
      </div>
    );
  }

  // Step 2: Method Selection
  if (step === 2) {
    const methods = [
      { id: 'upi', icon: '📱', name: 'UPI', desc: 'GPay, PhonePe, Paytm', bonus: '', recommended: true },
      { id: 'usdt', icon: '💰', name: 'USDT (TRC20)', desc: 'Crypto payment', bonus: '+5% Bonus', recommended: false },
    ];
    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
          <button onClick={() => setStep(1)} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Payment Method</h1>
        </div>
        <div className="px-4 pt-3 space-y-4">
          {/* Amount Summary */}
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Amount</p>
              <p className="text-2xl font-black font-mono-game text-white">{formatCurrency(amt)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">To add</p>
              <p className="text-sm font-bold text-[#22C55E]">+{formatCurrency(amt)}</p>
            </div>
          </div>

          {/* Methods */}
          <div className="space-y-3">
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id as 'upi' | 'usdt')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  method === m.id 
                    ? 'border-[#FFC93D] bg-[#FFC93D]/5 shadow-lg shadow-[#FFC93D]/10' 
                    : 'border-[#2A2A2A] bg-[#141414]'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  method === m.id ? 'bg-[#FFC93D]/20' : 'bg-[#1A1A1A]'
                }`}>
                  {m.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{m.name}</p>
                    {m.recommended && (
                      <span className="text-[9px] bg-[#22C55E]/20 text-[#22C55E] px-1.5 py-0.5 rounded-full font-bold">RECOMMENDED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">{m.desc}</p>
                  {m.bonus && <p className="text-[10px] text-[#22C55E] font-bold mt-0.5">{m.bonus}</p>}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  method === m.id ? 'border-[#FFC93D]' : 'border-[#3A3A3A]'
                }`}>
                  {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#FFC93D]" />}
                </div>
              </button>
            ))}
          </div>

          <button onClick={handleMethodContinue} className="btn-gold w-full mt-4">
            Proceed to Pay →
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Payment (QR / UPI Apps with Real Deep Links)
  if (step === 3) {
    const upiApps = [
      { id: 'gpay', name: 'Google Pay', icon: '🟢', color: 'from-green-500 to-green-700' },
      { id: 'phonepe', name: 'PhonePe', icon: '💜', color: 'from-purple-500 to-purple-700' },
      { id: 'paytm', name: 'Paytm', icon: '💙', color: 'from-blue-500 to-blue-700' },
      { id: 'bhim', name: 'BHIM', icon: '🟠', color: 'from-orange-500 to-orange-700' },
      { id: 'amazon', name: 'Amazon Pay', icon: '🛒', color: 'from-yellow-500 to-yellow-700' },
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'from-green-400 to-green-600' },
      { id: 'default', name: 'Any UPI App', icon: '📱', color: 'from-gray-500 to-gray-700' },
    ];

    const timerProgress = (timer / 300) * 100;
    const isTimerExpired = timer === 0;

    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1a1a2e]">
        {/* Header with Timer */}
        <div className="sticky top-0 z-30 glass px-4 py-3 safe-top border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(2)} className="text-2xl active:scale-90 transition-transform">←</button>
              <h1 className="text-lg font-black bg-gradient-to-r from-[#FFE58F] to-[#FFC93D] bg-clip-text text-transparent">
                Pay via {method === 'upi' ? 'UPI' : 'USDT'}
              </h1>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono-game flex items-center gap-1 ${
              timer > 60 ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' : 
              timer > 0 ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 animate-pulse' :
              'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
            }`}>
              <span>⏱</span>
              <span>{formatTimer(timer)}</span>
            </div>
          </div>
          {/* Timer Progress Bar */}
          <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                timer > 60 ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A]' :
                timer > 0 ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' :
                'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
              }`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Order Info Card */}
          <div className="bg-gradient-to-r from-[#141414] to-[#1a1a2e] border-2 border-[#FFC93D]/30 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Order ID</p>
                <p className="text-xs text-gray-300 font-mono-game mt-0.5">{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-black font-mono-game text-[#FFC93D] mt-0.5">{formatCurrency(amt)}</p>
              </div>
            </div>
            {isTimerExpired && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 mt-2">
                <p className="text-xs text-[#EF4444] font-bold text-center">⚠️ QR Expired! Please go back and retry.</p>
              </div>
            )}
          </div>

          {method === 'upi' ? (
            <>
              {/* QR Code Section */}
              <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-2 border-[#2A2A2A] rounded-3xl p-6 text-center shadow-2xl">
                <p className="text-sm text-gray-400 mb-4 font-bold">📱 Scan QR Code to Pay</p>
                <div className="inline-block p-4 bg-white rounded-3xl shadow-xl shadow-[#FFC93D]/20 border-4 border-[#FFC93D]/30">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="UPI QR" className="w-64 h-64" />
                  ) : (
                    <div className="w-64 h-64 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#FFC93D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Generating QR...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* UPI ID with Copy */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-[#2A2A2A]">
                    <p className="text-[10px] text-gray-500 uppercase">UPI ID</p>
                    <code className="text-sm text-[#FFC93D] font-mono-game font-bold">{state.settings.upiVpa}</code>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(state.settings.upiVpa, 'UPI ID')}
                    className="px-4 py-3 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform shadow-lg shadow-purple-500/30">
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* UPI Apps Grid */}
              <div className="bg-[#141414] border-2 border-[#2A2A2A] rounded-3xl p-5 shadow-xl">
                <p className="text-sm font-black text-gray-300 uppercase mb-4 text-center">⚡ Quick Pay via App</p>
                <div className="grid grid-cols-3 gap-3">
                  {upiApps.map((app) => (
                    <button 
                      key={app.id} 
                      onClick={() => openUpiApp(app.id)}
                      disabled={isTimerExpired}
                      className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-b ${app.color} rounded-2xl active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <span className="text-3xl">{app.icon}</span>
                      <span className="text-[11px] font-bold text-white text-center leading-tight">{app.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-3">Tap to open app with payment details</p>
              </div>

              {/* Instructions Overlay Button */}
              <button 
                onClick={() => setShowTerms(true)}
                className="w-full bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-2 border-amber-700/50 rounded-2xl p-4 text-left active:scale-98 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="text-xs font-bold text-amber-400">View Instructions</p>
                      <p className="text-[10px] text-amber-300/70">Step-by-step payment guide</p>
                    </div>
                  </div>
                  <span className="text-amber-400">→</span>
                </div>
              </button>

              {/* UTR Input Section */}
              <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-2 border-[#2A2A2A] rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔢</span>
                  <p className="text-sm font-black text-gray-300 uppercase">Enter UTR / Reference Number</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter 12-digit UTR number" 
                  value={utr}
                  onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 20))}
                  className="input-field text-center font-mono-game text-xl tracking-widest border-2 focus:border-[#FFC93D]"
                  maxLength={20}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">
                    {utr.length > 0 ? (
                      <span className={utr.length >= 10 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}>
                        ✓ {utr.length} digits entered
                      </span>
                    ) : (
                      'Find UTR in your payment app after payment'
                    )}
                  </p>
                  {utr.length > 0 && utr.length < 10 && (
                    <p className="text-[10px] text-[#EF4444]">Minimum 10 digits required</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmitUtr} 
                disabled={utr.length < 10 || isTimerExpired}
                className={`w-full py-5 rounded-2xl font-black text-base uppercase shadow-xl transition-all ${
                  utr.length >= 10 && !isTimerExpired 
                    ? 'btn-green hover:scale-105 active:scale-95' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}>
                {isTimerExpired ? '⚠️ QR Expired' : utr.length < 10 ? `Enter UTR (${10 - utr.length} more digits)` : '✓ Submit & Confirm Payment'}
              </button>
            </>
          ) : (
            <>
              {/* USDT Payment */}
              <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-2 border-[#2A2A2A] rounded-3xl p-6 text-center shadow-2xl">
                <p className="text-sm text-gray-400 mb-4 font-bold">💰 Send USDT (TRC20) to this address</p>
                <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border-4 border-[#FFC93D]/30">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="USDT QR" className="w-56 h-56" />
                  ) : (
                    <div className="w-56 h-56 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#FFC93D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Generating QR...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A]">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Wallet Address</p>
                  <code className="text-[11px] text-[#FFC93D] font-mono-game break-all">
                    {state.settings.usdtWallet}
                  </code>
                </div>
                
                <button 
                  onClick={() => copyToClipboard(state.settings.usdtWallet, 'Wallet Address')}
                  className="mt-3 px-6 py-2.5 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform shadow-lg shadow-purple-500/30">
                  📋 Copy Address
                </button>
              </div>

              {/* Bonus Card */}
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-[#22C55E]/50 rounded-3xl p-5 text-center shadow-xl">
                <p className="text-3xl font-black text-[#22C55E]">+5% BONUS</p>
                <p className="text-sm text-green-400/80 mt-2">You'll receive {formatCurrency(amt + amt * 0.05)}</p>
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border-2 border-[#EF4444]/50 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm font-black text-[#EF4444]">IMPORTANT</p>
                </div>
                <ul className="text-xs text-red-200/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-0.5">•</span>
                    <span>Send only via <b className="text-[#EF4444]">TRC20 (TRON)</b> network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-0.5">•</span>
                    <span>Send <b className="text-[#EF4444]">exact amount</b> in USDT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-0.5">•</span>
                    <span>Other networks = <b className="text-[#EF4444]">permanent loss of funds</b></span>
                  </li>
                </ul>
              </div>

              {/* Transaction Hash Input */}
              <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-2 border-[#2A2A2A] rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔗</span>
                  <p className="text-sm font-black text-gray-300 uppercase">Enter Transaction Hash</p>
                </div>
                <input 
                  type="text" 
                  placeholder="TX Hash (40+ characters)" 
                  value={utr}
                  onChange={e => setUtr(e.target.value)}
                  className="input-field text-center font-mono-game text-xs"
                />
                <p className="text-[10px] text-gray-500 text-center">
                  {utr.length > 0 ? `${utr.length} characters entered` : 'Find TX Hash in your wallet after sending'}
                </p>
              </div>

              <button 
                onClick={handleSubmitUtr} 
                disabled={utr.length < 10 || isTimerExpired}
                className={`w-full py-5 rounded-2xl font-black text-base uppercase shadow-xl transition-all ${
                  utr.length >= 10 && !isTimerExpired 
                    ? 'btn-green hover:scale-105 active:scale-95' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}>
                {isTimerExpired ? '⚠️ Expired' : utr.length < 10 ? 'Enter Transaction Hash' : '✓ Submit Transaction'}
              </button>
            </>
          )}

          {/* Terms & Conditions */}
          <div className="bg-[#141414]/50 border border-[#2A2A2A] rounded-2xl p-4 mt-6">
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              By proceeding, you agree to our{' '}
              <button onClick={() => setShowTerms(true)} className="text-[#FFC93D] underline">
                Terms & Conditions
              </button>
              {' '}and{' '}
              <button onClick={() => setShowTerms(true)} className="text-[#FFC93D] underline">
                Privacy Policy
              </button>
              . Payments are processed securely. Contact support for any issues.
            </p>
          </div>
        </div>

        {/* Instructions Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center animate-fade-in" onClick={() => setShowTerms(false)}>
            <div className="bg-gradient-to-b from-[#141414] to-[#0A0A0A] rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto border-t-2 border-[#FFC93D]/30" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#141414] p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <h2 className="text-lg font-black text-white">📋 Instructions & Terms</h2>
                <button onClick={() => setShowTerms(false)} className="text-2xl text-gray-400 active:scale-90">✕</button>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Payment Instructions */}
                <div>
                  <h3 className="text-sm font-black text-[#FFC93D] uppercase mb-3">💳 Payment Instructions</h3>
                  <ol className="text-xs text-gray-300 space-y-3">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FFC93D]/20 text-[#FFC93D] flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Open any UPI app (GPay, PhonePe, Paytm, etc.) or scan the QR code shown above</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FFC93D]/20 text-[#FFC93D] flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Pay exactly <b className="text-[#FFC93D]">{formatCurrency(amt)}</b> to the UPI ID shown</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FFC93D]/20 text-[#FFC93D] flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>After successful payment, copy the <b className="text-[#FFC93D]">12-digit UTR/Reference number</b> from your payment app</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FFC93D]/20 text-[#FFC93D] flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                      <span>Paste the UTR number in the field above and click "Submit & Confirm Payment"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#FFC93D]/20 text-[#FFC93D] flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                      <span>Your amount will be credited to your wallet within <b className="text-[#22C55E]">1-5 minutes</b></span>
                    </li>
                  </ol>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-amber-400 uppercase mb-2">⚠️ Important Notes</h3>
                  <ul className="text-xs text-amber-200/80 space-y-2">
                    <li>• QR code expires in <b>5 minutes</b>. Generate new if expired.</li>
                    <li>• Pay exact amount. Partial payments won't be credited.</li>
                    <li>• Keep the UTR/Reference number safe for tracking.</li>
                    <li>• If payment fails, amount will be refunded to your bank.</li>
                  </ul>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <h3 className="text-sm font-black text-gray-300 uppercase mb-3">📜 Terms & Conditions</h3>
                  <div className="text-[11px] text-gray-400 space-y-2 leading-relaxed">
                    <p>1. <b className="text-gray-300">Payment Processing:</b> All deposits are processed automatically. In case of delay, contact support with your Order ID.</p>
                    <p>2. <b className="text-gray-300">Minimum Deposit:</b> ₹{state.settings.minDeposit}. Maximum: ₹{state.settings.maxDeposit.toLocaleString()} per transaction.</p>
                    <p>3. <b className="text-gray-300">Refunds:</b> Failed transactions are refunded within 24-48 hours to the source account.</p>
                    <p>4. <b className="text-gray-300">Security:</b> All transactions are encrypted and secure. We never store your payment details.</p>
                    <p>5. <b className="text-gray-300">Age Restriction:</b> You must be 18+ years old to use this platform.</p>
                    <p>6. <b className="text-gray-300">Responsible Gaming:</b> Play responsibly. Set deposit limits if needed.</p>
                    <p>7. <b className="text-gray-300">Disputes:</b> For any payment issues, contact support within 24 hours with screenshot and UTR.</p>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A]">
                  <p className="text-xs text-gray-400 text-center">
                    Need help? Contact us at{' '}
                    <span className="text-[#FFC93D] font-bold">support@legacywin.com</span>
                    {' '}or use live chat
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-[#141414] p-4 border-t border-[#2A2A2A]">
                <button onClick={() => setShowTerms(false)} className="btn-gold w-full">
                  ✓ I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 4: Verifying
  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#2A2A2A] border-t-[#FFC93D] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💳</span>
          </div>
        </div>
        <h2 className="text-xl font-black text-white mt-6">Verifying Payment</h2>
        <p className="text-sm text-gray-400 mt-2">Please wait...</p>
        <div className="mt-6 w-64 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[#22C55E]">✓</span>
            <span className="text-sm text-gray-300">Payment submitted</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#FFC93D] animate-pulse">⟳</span>
            <span className="text-sm text-gray-300">Verifying with bank</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">○</span>
            <span className="text-sm text-gray-500">Credit to wallet</span>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Success
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center animate-bounce-in">
        <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center">
          <span className="text-3xl">✓</span>
        </div>
      </div>
      <h2 className="text-2xl font-black text-white mt-6">Payment Successful!</h2>
      <p className="text-4xl font-black font-mono-game text-[#22C55E] mt-3">{formatCurrency(amt)}</p>
      <p className="text-sm text-gray-400 mt-1">credited to your wallet</p>

      <div className="w-full max-w-xs bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 mt-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Transaction ID</span>
          <span className="text-xs text-white font-mono-game">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Method</span>
          <span className="text-xs text-white">{method.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs text-[#22C55E] font-bold">✓ Completed</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Time</span>
          <span className="text-xs text-white">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <button onClick={() => navigate('home')} className="btn-gold w-full max-w-xs mt-6">
        ← Back to Home
      </button>
    </div>
  );
}

// ============ Withdraw Screen ============
function WithdrawScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const wallet = getCurrentWallet(state);
  const chips = [200, 500, 1000, 2000, 5000, 10000];

  const handleWithdraw = () => {
    const amt = parseInt(amount);
    if (amt < state.settings.minWithdraw) { playSound('loss'); return; }
    if (amt > (wallet?.balance || 0)) { playSound('loss'); return; }
    if (!upiId || !name) { playSound('loss'); return; }
    if (pin.length !== 4) { playSound('loss'); return; }

    playSound('click');
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, -amt);
      ns = addTransaction(ns, {
        uid: prev.session!,
        type: 'withdraw',
        amount: -amt,
        description: `Withdraw to ${upiId}`,
        status: 'pending',
      });
      ns = {
        ...ns,
        withdrawals: [...ns.withdrawals, {
          id: Date.now().toString(),
          uid: prev.session!,
          amount: amt,
          upiId,
          holderName: name,
          status: 'pending' as const,
          createdAt: Date.now(),
        }],
      };
      return ns;
    });
    playSound('cashout');
    navigate('wallet');
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('wallet')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Withdraw</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-purple-gradient rounded-2xl p-4 text-center">
          <p className="text-xs text-purple-200">Available</p>
          <p className="text-2xl font-black font-mono-game text-white">{formatCurrency(wallet?.balance || 0)}</p>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#FFC93D]">₹</span>
          <input type="number" placeholder="Amount (min ₹110)" value={amount}
            onChange={e => setAmount(e.target.value)} className="input-field pl-10 text-xl font-mono-game font-bold" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {chips.map(c => (
            <button key={c} onClick={() => setAmount(String(c))}
              className="py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-xs font-bold text-gray-300 active:scale-95 transition-transform">
              {c >= 1000 ? `₹${c/1000}k` : `₹${c}`}
            </button>
          ))}
        </div>
        <input type="text" placeholder="UPI ID (e.g. name@upi)" value={upiId}
          onChange={e => setUpiId(e.target.value)} className="input-field" />
        <input type="text" placeholder="Account Holder Name" value={name}
          onChange={e => setName(e.target.value)} className="input-field" />
        <input type="password" placeholder="4-digit PIN" value={pin}
          onChange={e => setPin(e.target.value.slice(0, 4))} className="input-field text-center tracking-[12px]" maxLength={4} />
        <button onClick={handleWithdraw} className="btn-red w-full">Withdraw</button>
      </div>
    </div>
  );
}

// ============ Transaction History ============
function HistoryScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const [filter, setFilter] = useState('all');
  const userTxs = state.transactions.filter(t => t.uid === state.session);
  const filtered = filter === 'all' ? userTxs : userTxs.filter(t => t.type === filter);
  const filters = ['all', 'deposit', 'withdraw', 'bonus'];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('wallet')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Transactions</h1>
      </div>
      <div className="px-4 pt-3">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400'
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No transactions yet</div>
          ) : filtered.slice(0, 20).map(tx => (
            <div key={tx.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  tx.amount > 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                }`}>
                  {tx.type === 'deposit' ? '💰' : tx.type === 'withdraw' ? '💸' : tx.type === 'bonus' ? '🎁' : tx.type === 'bet' ? '🎮' : '💎'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tx.description}</p>
                  <p className="text-[10px] text-gray-500">{formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}</p>
                </div>
              </div>
              <span className={`font-bold font-mono-game text-sm ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Bonus Screen ============
function BonusScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [code, setCode] = useState('');
  const uid = state.session!;
  const attendance = state.attendance[uid] || { lastClaim: 0, streak: 0 };
  const rewards = [10, 20, 30, 50, 75, 100, 200];
  const today = new Date().toDateString();
  const lastClaim = new Date(attendance.lastClaim).toDateString();
  const canClaim = lastClaim !== today;

  const handleClaim = () => {
    if (!canClaim) return;
    const streak = (attendance.streak + 1) % 7;
    const reward = rewards[streak];
    playSound('win');
    setState(prev => {
      let ns = updateBalance(prev, uid, reward);
      ns = addTransaction(ns, { uid, type: 'bonus', amount: reward, description: `Day ${streak + 1} Attendance`, status: 'completed' });
      ns = { ...ns, attendance: { ...ns.attendance, [uid]: { lastClaim: Date.now(), streak } } };
      return ns;
    });
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleRedeem = () => {
    if (code.length < 4) return;
    const redeemed = state.redeemedCodes[uid] || [];
    if (redeemed.includes(code)) { playSound('loss'); return; }
    const bonus = 50;
    playSound('win');
    setState(prev => {
      let ns = updateBalance(prev, uid, bonus);
      ns = addTransaction(ns, { uid, type: 'bonus', amount: bonus, description: `Gift Code: ${code}`, status: 'completed' });
      ns = { ...ns, redeemedCodes: { ...ns.redeemedCodes, [uid]: [...redeemed, code] } };
      return ns;
    });
    setCode('');
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('wallet')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Bonus & Offers</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-gold-gradient rounded-2xl p-4 text-center">
          <p className="text-xs font-bold" style={{color: '#6B4A1B'}}>🎁 DAILY ATTENDANCE</p>
          <div className="grid grid-cols-7 gap-1 mt-3">
            {rewards.map((r, i) => (
              <div key={i} className={`text-center p-1.5 rounded-lg text-[10px] font-bold ${
                i < attendance.streak ? 'bg-green-900/30 text-[#22C55E]' :
                i === attendance.streak && canClaim ? 'bg-[#FFC93D]/30 text-[#FFC93D] animate-pulse-gold' :
                'bg-white/10 text-white/40'
              }`}>
                D{i + 1}
                <br />₹{r}
              </div>
            ))}
          </div>
          <button onClick={handleClaim} disabled={!canClaim}
            className={`mt-3 w-full py-3 rounded-xl font-bold text-sm ${
              canClaim ? 'btn-gold' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}>
            {canClaim ? '✓ Claim Today' : '✓ Claimed Today'}
          </button>
        </div>
        <div className="card space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase">🎫 Redeem Gift Code</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter code" value={code}
              onChange={e => setCode(e.target.value.toUpperCase())} className="input-field flex-1" />
            <button onClick={handleRedeem} className="btn-gold px-6">Redeem</button>
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">🔥 Active Offers</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl">
              <div><p className="text-xs font-bold text-white">First Deposit Bonus</p><p className="text-[10px] text-gray-500">100% bonus up to ₹500</p></div>
              <span className="text-[10px] bg-green-900/30 text-[#22C55E] px-2 py-1 rounded-full font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl">
              <div><p className="text-xs font-bold text-white">Refer & Earn</p><p className="text-[10px] text-gray-500">₹50 per referral</p></div>
              <span className="text-[10px] bg-green-900/30 text-[#22C55E] px-2 py-1 rounded-full font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Profile Screen ============
function ProfileScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  if (!user) return null;

  const handleLogout = () => {
    playSound('click');
    setState(prev => ({ ...prev, session: null }));
  };

  const menu = [
    { icon: '⭐', label: 'VIP Level', sub: `Level ${user.vipLevel}`, action: () => navigate('vip') },
    { icon: '🎁', label: 'My Bonuses', sub: 'View rewards', action: () => navigate('bonus') },
    { icon: '📊', label: 'Transaction History', sub: 'All transactions', action: () => navigate('history') },
    { icon: '⚙️', label: 'Settings', sub: 'Sound, language', action: () => navigate('settings') },
    { icon: '💬', label: 'Help & Support', sub: '24/7 support', action: () => navigate('support') },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="bg-purple-gradient p-6 pt-12 safe-top">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FFE58F] to-[#D4A017] flex items-center justify-center text-2xl border-2 border-[#FFC93D]">
            👤
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-purple-200 font-mono-game">UID: {user.uid}</p>
            <p className="text-[10px] text-purple-300">Invite: {user.inviteCode}</p>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl p-3 flex justify-around">
          <div className="text-center">
            <p className="text-lg font-bold font-mono-game text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</p>
            <p className="text-[10px] text-purple-200">Balance</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono-game text-white">{user.totalBets}</p>
            <p className="text-[10px] text-purple-200">Total Bets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono-game text-[#22C55E]">{user.totalWins}</p>
            <p className="text-[10px] text-purple-200">Wins</p>
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 space-y-2">
        <div className="card">
          {menu.map((item, i) => (
            <button key={i} onClick={item.action}
              className="flex items-center justify-between w-full py-3.5 border-b border-[#2A2A2A] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.sub}</p>
                </div>
              </div>
              <span className="text-gray-500">→</span>
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="w-full py-3.5 rounded-xl border border-red-900/50 text-red-400 font-bold text-sm active:scale-95 transition-transform">
          Logout
        </button>
      </div>
    </div>
  );
}

// ============ VIP Screen ============
function VipScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const levels = [
    { name: 'Bronze', min: 0, perks: ['Daily bonus ₹10', 'Basic support'] },
    { name: 'Silver', min: 5000, perks: ['Daily bonus ₹25', 'Priority support', '5% cashback'] },
    { name: 'Gold', min: 20000, perks: ['Daily bonus ₹50', 'VIP support', '10% cashback', 'Exclusive games'] },
    { name: 'Diamond', min: 50000, perks: ['Daily bonus ₹100', 'Personal manager', '15% cashback', 'All perks'] },
  ];
  const currentLevel = levels[Math.min((user?.vipLevel || 1) - 1, 3)];
  const progress = ((user?.commissionPaid || 0) / 5000) * 100;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">VIP Club</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-gold-gradient rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-xl font-black text-white">{currentLevel.name}</p>
          <p className="text-xs mt-1" style={{color: '#6B4A1B'}}>Level {user?.vipLevel || 1}</p>
          <div className="w-full h-2 bg-black/20 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-[10px] mt-1" style={{color: '#6B4A1B'}}>Commission: ₹{user?.commissionPaid?.toFixed(0) || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Benefits</p>
          {currentLevel.perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2 py-2">
              <span className="text-[#22C55E]">✓</span>
              <span className="text-sm text-gray-300">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Settings Screen ============
function SettingsScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const handleClearData = () => {
    if (confirm('Clear all data? This cannot be undone!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔊</span>
              <span className="text-sm font-semibold text-white">Sound Effects</span>
            </div>
            <button onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }))}
              className={`w-12 h-7 rounded-full transition-all ${state.settings.soundEnabled ? 'bg-purple-600' : 'bg-[#3A3A3A]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-all mx-1 ${state.settings.soundEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
        <div className="card">
          <button onClick={handleClearData} className="w-full py-3 text-red-400 font-bold text-sm text-center">
            🗑️ Clear All Data
          </button>
        </div>
        <div className="text-center text-[10px] text-gray-600 mt-8">
          <p>Legacy Win v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

// ============ Support Screen ============
function SupportScreen({ navigate }: { navigate: (s: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How to deposit?', a: 'Go to Wallet > Deposit, enter amount, choose UPI/USDT, and complete payment.' },
    { q: 'Withdrawal time?', a: 'Withdrawals are processed within 10-30 minutes during business hours.' },
    { q: 'Minimum withdrawal?', a: 'Minimum withdrawal amount is ₹110 via UPI.' },
    { q: 'Is it safe?', a: 'Yes! We use encrypted transactions and fair gaming algorithms.' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Support</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="card flex items-center gap-3 p-4">
          <span className="text-3xl">💬</span>
          <div>
            <p className="text-sm font-bold text-white">Live Chat</p>
            <p className="text-[10px] text-gray-500">Available 24/7</p>
          </div>
          <button className="ml-auto btn-gold text-xs py-2 px-4">Chat</button>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="text-3xl">📧</span>
          <div>
            <p className="text-sm font-bold text-white">Email Support</p>
            <p className="text-[10px] text-gray-500">support@legacywin.com</p>
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">FAQ</p>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[#2A2A2A] last:border-0">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <span className={`text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && <p className="text-xs text-gray-400 pb-3">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Games Lobby ============
function GamesLobby({ navigate }: { navigate: (s: string) => void }) {
  const games = [
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '🚀', name: 'Crash Rocket', badge: 'NEW', color: 'from-blue-600 to-blue-900' },
    { id: 'mines', icon: '💎', name: 'Diamond Mines', badge: 'TOP', color: 'from-emerald-600 to-emerald-900' },
    { id: 'dice', icon: '🎲', name: 'Lucky Dice', badge: '', color: 'from-amber-600 to-amber-900' },
    { id: 'wheel', icon: '🎡', name: 'Lucky Wheel', badge: '🎁', color: 'from-pink-600 to-pink-900' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">All Games</h1>
      </div>
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-3">
          {games.map(g => (
            <button key={g.id} onClick={() => navigate(g.id)}
              className={`relative bg-gradient-to-b ${g.color} rounded-2xl p-3 aspect-[3/4] flex flex-col items-center justify-center active:scale-95 transition-transform`}>
              {g.badge && (
                <span className="absolute top-2 left-2 bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">
                  {g.badge}
                </span>
              )}
              <span className="text-4xl mb-2">{g.icon}</span>
              <span className="text-[11px] font-bold text-white text-center">{g.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Invite Screen ============
function InviteScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Invite & Earn</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-purple-gradient rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">🎁</p>
          <h2 className="text-xl font-black text-white">Refer & Earn ₹50</h2>
          <p className="text-sm text-purple-200 mt-2">Share your code and earn for each friend!</p>
          <div className="mt-4 bg-white/10 rounded-xl p-3">
            <p className="text-xs text-purple-200">Your Invite Code</p>
            <p className="text-2xl font-black font-mono-game text-[#FFC93D] mt-1">{user?.inviteCode}</p>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(user?.inviteCode || ''); playSound('click'); }}
            className="btn-gold mt-4 w-full">Copy Code</button>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">How it works</p>
          <div className="space-y-3">
            {[
              'Share your invite code',
              'Friend registers & deposits',
              'You both get ₹50 bonus!'
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-xs font-bold text-purple-300">{i+1}</span>
                <span className="text-sm text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Activity Screen ============
function ActivityScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const recentBets = state.bets.filter(b => b.uid === state.session).slice(0, 10);
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <h1 className="text-lg font-bold">Activity</h1>
      </div>
      <div className="px-4 pt-3 space-y-3">
        {recentBets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No bets yet. Play a game!</div>
        ) : recentBets.map(bet => (
          <div key={bet.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{bet.game}</p>
              <p className="text-[10px] text-gray-500">{formatTime(bet.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Bet: {formatCurrency(bet.amount)}</p>
              <p className={`text-sm font-bold font-mono-game ${bet.result === 'win' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {bet.result === 'win' ? `+${formatCurrency(bet.payout)}` : `-${formatCurrency(bet.amount)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Admin Panel ============
function AdminPanel({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [tab, setTab] = useState('dashboard');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(state.adminSession);

  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-black text-white mb-2">Admin Panel</h2>
        <input type="password" placeholder="Admin Password" value={password}
          onChange={e => setPassword(e.target.value)} className="input-field w-64 text-center mb-4" />
        <button onClick={() => {
          if (password === 'admin123') { setAuthenticated(true); setState(prev => ({ ...prev, adminSession: true })); }
          else playSound('loss');
        }} className="btn-gold w-64">Enter</button>
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm mt-4">← Back</button>
      </div>
    );
  }

  const tabs = ['dashboard', 'users', 'deposits', 'withdrawals', 'games', 'settings'];
  const totalBalance = Object.values(state.wallets).reduce((s, w) => s + w.balance, 0);
  const totalDeposits = state.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalCommission = state.bets.reduce((s, b) => s + b.commission, 0);

  return (
    <div className="pb-6 animate-fade-in min-h-screen bg-[#0A0A0A]">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('home')} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <button onClick={() => { setAuthenticated(false); setState(prev => ({ ...prev, adminSession: false })); }}
          className="text-xs text-red-400 font-bold">Logout</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
              tab === t ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] text-gray-400'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-4 pt-2">
        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-[#FFC93D]">{Object.keys(state.users).length}</p><p className="text-[10px] text-gray-500">Users</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-[#22C55E]">{formatCurrency(totalBalance)}</p><p className="text-[10px] text-gray-500">Total Balance</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-[#3B82F6]">{formatCurrency(totalDeposits)}</p><p className="text-[10px] text-gray-500">Deposits</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-purple-400">{formatCurrency(totalCommission)}</p><p className="text-[10px] text-gray-500">Commission</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-amber-400">{state.bets.length}</p><p className="text-[10px] text-gray-500">Total Bets</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono-game text-pink-400">{state.withdrawals.length}</p><p className="text-[10px] text-gray-500">Withdrawals</p></div>
          </div>
        )}
        {tab === 'users' && (
          <div className="space-y-2">
            {Object.values(state.users).map(u => (
              <div key={u.uid} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{u.name}</p>
                  <p className="text-[10px] text-gray-500">UID: {u.uid} • {u.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono-game text-[#FFC93D]">{formatCurrency(state.wallets[u.uid]?.balance || 0)}</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => setState(prev => updateBalance(prev, u.uid, 500))}
                      className="text-[9px] bg-green-900/30 text-[#22C55E] px-1.5 py-0.5 rounded">+500</button>
                    <button onClick={() => setState(prev => updateBalance(prev, u.uid, -100))}
                      className="text-[9px] bg-red-900/30 text-[#EF4444] px-1.5 py-0.5 rounded">-100</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'withdrawals' && (
          <div className="space-y-2">
            {state.withdrawals.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">No withdrawals</p>
            ) : state.withdrawals.map(w => (
              <div key={w.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{formatCurrency(w.amount)}</p>
                  <p className="text-[10px] text-gray-500">{w.upiId} • {w.holderName}</p>
                  <p className="text-[10px] text-gray-600">{formatTime(w.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold text-center ${
                    w.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                    w.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>{w.status}</span>
                  {w.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setState(prev => ({ ...prev, withdrawals: prev.withdrawals.map(x => x.id === w.id ? { ...x, status: 'approved' as const } : x) }));
                      }} className="text-[9px] bg-green-900/30 text-[#22C55E] px-2 py-0.5 rounded">Approve</button>
                      <button onClick={() => {
                        setState(prev => {
                          let ns = updateBalance(prev, w.uid, w.amount);
                          ns = addTransaction(ns, { uid: w.uid, type: 'withdraw', amount: w.amount, description: 'Withdrawal rejected (refund)', status: 'completed' });
                          ns = { ...ns, withdrawals: ns.withdrawals.map(x => x.id === w.id ? { ...x, status: 'rejected' as const } : x) };
                          return ns;
                        });
                      }} className="text-[9px] bg-red-900/30 text-[#EF4444] px-2 py-0.5 rounded">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'games' && (
          <div className="space-y-3">
            <div className="card text-center">
              <p className="text-xs text-gray-400">Total Bets</p>
              <p className="text-2xl font-black font-mono-game text-[#FFC93D]">{state.bets.length}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-400">Total Wagered</p>
              <p className="text-2xl font-black font-mono-game text-[#3B82F6]">{formatCurrency(state.bets.reduce((s, b) => s + b.amount, 0))}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-gray-400">Commission Earned</p>
              <p className="text-2xl font-black font-mono-game text-[#22C55E]">{formatCurrency(totalCommission)}</p>
            </div>
          </div>
        )}
        {tab === 'settings' && (
          <div className="card space-y-3">
            <div className="flex justify-between"><span className="text-xs text-gray-400">Commission Rate</span><span className="text-xs font-bold text-white">{(state.settings.commissionRate * 100).toFixed(0)}%</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Min Deposit</span><span className="text-xs font-bold text-white">₹{state.settings.minDeposit}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Max Deposit</span><span className="text-xs font-bold text-white">₹{state.settings.maxDeposit.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">UPI VPA</span><span className="text-xs font-bold text-[#FFC93D]">{state.settings.upiVpa}</span></div>
            <button onClick={() => { if (confirm('Reset ALL data?')) { localStorage.clear(); window.location.reload(); } }}
              className="w-full py-3 mt-4 border border-red-900/50 rounded-xl text-red-400 font-bold text-xs">
              🗑️ Reset All Data
            </button>
          </div>
        )}
        {tab === 'deposits' && (
          <div className="space-y-2">
            {state.transactions.filter(t => t.type === 'deposit').slice(0, 20).map(tx => (
              <div key={tx.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{formatCurrency(tx.amount)}</p>
                  <p className="text-[10px] text-gray-500">{tx.description}</p>
                </div>
                <span className="text-[10px] bg-green-900/30 text-[#22C55E] px-2 py-0.5 rounded-full font-bold">{tx.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export {
  SplashScreen, OnboardingScreen, AuthScreen, HomeScreen, WalletScreen,
  DepositScreen, WithdrawScreen, HistoryScreen, BonusScreen, ProfileScreen,
  VipScreen, SettingsScreen, SupportScreen, GamesLobby, InviteScreen,
  ActivityScreen, AdminPanel
};
