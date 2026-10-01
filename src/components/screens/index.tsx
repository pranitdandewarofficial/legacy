// @ts-nocheck
// All Screens - Home, Wallet, Deposit, Withdraw, Profile, etc.
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppState } from '../../store/types';
import { getCurrentUser, getCurrentWallet, updateBalance, addTransaction } from '../../store';
import { playSound, formatCurrency, formatTime, formatDate, validateUPI } from '../../utils';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

// ============ Splash Screen ============
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(100, p + 5)), 100);
    const timer = setTimeout(onDone, 2500);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.15) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-4 bg-gradient-to-b from-[#FFE58F] to-[#D4A017] rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-[#FFC93D]/30 animate-float">👑</div>
        <h1 className="font-logo text-4xl font-black text-gold-gradient">LEGACY WIN</h1>
        <p className="text-[11px] text-[#FFC93D] tracking-[4px] mt-2 uppercase">Play • Win • Enjoy</p>
        <div className="w-48 h-1.5 bg-[#2A2A2A] rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FFE58F] to-[#FFC93D] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-3">{progress < 30 ? 'Initializing...' : progress < 60 ? 'Loading...' : progress < 90 ? 'Connecting...' : 'Ready!'}</p>
      </div>
    </div>
  );
}

// ============ Onboarding ============
export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { icon: '🎴', title: 'Play Exciting Games', desc: '5+ thrilling games with real rewards', features: ['Slots, Plane, Mines & more', 'Real-time outcomes', 'Fair play guaranteed'] },
    { icon: '⚡', title: 'Instant Withdrawals', desc: 'Get your winnings fast', features: ['UPI & USDT support', 'Min ₹110 withdrawal', '10-30 min processing'] },
    { icon: '🛡️', title: 'Safe & Secure', desc: 'Your data is protected', features: ['Encrypted transactions', 'Fair gaming certified', '24/7 support'] },
  ];
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#1a0a2e] flex flex-col animate-fade-in">
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
            <div key={i} className="flex items-center gap-2"><span className="text-[#22C55E] text-lg">✓</span><span className="text-sm text-gray-300">{f}</span></div>
          ))}
        </div>
      </div>
      <div className="p-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map(i => <div key={i} className={`h-2 rounded-full transition-all ${i === slide ? 'bg-[#FFC93D] w-6' : 'bg-[#3A3A3A] w-2'}`} />)}
        </div>
        <button onClick={() => slide < 2 ? setSlide(slide + 1) : onComplete()} className="btn-gold w-full">{slide < 2 ? 'Next' : 'Get Started'}</button>
      </div>
    </div>
  );
}

// ============ Home Screen ============
export function HomeScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 5000) + 8000);
  const games = [
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '✈️', name: 'Aviator Plane', badge: '🔥', color: 'from-blue-600 to-blue-900' },
    { id: 'mines', icon: '💎', name: 'Diamond Mines', badge: 'TOP', color: 'from-emerald-600 to-emerald-900' },
    { id: 'dice', icon: '🎲', name: 'Lucky Dice', badge: '', color: 'from-amber-600 to-amber-900' },
    { id: 'wheel', icon: '🎡', name: 'Lucky Wheel', badge: '🎁', color: 'from-pink-600 to-pink-900' },
  ];
  const winners = [
    { name: 'Raj***', amount: 15000, game: 'Slots' }, { name: 'Pri***', amount: 85000, game: 'Plane' },
    { name: 'Amit***', amount: 25000, game: 'Mines' }, { name: 'San***', amount: 50000, game: 'Wheel' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      {/* Sticky Header with Logo */}
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <span className="font-logo text-lg font-black text-gold-gradient">LEGACY WIN</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg active:scale-95 transition-transform">
          🔔
        </button>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Prominent Wallet Card at Top */}
        <div className="bg-gradient-to-br from-[#1a0a2e] via-[#2a1a4e] to-[#1a0a2e] rounded-3xl p-6 border-2 border-[#FFC93D]/30 shadow-2xl shadow-purple-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC93D]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-purple-300 uppercase tracking-wider">Welcome back,</p>
                <p className="text-xl font-black text-white mt-1">{user?.name || 'Player'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC93D] to-[#D4A017] flex items-center justify-center text-2xl shadow-lg shadow-[#FFC93D]/30">
                👤
              </div>
            </div>
            
            <div className="bg-black/30 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">💰 Wallet Balance</p>
              <p className="text-4xl font-black font-mono-game text-[#FFC93D] mb-4">
                {formatCurrency(wallet?.balance || 0)}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('deposit')}
                  className="flex-1 btn-gold py-3 text-sm font-bold active:scale-95 transition-transform"
                >
                  💳 Deposit
                </button>
                <button 
                  onClick={() => navigate('withdraw')}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 text-sm font-bold text-white active:scale-95 transition-all"
                >
                  💸 Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🎁', label: 'Bonus', action: () => navigate('bonus') },
            { icon: '📊', label: 'History', action: () => navigate('history') },
            { icon: '👥', label: 'Invite', action: () => navigate('invite') },
            { icon: '⭐', label: 'VIP', action: () => navigate('vip') },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action}
              className="flex flex-col items-center gap-2 p-3 bg-[#141414] border border-[#2A2A2A] rounded-2xl active:scale-95 transition-transform hover:border-[#FFC93D]/50"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Live Players Ticker */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-purple-700/20">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-dot-pulse" />
          <span className="text-xs text-purple-200 font-semibold">{onlineCount.toLocaleString()} players online</span>
          <span className="text-[10px] text-purple-300 ml-auto bg-red-500/20 px-2 py-0.5 rounded-full">🔴 LIVE</span>
        </div>
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">🔥 Popular Games</h3>
          <div className="grid grid-cols-3 gap-3">
            {games.map(g => (
              <button key={g.id} onClick={() => navigate(g.id)} className={`relative bg-gradient-to-b ${g.color} rounded-2xl p-3 aspect-[3/4] flex flex-col items-center justify-center active:scale-95 transition-transform overflow-hidden shadow-lg`}>
                {g.badge && <span className="absolute top-2 left-2 bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">{g.badge}</span>}
                <span className="text-4xl mb-2">{g.icon}</span>
                <span className="text-[11px] font-bold text-white text-center">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-dot-pulse" /> Recent Winners
          </h3>
          <div className="space-y-2">
            {winners.map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center text-sm">👤</div>
                  <div><p className="text-xs font-bold text-white">{w.name}</p><p className="text-[10px] text-gray-500">won in {w.game}</p></div>
                </div>
                <span className="text-sm font-bold text-[#22C55E] font-mono-game">+{formatCurrency(w.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Wallet Screen ============
export function WalletScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
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
            <button onClick={() => navigate('deposit')} className="flex-1 btn-gold text-xs py-3">💰 Deposit</button>
            <button onClick={() => navigate('withdraw')} className="flex-1 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-xs py-3 active:scale-95 transition-transform">💸 Withdraw</button>
          </div>
        </div>
        <div className="card">{menu.map((item, i) => (
          <button key={i} onClick={item.action} className="flex items-center justify-between w-full py-3.5 border-b border-[#2A2A2A] last:border-0">
            <div className="flex items-center gap-3"><span className="text-lg">{item.icon}</span><span className="text-sm font-semibold text-white">{item.label}</span></div>
            <span className="text-gray-500">→</span>
          </button>
        ))}</div>
      </div>
    </div>
  );
}

// ============ Withdraw Screen (IMPROVED) ============
export function WithdrawScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [step, setStep] = useState<'amount' | 'details' | 'confirm' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [withdrawId, setWithdrawId] = useState('');
  const chips = [200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const amt = parseInt(amount) || 0;

  const handleAmountContinue = () => {
    setError('');
    if (amt < state.settings.minWithdraw) { setError(`Minimum withdrawal is ₹${state.settings.minWithdraw}`); playSound('loss'); return; }
    if (amt > (wallet?.balance || 0)) { setError('Insufficient balance'); playSound('loss'); return; }
    if (amt > state.settings.maxWithdraw) { setError(`Maximum withdrawal is ₹${state.settings.maxWithdraw.toLocaleString()}`); playSound('loss'); return; }
    playSound('click');
    setStep('details');
  };

  const handleDetailsContinue = () => {
    setError('');
    if (method === 'upi') {
      if (!validateUPI(upiId)) { setError('Enter valid UPI ID (e.g., name@upi)'); playSound('loss'); return; }
      if (!holderName.trim()) { setError('Enter account holder name'); playSound('loss'); return; }
    } else {
      if (!bankName.trim()) { setError('Enter bank name'); playSound('loss'); return; }
      if (accountNumber.length < 9) { setError('Enter valid account number'); playSound('loss'); return; }
      if (ifscCode.length < 8) { setError('Enter valid IFSC code'); playSound('loss'); return; }
      if (!holderName.trim()) { setError('Enter account holder name'); playSound('loss'); return; }
    }
    playSound('click');
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (pin.length !== 4) { setError('Enter 4-digit withdrawal PIN'); playSound('loss'); return; }
    playSound('click');
    const wId = 'WD' + Date.now().toString().slice(-8);
    setWithdrawId(wId);
    setState((prev: AppState) => {
      let ns = updateBalance(prev, prev.session!, -amt);
      ns = addTransaction(ns, { uid: prev.session!, type: 'withdraw', amount: -amt, description: `Withdraw to ${method === 'upi' ? upiId : accountNumber}`, status: 'pending' });
      ns = { ...ns, withdrawals: [...ns.withdrawals, { id: wId, uid: prev.session!, amount: amt, upiId: method === 'upi' ? upiId : accountNumber, holderName, bankName, accountNumber, ifscCode, status: 'pending' as const, createdAt: Date.now() }] };
      return ns;
    });
    playSound('cashout');
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center animate-bounce-in">
          <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center"><span className="text-3xl text-white">✓</span></div>
        </div>
        <h2 className="text-2xl font-black text-white mt-6">Withdrawal Requested!</h2>
        <p className="text-3xl font-black font-mono-game text-[#22C55E] mt-3">{formatCurrency(amt)}</p>
        <p className="text-sm text-gray-400 mt-1">will be credited soon</p>
        <div className="w-full max-w-xs bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 mt-6 space-y-2">
          <div className="flex justify-between"><span className="text-xs text-gray-500">Request ID</span><span className="text-xs text-white font-mono-game">{withdrawId}</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">Method</span><span className="text-xs text-white">{method === 'upi' ? 'UPI' : 'Bank Transfer'}</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">To</span><span className="text-xs text-white">{method === 'upi' ? upiId : accountNumber}</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span><span className="text-xs text-amber-400 font-bold">⏳ Processing</span></div>
          <div className="flex justify-between"><span className="text-xs text-gray-500">Expected Time</span><span className="text-xs text-white">10-30 min</span></div>
        </div>
        <button onClick={() => navigate('home')} className="btn-gold w-full max-w-xs mt-6">← Back to Home</button>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => step === 'amount' ? navigate('wallet') : setStep(step === 'details' ? 'amount' : 'details')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Withdraw</h1>
        <div className="ml-auto flex gap-1">
          {['amount', 'details', 'confirm'].map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full ${['amount', 'details', 'confirm'].indexOf(step) >= i ? 'bg-[#FFC93D]' : 'bg-[#2A2A2A]'}`} />
          ))}
        </div>
      </div>
      <div className="px-4 pt-3 space-y-4">
        {error && <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 text-red-400 text-xs animate-shake">{error}</div>}

        {step === 'amount' && (
          <>
            <div className="bg-purple-gradient rounded-2xl p-5 text-center">
              <p className="text-xs text-purple-200">Available Balance</p>
              <p className="text-3xl font-black font-mono-game text-white mt-2">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#FFC93D]">₹</span>
              <input type="number" placeholder="Enter amount (min ₹110)" value={amount} onChange={e => setAmount(e.target.value)} className="input-field pl-12 text-2xl font-mono-game font-bold text-center" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {chips.map(c => (
                <button key={c} onClick={() => setAmount(String(c))} className={`py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${amount === String(c) ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300'}`}>
                  {c >= 1000 ? `₹${c/1000}k` : `₹${c}`}
                </button>
              ))}
            </div>
            <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-3">
              <p className="text-[10px] text-amber-400">⚡ Processing time: 10-30 minutes • Min: ₹110 • Max: ₹1,00,000/day</p>
            </div>
            <button onClick={handleAmountContinue} className="btn-gold w-full">Continue →</button>
          </>
        )}

        {step === 'details' && (
          <>
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs text-gray-400">Withdrawing</span>
              <span className="text-xl font-black font-mono-game text-[#FFC93D]">{formatCurrency(amt)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMethod('upi')} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${method === 'upi' ? 'border-[#FFC93D] bg-[#FFC93D]/10 text-[#FFC93D]' : 'border-[#2A2A2A] text-gray-400'}`}>📱 UPI</button>
              <button onClick={() => setMethod('bank')} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${method === 'bank' ? 'border-[#FFC93D] bg-[#FFC93D]/10 text-[#FFC93D]' : 'border-[#2A2A2A] text-gray-400'}`}>🏦 Bank</button>
            </div>
            {method === 'upi' ? (
              <div className="space-y-3">
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">📱</span><input type="text" placeholder="UPI ID (e.g., name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} className="input-field pl-12" /></div>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">👤</span><input type="text" placeholder="Account Holder Name" value={holderName} onChange={e => setHolderName(e.target.value)} className="input-field pl-12" /></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">🏦</span><input type="text" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} className="input-field pl-12" /></div>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">🔢</span><input type="text" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} className="input-field pl-12" /></div>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">🏛️</span><input type="text" placeholder="IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value.toUpperCase())} className="input-field pl-12" /></div>
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2">👤</span><input type="text" placeholder="Account Holder Name" value={holderName} onChange={e => setHolderName(e.target.value)} className="input-field pl-12" /></div>
              </div>
            )}
            <button onClick={handleDetailsContinue} className="btn-gold w-full">Continue →</button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="bg-[#141414] border-2 border-[#FFC93D]/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase text-center">Confirm Withdrawal</p>
              <div className="text-center"><p className="text-3xl font-black font-mono-game text-[#FFC93D]">{formatCurrency(amt)}</p></div>
              <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
                <div className="flex justify-between"><span className="text-xs text-gray-500">Method</span><span className="text-xs text-white font-bold">{method === 'upi' ? '📱 UPI' : '🏦 Bank Transfer'}</span></div>
                {method === 'upi' ? (
                  <><div className="flex justify-between"><span className="text-xs text-gray-500">UPI ID</span><span className="text-xs text-white">{upiId}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Name</span><span className="text-xs text-white">{holderName}</span></div></>
                ) : (
                  <><div className="flex justify-between"><span className="text-xs text-gray-500">Bank</span><span className="text-xs text-white">{bankName}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">A/C</span><span className="text-xs text-white">****{accountNumber.slice(-4)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">IFSC</span><span className="text-xs text-white">{ifscCode}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Name</span><span className="text-xs text-white">{holderName}</span></div></>
                )}
              </div>
            </div>
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">Enter 4-digit Withdrawal PIN</p>
              <input type="password" placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="input-field text-center text-2xl tracking-[20px] font-mono-game" maxLength={4} />
            </div>
            <button onClick={handleConfirm} className="btn-green w-full py-5 text-lg">✓ Confirm Withdrawal</button>
            <p className="text-[10px] text-gray-500 text-center">By confirming, amount will be deducted from your wallet</p>
          </>
        )}
      </div>
    </div>
  );
}

// ============ Deposit Screen (Imported from existing) ============
export { DepositScreen } from './DepositScreen';

// ============ Other Screens ============
export function HistoryScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const [filter, setFilter] = useState('all');
  const userTxs = state.transactions.filter(t => t.uid === state.session);
  const filtered = filter === 'all' ? userTxs : userTxs.filter(t => t.type === filter);
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('wallet')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Transactions</h1>
      </div>
      <div className="px-4 pt-3">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {['all', 'deposit', 'withdraw', 'bonus'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${filter === f ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.length === 0 ? <div className="text-center py-12 text-gray-500 text-sm">No transactions yet</div> :
          filtered.slice(0, 20).map(tx => (
            <div key={tx.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.amount > 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  {tx.type === 'deposit' ? '💰' : tx.type === 'withdraw' ? '💸' : tx.type === 'bonus' ? '🎁' : '🎮'}
                </div>
                <div><p className="text-sm font-semibold text-white">{tx.description}</p><p className="text-[10px] text-gray-500">{formatDate(tx.createdAt)}</p></div>
              </div>
              <span className={`font-bold font-mono-game text-sm ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BonusScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [code, setCode] = useState('');
  const uid = state.session!;
  const attendance = state.attendance[uid] || { lastClaim: 0, streak: 0 };
  const rewards = [10, 20, 30, 50, 75, 100, 200];
  const today = new Date().toDateString();
  const canClaim = new Date(attendance.lastClaim).toDateString() !== today;
  
  const handleClaim = () => {
    if (!canClaim) return;
    const streak = (attendance.streak + 1) % 7;
    const reward = rewards[streak];
    playSound('win');
    setState((prev: AppState) => {
      let ns = updateBalance(prev, uid, reward);
      ns = addTransaction(ns, { uid, type: 'bonus', amount: reward, description: `Day ${streak + 1} Attendance`, status: 'completed' });
      ns = { ...ns, attendance: { ...ns.attendance, [uid]: { lastClaim: Date.now(), streak } } };
      return ns;
    });
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleRedeem = () => {
    if (code.length < 4) { playSound('loss'); return; }
    const redeemed = state.redeemedCodes[uid] || [];
    if (redeemed.includes(code)) { playSound('loss'); alert('Code already redeemed!'); return; }
    const bonus = 50;
    playSound('win');
    setState((prev: AppState) => {
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
              <div key={i} className={`text-center p-1.5 rounded-lg text-[10px] font-bold ${i < attendance.streak ? 'bg-green-900/30 text-[#22C55E]' : i === attendance.streak && canClaim ? 'bg-[#FFC93D]/30 text-[#FFC93D] animate-pulse-gold' : 'bg-white/10 text-white/40'}`}>
                D{i+1}<br/>₹{r}
              </div>
            ))}
          </div>
          <button onClick={handleClaim} disabled={!canClaim} className={`mt-3 w-full py-3 rounded-xl font-bold text-sm ${canClaim ? 'btn-gold' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
            {canClaim ? '✓ Claim Today' : '✓ Claimed Today'}
          </button>
        </div>
        
        <div className="card space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase">🎫 Redeem Gift Code</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field flex-1" />
            <button onClick={handleRedeem} className="btn-gold px-6">Redeem</button>
          </div>
          <p className="text-[10px] text-gray-500">Get ₹50 bonus on valid codes</p>
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
            <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl">
              <div><p className="text-xs font-bold text-white">Weekly Cashback</p><p className="text-[10px] text-gray-500">5% on losses</p></div>
              <span className="text-[10px] bg-green-900/30 text-[#22C55E] px-2 py-1 rounded-full font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  if (!user) return null;
  const menu = [
    { icon: '⭐', label: 'VIP Level', sub: `Level ${user.vipLevel}`, action: () => navigate('vip') },
    { icon: '🎁', label: 'My Bonuses', action: () => navigate('bonus') },
    { icon: '📊', label: 'Transactions', action: () => navigate('history') },
    { icon: '⚙️', label: 'Settings', action: () => navigate('settings') },
    { icon: '💬', label: 'Support', action: () => navigate('support') },
  ];
  return (
    <div className="pb-24 animate-fade-in">
      <div className="bg-purple-gradient p-6 pt-12 safe-top">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FFE58F] to-[#D4A017] flex items-center justify-center text-2xl border-2 border-[#FFC93D]">👤</div>
          <div><h2 className="text-lg font-bold text-white">{user.name}</h2><p className="text-xs text-purple-200 font-mono-game">UID: {user.uid}</p><p className="text-[10px] text-purple-300">Invite: {user.inviteCode}</p></div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl p-3 flex justify-around">
          <div className="text-center"><p className="text-lg font-bold font-mono-game text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</p><p className="text-[10px] text-purple-200">Balance</p></div>
          <div className="text-center"><p className="text-lg font-bold font-mono-game text-white">{user.totalBets}</p><p className="text-[10px] text-purple-200">Bets</p></div>
          <div className="text-center"><p className="text-lg font-bold font-mono-game text-[#22C55E]">{user.totalWins}</p><p className="text-[10px] text-purple-200">Wins</p></div>
        </div>
      </div>
      <div className="px-4 pt-4 space-y-2">
        <div className="card">{menu.map((item, i) => (
          <button key={i} onClick={item.action} className="flex items-center justify-between w-full py-3.5 border-b border-[#2A2A2A] last:border-0">
            <div className="flex items-center gap-3"><span className="text-lg">{item.icon}</span><div className="text-left"><p className="text-sm font-semibold text-white">{item.label}</p>{item.sub && <p className="text-[10px] text-gray-500">{item.sub}</p>}</div></div>
            <span className="text-gray-500">→</span>
          </button>
        ))}</div>
        <button onClick={() => setState((prev: AppState) => ({ ...prev, session: null }))} className="w-full py-3.5 rounded-xl border border-red-900/50 text-red-400 font-bold text-sm">Logout</button>
      </div>
    </div>
  );
}

export function InviteScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard?.writeText(user?.inviteCode || '');
    playSound('click');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Invite & Earn</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-purple-gradient rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-4xl mb-3 relative z-10">🎁</p>
          <h2 className="text-xl font-black text-white relative z-10">Refer & Earn ₹50</h2>
          <p className="text-sm text-purple-200 mt-2 relative z-10">Share your code and earn for each friend!</p>
          <div className="mt-4 bg-white/10 rounded-xl p-3 relative z-10">
            <p className="text-xs text-purple-200">Your Invite Code</p>
            <p className="text-2xl font-black font-mono-game text-[#FFC93D] mt-1">{user?.inviteCode}</p>
          </div>
          <button onClick={handleCopy} className={`mt-4 w-full ${copied ? 'bg-[#22C55E]' : 'btn-gold'}`}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">How it works</p>
          <div className="space-y-3">
            {[
              { step: 1, text: 'Share your invite code with friends' },
              { step: 2, text: 'Friend registers & deposits ₹100+' },
              { step: 3, text: 'You both get ₹50 bonus instantly!' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">{item.step}</span>
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Share via</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '💬', name: 'WhatsApp' },
              { icon: '📱', name: 'SMS' },
              { icon: '📧', name: 'Email' },
              { icon: '📋', name: 'Copy' },
            ].map((item, i) => (
              <button key={i} onClick={handleCopy} className="flex flex-col items-center gap-1 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl active:scale-95 transition-transform">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] font-bold text-gray-300">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-4">
          <p className="text-xs text-green-400 text-center">
            💡 <b>Pro Tip:</b> Share on social media & earn unlimited bonuses!
          </p>
        </div>
      </div>
    </div>
  );
}

export function ActivityScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const recentBets = state.bets.filter(b => b.uid === state.session).slice(0, 10);
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top"><h1 className="text-lg font-bold">Activity</h1></div>
      <div className="px-4 pt-3 space-y-3">
        {recentBets.length === 0 ? <div className="text-center py-12 text-gray-500 text-sm">No bets yet. Play a game!</div> :
        recentBets.map(bet => (
          <div key={bet.id} className="card flex items-center justify-between">
            <div><p className="text-sm font-bold text-white">{bet.game}</p><p className="text-[10px] text-gray-500">{formatTime(bet.createdAt)}</p></div>
            <div className="text-right"><p className="text-xs text-gray-400">Bet: {formatCurrency(bet.amount)}</p><p className={`text-sm font-bold font-mono-game ${bet.result === 'win' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{bet.result === 'win' ? `+${formatCurrency(bet.payout)}` : `-${formatCurrency(bet.amount)}`}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3"><span className="text-lg">🔊</span><span className="text-sm font-semibold text-white">Sound Effects</span></div>
            <button onClick={() => setState((prev: AppState) => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }))} className={`w-12 h-7 rounded-full transition-all ${state.settings.soundEnabled ? 'bg-purple-600' : 'bg-[#3A3A3A]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-all mx-1 ${state.settings.soundEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
        <div className="card"><button onClick={() => { if (confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); } }} className="w-full py-3 text-red-400 font-bold text-sm">🗑️ Clear All Data</button></div>
      </div>
    </div>
  );
}

export function SupportScreen({ navigate }: { navigate: (s: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How to deposit?', a: 'Go to Wallet > Deposit, enter amount, choose UPI/USDT, and complete payment. Funds credited in 1-5 minutes.' },
    { q: 'Withdrawal time?', a: 'Withdrawals are processed within 10-30 minutes during business hours. UPI is instant.' },
    { q: 'Minimum withdrawal?', a: 'Minimum withdrawal amount is ₹110 via UPI. Maximum is ₹1,00,000 per day.' },
    { q: 'Is it safe?', a: 'Yes! We use encrypted transactions, secure servers, and fair gaming algorithms certified by independent auditors.' },
    { q: 'How to contact support?', a: 'Use live chat for instant help or email support@legacywin.com. Response time: under 5 minutes.' },
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
          <div><p className="text-sm font-bold text-white">Live Chat</p><p className="text-[10px] text-gray-500">Available 24/7 • Avg response: 2 min</p></div>
          <button className="ml-auto btn-gold text-xs py-2 px-4">Chat</button>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="text-3xl">📧</span>
          <div><p className="text-sm font-bold text-white">Email Support</p><p className="text-[10px] text-gray-500">support@legacywin.com</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="text-3xl">📞</span>
          <div><p className="text-sm font-bold text-white">Phone Support</p><p className="text-[10px] text-gray-500">+91 9876543210 (10 AM - 8 PM)</p></div>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">❓ Frequently Asked Questions</p>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[#2A2A2A] last:border-0">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <span className={`text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && <p className="text-xs text-gray-400 pb-3 leading-relaxed">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VipScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
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
        <div className="card">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">All Levels</p>
          {levels.map((l, i) => (
            <div key={i} className={`flex items-center justify-between py-2.5 border-b border-[#2A2A2A] last:border-0 ${i === (user?.vipLevel || 1) - 1 ? 'text-[#FFC93D]' : 'text-gray-400'}`}>
              <span className="text-sm font-bold">{['🥉', '🥈', '🥇', '💎'][i]} {l.name}</span>
              <span className="text-xs font-mono">₹{l.min.toLocaleString()}+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GamesLobby({ navigate }: { navigate: (s: string) => void }) {
  const games = [
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '✈️', name: 'Aviator Plane', badge: '🔥', color: 'from-blue-600 to-blue-900' },
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
      <div className="px-4 pt-3 grid grid-cols-3 gap-3">
        {games.map(g => (
          <button key={g.id} onClick={() => navigate(g.id)} className={`relative bg-gradient-to-b ${g.color} rounded-2xl p-3 aspect-[3/4] flex flex-col items-center justify-center active:scale-95 transition-transform`}>
            {g.badge && <span className="absolute top-2 left-2 bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full">{g.badge}</span>}
            <span className="text-4xl mb-2">{g.icon}</span>
            <span className="text-[11px] font-bold text-white text-center">{g.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminPanel({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [tab, setTab] = useState('dashboard');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(state.adminSession);
  
  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-black text-white mb-2">Admin Panel</h2>
        <p className="text-xs text-gray-500 mb-4">Enter admin password to continue</p>
        <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field w-64 text-center mb-4" />
        <button onClick={() => { if (password === 'admin123') { setAuthenticated(true); setState((prev: AppState) => ({ ...prev, adminSession: true })); } else playSound('loss'); }} className="btn-gold w-64">Enter</button>
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm mt-4">← Back</button>
      </div>
    );
  }
  
  const totalBalance = Object.values(state.wallets).reduce((s, w) => s + w.balance, 0);
  const totalDeposits = state.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalCommission = state.bets.reduce((s, b) => s + b.commission, 0);
  const tabs = ['dashboard', 'users', 'deposits', 'withdrawals', 'games', 'settings'];
  
  return (
    <div className="pb-6 animate-fade-in min-h-screen bg-[#0A0A0A]">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-3"><button onClick={() => navigate('home')} className="text-xl">←</button><h1 className="text-lg font-bold">Admin Panel</h1></div>
        <button onClick={() => { setAuthenticated(false); setState((prev: AppState) => ({ ...prev, adminSession: false })); }} className="text-xs text-red-400 font-bold">Logout</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tab === t ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
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
        {tab === 'users' && <div className="space-y-2">{Object.values(state.users).map(u => (
          <div key={u.uid} className="card flex items-center justify-between">
            <div><p className="text-sm font-bold text-white">{u.name}</p><p className="text-[10px] text-gray-500">UID: {u.uid} • {u.phone}</p></div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono-game text-[#FFC93D]">{formatCurrency(state.wallets[u.uid]?.balance || 0)}</p>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setState((prev: AppState) => updateBalance(prev, u.uid, 500))} className="text-[9px] bg-green-900/30 text-[#22C55E] px-1.5 py-0.5 rounded">+500</button>
                <button onClick={() => setState((prev: AppState) => updateBalance(prev, u.uid, -100))} className="text-[9px] bg-red-900/30 text-[#EF4444] px-1.5 py-0.5 rounded">-100</button>
              </div>
            </div>
          </div>
        ))}</div>}
        {tab === 'deposits' && (
          <div className="space-y-2">
            {state.transactions.filter(t => t.type === 'deposit').slice(0, 20).map(tx => (
              <div key={tx.id} className="card flex items-center justify-between">
                <div><p className="text-sm font-bold text-white">{formatCurrency(tx.amount)}</p><p className="text-[10px] text-gray-500">{tx.description}</p></div>
                <span className="text-[10px] bg-green-900/30 text-[#22C55E] px-2 py-0.5 rounded-full font-bold">{tx.status}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'withdrawals' && <div className="space-y-2">{state.withdrawals.length === 0 ? <p className="text-center text-gray-500 py-8">No withdrawals</p> :
          state.withdrawals.map(w => (
            <div key={w.id} className="card flex items-center justify-between">
              <div><p className="text-sm font-bold text-white">{formatCurrency(w.amount)}</p><p className="text-[10px] text-gray-500">{w.upiId} • {w.holderName}</p></div>
              <div className="flex flex-col gap-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${w.status === 'pending' ? 'bg-amber-900/30 text-amber-400' : w.status === 'approved' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{w.status}</span>
                {w.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => setState((prev: AppState) => ({ ...prev, withdrawals: prev.withdrawals.map(x => x.id === w.id ? { ...x, status: 'approved' } : x) }))} className="text-[9px] bg-green-900/30 text-[#22C55E] px-2 py-0.5 rounded">Approve</button>
                    <button onClick={() => setState((prev: AppState) => { let ns = updateBalance(prev, w.uid, w.amount); ns = { ...ns, withdrawals: ns.withdrawals.map(x => x.id === w.id ? { ...x, status: 'rejected' } : x) }; return ns; })} className="text-[9px] bg-red-900/30 text-[#EF4444] px-2 py-0.5 rounded">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}</div>}
        {tab === 'games' && <div className="space-y-3">
          <div className="card text-center"><p className="text-xs text-gray-400">Total Bets</p><p className="text-2xl font-black font-mono-game text-[#FFC93D]">{state.bets.length}</p></div>
          <div className="card text-center"><p className="text-xs text-gray-400">Total Wagered</p><p className="text-2xl font-black font-mono-game text-[#3B82F6]">{formatCurrency(state.bets.reduce((s, b) => s + b.amount, 0))}</p></div>
          <div className="card text-center"><p className="text-xs text-gray-400">Commission Earned</p><p className="text-2xl font-black font-mono-game text-[#22C55E]">{formatCurrency(totalCommission)}</p></div>
        </div>}
        {tab === 'settings' && (
          <div className="card space-y-3">
            <div className="flex justify-between"><span className="text-xs text-gray-400">Commission Rate</span><span className="text-xs font-bold text-white">{(state.settings.commissionRate * 100).toFixed(0)}%</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Min Deposit</span><span className="text-xs font-bold text-white">₹{state.settings.minDeposit}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Max Deposit</span><span className="text-xs font-bold text-white">₹{state.settings.maxDeposit.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">UPI VPA</span><span className="text-xs font-bold text-[#FFC93D]">{state.settings.upiVpa}</span></div>
            <button onClick={() => { if (confirm('Reset ALL data?')) { localStorage.clear(); window.location.reload(); } }} className="w-full py-3 mt-4 border border-red-900/50 rounded-xl text-red-400 font-bold text-xs">🗑️ Reset All Data</button>
          </div>
        )}
      </div>
    </div>
  );
}
