// @ts-nocheck
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Bell, Gift, History, Users, Star, Wallet, CreditCard, ArrowDownLeft, ArrowUpRight, ChevronRight, Settings, HelpCircle, LogOut, Phone, Mail, MessageCircle, Ticket, User, CheckCircle, TrendingUp, Trophy } from 'lucide-react';
import type { AppState } from '../../store/types';
import { getCurrentUser, getCurrentWallet, updateBalance, addTransaction } from '../../store';
import { playSound, formatCurrency, formatTime, formatDate, validateUPI } from '../../utils';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

// Splash Screen
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(100, p + 7)), 100);
    const timer = setTimeout(onDone, 1500);
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

// Onboarding
export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { icon: '🎴', title: 'Play Exciting Games', desc: '6+ thrilling games with real rewards', features: ['Color Prediction, Slots, Plane & more', 'Real-time outcomes', 'Fair play guaranteed'] },
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

// Home Screen
export function HomeScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  const [onlineCount] = useState(() => Math.floor(Math.random() * 5000) + 8000);
  const games = [
    { id: 'color', icon: '🎨', name: 'Color Prediction', badge: 'NEW', color: 'from-red-500 to-pink-600' },
    { id: 'slots', icon: '🎰', name: "Joker's Fortune", badge: 'HOT', color: 'from-purple-600 to-purple-900' },
    { id: 'crash', icon: '✈️', name: 'Aviator Plane', badge: '🔥', color: 'from-blue-600 to-blue-900' },
    { id: 'mines', icon: '💎', name: 'Diamond Mines', badge: 'TOP', color: 'from-emerald-600 to-emerald-900' },
    { id: 'dice', icon: '🎲', name: 'Lucky Dice', badge: '', color: 'from-amber-600 to-amber-900' },
    { id: 'wheel', icon: '🎡', name: 'Lucky Wheel', badge: '🎁', color: 'from-pink-600 to-pink-900' },
  ];

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <Crown className="w-7 h-7 text-[#FFC93D]" />
          <span className="font-logo text-lg font-black text-gold-gradient">LEGACY WIN</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
      <div className="px-4 pt-4 space-y-5">
        <div className="bg-gradient-to-br from-[#1a0a2e] via-[#2a1a4e] to-[#1a0a2e] rounded-3xl p-6 border-2 border-[#FFC93D]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC93D]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-purple-300 uppercase">Welcome back,</p>
                <p className="text-xl font-black text-white mt-1">{user?.name || 'Player'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC93D] to-[#D4A017] flex items-center justify-center text-2xl shadow-lg">
                👤
              </div>
            </div>
            <div className="bg-black/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400 uppercase">Wallet Balance</p>
              </div>
              <p className="text-4xl font-black font-mono text-[#FFC93D] mb-4">{formatCurrency(wallet?.balance || 0)}</p>
              <div className="flex gap-3">
                <button onClick={() => navigate('deposit')} className="flex-1 btn-gold py-3 text-sm font-bold flex items-center justify-center gap-2">
                  <ArrowDownLeft className="w-4 h-4" /> Deposit
                </button>
                <button onClick={() => navigate('withdraw')} className="flex-1 bg-white/10 border border-white/20 rounded-xl py-3 text-sm font-bold text-white flex items-center justify-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Gift, label: 'Bonus', action: () => navigate('bonus'), color: 'text-pink-400' },
            { icon: History, label: 'History', action: () => navigate('history'), color: 'text-blue-400' },
            { icon: Users, label: 'Invite', action: () => navigate('invite'), color: 'text-green-400' },
            { icon: Star, label: 'VIP', action: () => navigate('vip'), color: 'text-yellow-400' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 p-3 bg-[#141414] border border-[#2A2A2A] rounded-2xl active:scale-95 transition-transform">
                <Icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
              </button>
            );
          })}
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
      </div>
    </div>
  );
}

// Wallet Screen
export function WalletScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const menu = [
    { icon: History, label: 'Transaction History', action: () => navigate('history'), color: 'text-blue-400' },
    { icon: Gift, label: 'Bonus & Offers', action: () => navigate('bonus'), color: 'text-pink-400' },
    { icon: CreditCard, label: 'Payment Methods', action: () => {}, color: 'text-green-400' },
  ];
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Wallet</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC93D]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <p className="text-xs text-purple-200 uppercase">Available Balance</p>
            <p className="text-3xl font-black font-mono text-white mt-2">{formatCurrency(wallet?.balance || 0)}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate('deposit')} className="flex-1 btn-gold text-xs py-3 flex items-center justify-center gap-2">
                <ArrowDownLeft className="w-4 h-4" /> Deposit
              </button>
              <button onClick={() => navigate('withdraw')} className="flex-1 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-xs py-3 flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Withdraw
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={item.action} className="flex items-center justify-between w-full py-4 px-4 border-b border-[#2A2A2A] last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Withdraw Screen
export function WithdrawScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [holderName, setHolderName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const amt = parseInt(amount) || 0;

  const handleWithdraw = () => {
    setError('');
    if (amt < state.settings.minWithdraw) { setError(`Minimum withdrawal is ₹${state.settings.minWithdraw}`); playSound('loss'); return; }
    if (amt > (wallet?.balance || 0)) { setError('Insufficient balance'); playSound('loss'); return; }
    if (!validateUPI(upiId)) { setError('Enter valid UPI ID'); playSound('loss'); return; }
    if (!holderName.trim()) { setError('Enter account holder name'); playSound('loss'); return; }
    if (pin.length !== 4) { setError('Enter 4-digit PIN'); playSound('loss'); return; }

    playSound('click');
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, -amt);
      ns = addTransaction(ns, { uid: prev.session!, type: 'withdraw', amount: -amt, description: `Withdraw to ${upiId}`, status: 'pending' });
      return ns;
    });
    playSound('cashout');
    alert('Withdrawal requested! Processing in 10-30 minutes.');
    navigate('home');
  };

  return (
    <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('wallet')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Withdraw</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-purple-gradient rounded-2xl p-5 text-center">
          <p className="text-xs text-purple-200">Available</p>
          <p className="text-3xl font-black font-mono text-white mt-2">{formatCurrency(wallet?.balance || 0)}</p>
        </div>
        {error && <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 text-red-400 text-xs">{error}</div>}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#FFC93D]">₹</span>
          <input type="number" placeholder="Amount (min ₹110)" value={amount} onChange={e => setAmount(e.target.value)} className="input-field pl-12 text-xl font-mono font-bold" />
        </div>
        <input type="text" placeholder="UPI ID (e.g. name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} className="input-field" />
        <input type="text" placeholder="Account Holder Name" value={holderName} onChange={e => setHolderName(e.target.value)} className="input-field" />
        <input type="password" placeholder="4-digit PIN" value={pin} onChange={e => setPin(e.target.value.slice(0, 4))} className="input-field text-center tracking-[12px]" maxLength={4} />
        <button onClick={handleWithdraw} className="btn-red w-full">Withdraw</button>
      </div>
    </div>
  );
}

// History Screen
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
              <span className={`font-bold font-mono text-sm ${tx.amount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Bonus Screen
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
    setState(prev => {
      let ns = updateBalance(prev, uid, reward);
      ns = addTransaction(ns, { uid, type: 'bonus', amount: reward, description: `Day ${streak + 1} Attendance`, status: 'completed' });
      ns = { ...ns, attendance: { ...ns.attendance, [uid]: { lastClaim: Date.now(), streak } } };
      return ns;
    });
    confetti({ particleCount: 30, spread: 50 });
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
              <div key={i} className={`text-center p-1.5 rounded-lg text-[10px] font-bold ${i < attendance.streak ? 'bg-green-900/30 text-[#22C55E]' : i === attendance.streak && canClaim ? 'bg-[#FFC93D]/30 text-[#FFC93D]' : 'bg-white/10 text-white/40'}`}>
                D{i+1}<br/>₹{r}
              </div>
            ))}
          </div>
          <button onClick={handleClaim} disabled={!canClaim} className={`mt-3 w-full py-3 rounded-xl font-bold text-sm ${canClaim ? 'btn-gold' : 'bg-gray-700 text-gray-400'}`}>
            {canClaim ? '✓ Claim Today' : '✓ Claimed Today'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Screen
export function ProfileScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const wallet = getCurrentWallet(state);
  if (!user) return null;
  const menu = [
    { icon: Star, label: 'VIP Level', sub: `Level ${user.vipLevel}`, action: () => navigate('vip'), color: 'text-yellow-400' },
    { icon: Gift, label: 'My Bonuses', action: () => navigate('bonus'), color: 'text-pink-400' },
    { icon: History, label: 'Transactions', action: () => navigate('history'), color: 'text-blue-400' },
    { icon: Settings, label: 'Settings', action: () => navigate('settings'), color: 'text-gray-400' },
    { icon: HelpCircle, label: 'Support', action: () => navigate('support'), color: 'text-green-400' },
  ];
  return (
    <div className="pb-24 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-6 pt-12 safe-top relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC93D]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFE58F] to-[#D4A017] flex items-center justify-center border-3 border-[#FFC93D] shadow-xl">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{user.name}</h2>
              <p className="text-xs text-purple-200 font-mono mt-1">UID: {user.uid}</p>
              <p className="text-[10px] text-purple-300">Invite: {user.inviteCode}</p>
            </div>
          </div>
          <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wallet className="w-4 h-4 text-[#FFC93D]" />
                  <p className="text-2xl font-black font-mono text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</p>
                </div>
                <p className="text-[10px] text-purple-200">Balance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black font-mono text-white">{user.totalBets}</p>
                <p className="text-[10px] text-purple-200 mt-1">Total Bets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black font-mono text-[#10B981]">{user.totalWins}</p>
                <p className="text-[10px] text-purple-200 mt-1">Wins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} onClick={item.action} className="flex items-center justify-between w-full py-4 px-4 border-b border-[#2A2A2A] last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    {item.sub && <p className="text-[10px] text-gray-500">{item.sub}</p>}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            );
          })}
        </div>
        <button onClick={() => { if (confirm('Logout?')) { setState(prev => ({ ...prev, session: null })); window.location.reload(); } }} className="w-full py-4 rounded-2xl bg-red-900/20 border-2 border-red-900/50 text-red-400 font-bold text-sm flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}

// VIP Screen
export function VipScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const user = getCurrentUser(state);
  const [claimedSalary, setClaimedSalary] = useState(false);
  const levels = [
    { name: 'Bronze', min: 0, salary: 10, color: 'from-amber-700 to-amber-900', perks: ['Daily salary ₹10', 'Basic support', '1% cashback'] },
    { name: 'Silver', min: 5000, salary: 50, color: 'from-gray-400 to-gray-600', perks: ['Daily salary ₹50', 'Priority support', '3% cashback'] },
    { name: 'Gold', min: 20000, salary: 150, color: 'from-yellow-400 to-yellow-600', perks: ['Daily salary ₹150', 'VIP support 24/7', '5% cashback'] },
    { name: 'Platinum', min: 50000, salary: 300, color: 'from-blue-400 to-blue-600', perks: ['Daily salary ₹300', 'Personal manager', '8% cashback'] },
    { name: 'Diamond', min: 100000, salary: 500, color: 'from-cyan-400 to-blue-500', perks: ['Daily salary ₹500', 'Dedicated manager', '10% cashback'] },
  ];
  const currentLevelIndex = Math.min((user?.vipLevel || 1) - 1, 4);
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[Math.min(currentLevelIndex + 1, 4)];
  const progress = ((user?.commissionPaid || 0) / (nextLevel.min || 1)) * 100;

  const handleClaimSalary = () => {
    if (claimedSalary) return;
    const salary = currentLevel.salary;
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, salary);
      ns = addTransaction(ns, { uid: prev.session!, type: 'bonus', amount: salary, description: `VIP ${currentLevel.name} Daily Salary`, status: 'completed' });
      return ns;
    });
    setClaimedSalary(true);
    playSound('win');
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">VIP Club</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className={`bg-gradient-to-br ${currentLevel.color} rounded-2xl p-5 text-center relative overflow-hidden shadow-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <Crown className="w-12 h-12 text-white mx-auto mb-2" />
            <p className="text-2xl font-black text-white">{currentLevel.name}</p>
            <p className="text-xs text-white/80 mt-1">Level {user?.vipLevel || 1}</p>
            <div className="w-full h-3 bg-black/30 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-[10px] text-white/80 mt-2">Commission: ₹{user?.commissionPaid?.toFixed(0) || 0} / ₹{nextLevel.min.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-4 border-2 border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-400 uppercase">Daily VIP Salary</p>
              <p className="text-2xl font-black text-white mt-1">₹{currentLevel.salary}</p>
            </div>
            <button onClick={handleClaimSalary} disabled={claimedSalary} className={`px-6 py-3 rounded-xl font-bold text-sm ${claimedSalary ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'}`}>
              {claimedSalary ? '✓ Claimed' : 'Claim Now'}
            </button>
          </div>
        </div>
        <div className="bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-[#FFC93D]" />
            <p className="text-sm font-bold text-white">Your Benefits</p>
          </div>
          <div className="space-y-2">
            {currentLevel.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-gray-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Screen
export function SettingsScreen({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <button onClick={() => navigate('profile')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>
      <div className="px-4 pt-3 space-y-4">
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Sound Effects</span>
            </div>
            <button onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } }))} className={`w-12 h-7 rounded-full transition-all ${state.settings.soundEnabled ? 'bg-purple-600' : 'bg-[#3A3A3A]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-all mx-1 ${state.settings.soundEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-4">
          <button onClick={() => { if (confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); } }} className="w-full flex items-center justify-center gap-2 py-3 text-red-400 font-bold text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

// Support Screen
export function SupportScreen({ navigate }: { navigate: (s: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How to deposit?', a: 'Go to Wallet > Deposit, enter amount, choose UPI/USDT, and complete payment.' },
    { q: 'Withdrawal time?', a: 'Withdrawals are processed within 10-30 minutes.' },
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
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1"><p className="text-sm font-bold text-white">Live Chat</p><p className="text-[10px] text-gray-500">Available 24/7</p></div>
          <button className="btn-gold text-xs py-2 px-4">Chat</button>
        </div>
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div><p className="text-sm font-bold text-white">Email Support</p><p className="text-[10px] text-gray-500">support@legacywin.com</p></div>
        </div>
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-4">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-bold text-gray-400 uppercase">FAQ</p>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[#2A2A2A] last:border-0">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && <p className="text-xs text-gray-400 pb-3">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Invite Screen
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
          <div className="mt-4 bg-white/10 rounded-xl p-3 relative z-10">
            <p className="text-xs text-purple-200">Your Invite Code</p>
            <p className="text-2xl font-black font-mono text-[#FFC93D] mt-1">{user?.inviteCode}</p>
          </div>
          <button onClick={handleCopy} className={`mt-4 w-full ${copied ? 'bg-[#22C55E]' : 'btn-gold'}`}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Activity Screen
export function ActivityScreen({ state, navigate }: { state: AppState; navigate: (s: string) => void }) {
  const recentBets = state.bets.filter(b => b.uid === state.session).slice(0, 10);
  return (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
        <h1 className="text-lg font-bold">Activity</h1>
      </div>
      <div className="px-4 pt-3 space-y-3">
        {recentBets.length === 0 ? <div className="text-center py-12 text-gray-500 text-sm">No bets yet</div> :
        recentBets.map(bet => (
          <div key={bet.id} className="card flex items-center justify-between">
            <div><p className="text-sm font-bold text-white">{bet.game}</p><p className="text-[10px] text-gray-500">{formatTime(bet.createdAt)}</p></div>
            <div className="text-right"><p className="text-xs text-gray-400">Bet: {formatCurrency(bet.amount)}</p><p className={`text-sm font-bold font-mono ${bet.result === 'win' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>{bet.result === 'win' ? `+${formatCurrency(bet.payout)}` : `-${formatCurrency(bet.amount)}`}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Games Lobby
export function GamesLobby({ navigate }: { navigate: (s: string) => void }) {
  const games = [
    { id: 'color', icon: '🎨', name: 'Color Prediction', badge: 'NEW', color: 'from-red-500 to-pink-600' },
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

// Admin Panel
export function AdminPanel({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const [tab, setTab] = useState('dashboard');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(state.adminSession);
  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-xl font-black text-white mb-2">Admin Panel</h2>
        <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field w-64 text-center mb-4" />
        <button onClick={() => { if (password === 'admin123') { setAuthenticated(true); setState(prev => ({ ...prev, adminSession: true })); } else playSound('loss'); }} className="btn-gold w-64">Enter</button>
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm mt-4">← Back</button>
      </div>
    );
  }
  const totalBalance = Object.values(state.wallets).reduce((s, w) => s + w.balance, 0);
  const totalCommission = state.bets.reduce((s, b) => s + b.commission, 0);
  return (
    <div className="pb-6 animate-fade-in min-h-screen bg-[#0A0A0A]">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-3"><button onClick={() => navigate('home')} className="text-xl">←</button><h1 className="text-lg font-bold">Admin Panel</h1></div>
        <button onClick={() => { setAuthenticated(false); setState(prev => ({ ...prev, adminSession: false })); }} className="text-xs text-red-400 font-bold">Logout</button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
        {['dashboard', 'users', 'withdrawals', 'games'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${tab === t ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      <div className="px-4 pt-2">
        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center"><p className="text-2xl font-black font-mono text-[#FFC93D]">{Object.keys(state.users).length}</p><p className="text-[10px] text-gray-500">Users</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono text-[#22C55E]">{formatCurrency(totalBalance)}</p><p className="text-[10px] text-gray-500">Balance</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono text-amber-400">{state.bets.length}</p><p className="text-[10px] text-gray-500">Bets</p></div>
            <div className="card text-center"><p className="text-2xl font-black font-mono text-purple-400">{formatCurrency(totalCommission)}</p><p className="text-[10px] text-gray-500">Commission</p></div>
          </div>
        )}
        {tab === 'users' && <div className="space-y-2">{Object.values(state.users).map(u => (
          <div key={u.uid} className="card flex items-center justify-between">
            <div><p className="text-sm font-bold text-white">{u.name}</p><p className="text-[10px] text-gray-500">UID: {u.uid}</p></div>
            <p className="text-sm font-bold font-mono text-[#FFC93D]">{formatCurrency(state.wallets[u.uid]?.balance || 0)}</p>
          </div>
        ))}</div>}
        {tab === 'withdrawals' && <div className="space-y-2">{state.withdrawals.length === 0 ? <p className="text-center text-gray-500 py-8">No withdrawals</p> :
          state.withdrawals.map(w => (
            <div key={w.id} className="card flex items-center justify-between">
              <div><p className="text-sm font-bold text-white">{formatCurrency(w.amount)}</p><p className="text-[10px] text-gray-500">{w.upiId}</p></div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${w.status === 'pending' ? 'bg-amber-900/30 text-amber-400' : w.status === 'approved' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{w.status}</span>
            </div>
          ))}</div>}
        {tab === 'games' && <div className="space-y-3">
          <div className="card text-center"><p className="text-xs text-gray-400">Total Bets</p><p className="text-2xl font-black font-mono text-[#FFC93D]">{state.bets.length}</p></div>
          <div className="card text-center"><p className="text-xs text-gray-400">Commission</p><p className="text-2xl font-black font-mono text-[#22C55E]">{formatCurrency(totalCommission)}</p></div>
        </div>}
      </div>
    </div>
  );
}
