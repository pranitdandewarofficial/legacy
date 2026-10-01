// Use crypto.randomUUID if available, fallback to manual generation
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface User {
  uid: string;
  memberId: string;
  name: string;
  phone: string;
  password: string;
  inviteCode: string;
  vipLevel: number;
  isGuest: boolean;
  createdAt: number;
  totalBets: number;
  totalWins: number;
  commissionPaid: number;
}

export interface Wallet {
  uid: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBet: number;
  totalWon: number;
}

export interface Transaction {
  id: string;
  uid: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'referral' | 'commission';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  createdAt: number;
  meta?: Record<string, string>;
}

export interface Deposit {
  id: string;
  uid: string;
  amount: number;
  method: 'upi' | 'usdt';
  utr?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Withdrawal {
  id: string;
  uid: string;
  amount: number;
  upiId: string;
  holderName: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: number;
}

export interface Bet {
  id: string;
  uid: string;
  game: string;
  amount: number;
  result: 'win' | 'loss';
  payout: number;
  commission: number;
  createdAt: number;
}

export interface AppState {
  users: Record<string, User>;
  wallets: Record<string, Wallet>;
  transactions: Transaction[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  bets: Bet[];
  attendance: Record<string, { lastClaim: number; streak: number }>;
  redeemedCodes: Record<string, string[]>;
  session: string | null;
  adminSession: boolean;
  settings: {
    soundEnabled: boolean;
    commissionRate: number;
    minDeposit: number;
    maxDeposit: number;
    minWithdraw: number;
    maxWithdraw: number;
    minBet: number;
    maxBet: number;
    welcomeBonus: number;
    referralBonus: number;
    upiVpa: string;
    usdtWallet: string;
  };
  onboarded: boolean;
}

const STORAGE_KEY = 'legacy_win_v1';

const defaultSettings = {
  soundEnabled: true,
  commissionRate: 0.02,
  minDeposit: 100,
  maxDeposit: 100000,
  minWithdraw: 110,
  maxWithdraw: 100000,
  minBet: 10,
  maxBet: 10000,
  welcomeBonus: 500,
  referralBonus: 50,
  upiVpa: 'legacywin@upi',
  usdtWallet: 'TN2Yx8kFqR3vZ5mW9pL4jH7nB6cA0dE1fG',
};

const defaultState: AppState = {
  users: {},
  wallets: {},
  transactions: [],
  deposits: [],
  withdrawals: [],
  bets: [],
  attendance: {},
  redeemedCodes: {},
  session: null,
  adminSession: false,
  settings: defaultSettings,
  onboarded: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...defaultState };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function generateUID(): string {
  const first = Math.random() > 0.5 ? '9' : '8';
  let rest = '';
  for (let i = 0; i < 9; i++) rest += Math.floor(Math.random() * 10);
  return first + rest;
}

export function generateMemberId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MEMBER';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function generateInviteCode(): string {
  let code = 'LW';
  for (let i = 0; i < 8; i++) code += Math.floor(Math.random() * 10);
  return code;
}

export function createUser(
  state: AppState,
  name: string,
  phone: string,
  password: string,
  isGuest: boolean = false
): AppState {
  const uid = generateUID();
  const user: User = {
    uid,
    memberId: generateMemberId(),
    name,
    phone,
    password,
    inviteCode: generateInviteCode(),
    vipLevel: 1,
    isGuest,
    createdAt: Date.now(),
    totalBets: 0,
    totalWins: 0,
    commissionPaid: 0,
  };
  const wallet: Wallet = {
    uid,
    balance: state.settings.welcomeBonus,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalBet: 0,
    totalWon: 0,
  };
  const bonusTx: Transaction = {
    id: generateId(),
    uid,
    type: 'bonus',
    amount: state.settings.welcomeBonus,
    description: 'Welcome Bonus',
    status: 'completed',
    createdAt: Date.now(),
  };
  return {
    ...state,
    users: { ...state.users, [uid]: user },
    wallets: { ...state.wallets, [uid]: wallet },
    transactions: [...state.transactions, bonusTx],
    session: uid,
  };
}

export function updateBalance(state: AppState, uid: string, delta: number): AppState {
  const wallet = state.wallets[uid];
  if (!wallet) return state;
  return {
    ...state,
    wallets: {
      ...state.wallets,
      [uid]: { ...wallet, balance: Math.round((wallet.balance + delta) * 100) / 100 },
    },
  };
}

export function addTransaction(state: AppState, tx: Omit<Transaction, 'id' | 'createdAt'>): AppState {
  const newTx: Transaction = { ...tx, id: generateId(), createdAt: Date.now() };
  return { ...state, transactions: [newTx, ...state.transactions] };
}

export function addBet(state: AppState, bet: Omit<Bet, 'id' | 'createdAt'>): AppState {
  const newBet: Bet = { ...bet, id: generateId(), createdAt: Date.now() };
  const commission = Math.round(bet.amount * state.settings.commissionRate * 100) / 100;
  const user = state.users[bet.uid];
  const wallet = state.wallets[bet.uid];
  if (!user || !wallet) return state;

  return {
    ...state,
    bets: [newBet, ...state.bets],
    users: {
      ...state.users,
      [bet.uid]: {
        ...user,
        totalBets: user.totalBets + 1,
        totalWins: user.totalWins + (bet.result === 'win' ? 1 : 0),
        commissionPaid: user.commissionPaid + commission,
      },
    },
    wallets: {
      ...state.wallets,
      [bet.uid]: {
        ...wallet,
        totalBet: wallet.totalBet + bet.amount,
        totalWon: wallet.totalWon + bet.payout,
      },
    },
  };
}

export function getCurrentUser(state: AppState): User | null {
  if (!state.session) return null;
  return state.users[state.session] || null;
}

export function getCurrentWallet(state: AppState): Wallet | null {
  if (!state.session) return null;
  return state.wallets[state.session] || null;
}

// Audio engine
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtx;
  } catch { return null; }
}

export function playSound(type: 'click' | 'win' | 'loss' | 'cashout' | 'spin' | 'tick' | 'fanfare' | 'explosion') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.1;

  switch (type) {
    case 'click':
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
      break;
    case 'win':
      osc.frequency.value = 523;
      osc.type = 'triangle';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 659; o2.type = 'triangle';
        g2.gain.value = 0.1;
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        o2.start(); o2.stop(ctx.currentTime + 0.3);
      }, 150);
      break;
    case 'loss':
      osc.frequency.value = 400;
      osc.type = 'sawtooth';
      gain.gain.value = 0.05;
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      break;
    case 'cashout':
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      break;
    case 'spin':
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(); osc.stop(ctx.currentTime + 0.02);
      break;
    case 'tick':
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.value = 0.03;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(); osc.stop(ctx.currentTime + 0.02);
      break;
    case 'fanfare':
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'triangle';
          g.gain.value = 0.1;
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          o.start(); o.stop(ctx.currentTime + 0.3);
        }, i * 200);
      });
      break;
    case 'explosion':
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.value = 0.1;
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      noise.start(); noise.stop(ctx.currentTime + 0.5);
      break;
  }
}

export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
