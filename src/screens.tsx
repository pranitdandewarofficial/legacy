import { useState, useEffect, useCallback } from 'react';
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
    { icon: '🚀', name: 'Crash' }, { icon: '🎲', name: 'Dice' },
    { icon: '🎯', name: 'Wheel' }, { icon: '🃏', name: 'Cards' },
    { icon: '📡', name: 'Live' }, { icon: '🎮', name: 'All' },
  ];

  const games = [
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '🚀', name: 'Crash Rocket', badge: 'NEW', color: 'from-blue-600 to-blue-900' },
    { id: 'mines', icon: '💎', name: 'Diamond Mines', badge: 'TOP', color: 'from-emerald-600 to-emerald-900' },
    { id: 'dice', icon: '🎲', name: 'Lucky Dice', badge: '', color: 'from-amber-600 to-amber-900' },
    { id: 'wheel', icon: '🎡', name: 'Lucky Wheel', badge: '🎁', color: 'from-pink-600 to-pink-900' },
  ];

  const winners = [
    { name: 'Raj***', amount: 15000, game: 'Slots' },
    { name: 'Pri***', amount: 8500, game: 'Crash' },
    { name: 'Amit***', amount: 25000, game: 'Mines' },
    { name: 'San***', amount: 5000, game: 'Wheel' },
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
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1.5 flex items-center gap-1">
            <span className="text-xs">💰</span>
            <span className="text-xs font-bold text-[#FFC93D] font-mono-game">{formatCurrency(wallet?.balance || 0)}</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm">
            🔔
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-5">
        {/* Live Ticker */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-dot-pulse" />
          <span className="text-xs text-purple-200 font-semibold">{onlineCount.toLocaleString()} players online</span>
          <span className="text-xs text-purple-300 ml-auto">🔴 LIVE</span>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => navigate('games')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#141414] border border-[#2A2A2A] active:scale-95 transition-transform">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] text-gray-400 font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Popular Games */}
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🔥 Popular Games</h3>
          <div className="grid grid-cols-3 gap-3">
            {games.map(g => (
              <button key={g.id} onClick={() => navigate(g.id)}
                className={`relative bg-gradient-to-b ${g.color} rounded-2xl p-3 aspect-[3/4] flex flex-col items-center justify-center active:scale-95 transition-transform overflow-hidden`}>
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
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-sm">👤</div>
                  <div>
                    <p className="text-xs font-bold text-white">{w.name}</p>
                    <p className="text-[10px] text-gray-500">{w.game}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#22C55E] font-mono-game">+{formatCurrency(w.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Winners Podium */}
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🏆 Top Winners</h3>
          <div className="flex items-end justify-center gap-3">
            {[1, 0, 2].map(idx => {
              const heights = ['h-28', 'h-20', 'h-16'];
              const tops = ['🥇', '🥈', '🥉'];
              const amounts = [25000, 15000, 8500];
              const names = ['Amit***', 'Raj***', 'Pri***'];
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#FFE58F] to-[#D4A017] flex items-center justify-center text-lg mb-1">
                    👤
                  </div>
                  <span className="text-xs font-bold text-white">{names[idx]}</span>
                  <span className="text-[10px] text-[#FFC93D] font-mono-game">{formatCurrency(amounts[idx])}</span>
                  <div className={`${heights[idx]} w-16 mt-2 rounded-t-xl bg-gradient-to-b from-[#FFC93D]/20 to-[#FFC93D]/5 flex items-center justify-center`}>
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

// ============ Deposit Screen ============
function DepositScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'usdt'>('upi');
  const [step, setStep] = useState(1);
  const wallet = getCurrentWallet(state);
  const chips = [100, 300, 500, 1000, 2000, 5000, 10000, 25000];

  const handleDeposit = () => {
    const amt = parseInt(amount);
    if (amt < state.settings.minDeposit || amt > state.settings.maxDeposit) {
      playSound('loss');
      return;
    }
    playSound('click');
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, amt);
      ns = addTransaction(ns, {
        uid: prev.session!,
        type: 'deposit',
        amount: amt,
        description: `Deposit via ${method.toUpperCase()}`,
        status: 'completed',
      });
      return ns;
    });
    playSound('fanfare');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    navigate('home');
  };

  if (step === 1) {
    return (
      <div className="pb-24 animate-fade-in">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
          <button onClick={() => navigate('wallet')} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Add Money</h1>
        </div>
        <div className="px-4 pt-3 space-y-4">
          <div className="bg-purple-gradient rounded-2xl p-4 text-center">
            <p className="text-xs text-purple-200">Current Balance</p>
            <p className="text-2xl font-black font-mono-game text-white">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#FFC93D]">₹</span>
            <input type="number" placeholder="Enter amount" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input-field pl-10 text-2xl font-mono-game font-bold text-center" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {chips.map(c => (
              <button key={c} onClick={() => setAmount(String(c))}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  amount === String(c) ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300'
                }`}>
                {c >= 1000 ? `₹${c/1000}k` : `₹${c}`}
              </button>
            ))}
          </div>
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Payment Method</p>
            <div className="space-y-2">
              <button onClick={() => setMethod('upi')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  method === 'upi' ? 'border-[#FFC93D] bg-[#FFC93D]/5' : 'border-[#2A2A2A]'
                }`}>
                <span className="text-xl">📱</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">UPI</p>
                  <p className="text-[10px] text-gray-500">Instant • GPay, PhonePe, Paytm</p>
                </div>
                {method === 'upi' && <span className="ml-auto text-[#FFC93D]">✓</span>}
              </button>
              <button onClick={() => setMethod('usdt')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  method === 'usdt' ? 'border-[#FFC93D] bg-[#FFC93D]/5' : 'border-[#2A2A2A]'
                }`}>
                <span className="text-xl">💰</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">USDT (TRC20)</p>
                  <p className="text-[10px] text-gray-500">+5% bonus • Crypto</p>
                </div>
                {method === 'usdt' && <span className="ml-auto text-[#FFC93D]">✓</span>}
              </button>
            </div>
          </div>
          <button onClick={() => { if (parseInt(amount) >= 100) setStep(2); else playSound('loss'); }}
            className="btn-gold w-full">Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => setStep(1)} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Payment</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="card text-center">
          <p className="text-xs text-gray-400">Amount to Pay</p>
          <p className="text-3xl font-black font-mono-game text-[#FFC93D] mt-1">{formatCurrency(parseInt(amount) || 0)}</p>
        </div>
        {method === 'upi' ? (
          <div className="card space-y-4">
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl">📱</p>
                    <p className="text-[10px] text-gray-600 mt-1 font-mono-game">{state.settings.upiVpa}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan QR or use UPI ID</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <code className="text-xs bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-[#FFC93D] font-mono-game">{state.settings.upiVpa}</code>
                <button onClick={() => { navigator.clipboard?.writeText(state.settings.upiVpa); playSound('click'); }}
                  className="text-xs text-purple-400">Copy</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['📱 GPay', '💜 PhonePe', '💙 Paytm', '🟠 BHIM', '🟢 Amazon', '📲 More'].map((app, i) => (
                <button key={i} className="py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-[10px] font-bold text-gray-300 active:scale-95 transition-transform">
                  {app}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="card space-y-3">
            <p className="text-xs text-gray-400 text-center">Send USDT (TRC20) to:</p>
            <code className="block text-[10px] bg-[#1A1A1A] p-3 rounded-lg text-[#FFC93D] font-mono-game break-all text-center">
              {state.settings.usdtWallet}
            </code>
            <p className="text-[10px] text-amber-400 text-center">⚠️ Send exact amount • TRC20 network only</p>
            <p className="text-xs text-[#22C55E] text-center font-bold">+5% bonus applied!</p>
          </div>
        )}
        <button onClick={handleDeposit} className="btn-green w-full">
          ✓ I've Paid {formatCurrency(parseInt(amount) || 0)}
        </button>
      </div>
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
