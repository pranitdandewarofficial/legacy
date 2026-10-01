// Main Store - State Management with localStorage persistence
import type { AppState, User, Wallet, Transaction, Bet } from './types';
import { DEFAULT_SETTINGS, generateUID, generateMemberId, generateInviteCode, generateId } from '../utils';

const STORAGE_KEY = 'legacy_win_v1';

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
  settings: DEFAULT_SETTINGS,
  onboarded: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
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
    transactions: [bonusTx, ...state.transactions],
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

// Re-export types
export type { AppState, User, Wallet, Transaction, Bet };
